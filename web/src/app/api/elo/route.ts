import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const ratings = await prisma.eloRating.findMany({
    orderBy: { rating: 'desc' },
    take: 50,
  });
  return NextResponse.json(ratings);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    playgroupId: string;
    winner: string;
    loser: string;
    winnerRating?: number;
    loserRating?: number;
  };

  const { calculateElo } = await import('@/lib/elo');

  const winnerRow = await prisma.eloRating.upsert({
    where: { playgroupId_playerName: { playgroupId: body.playgroupId, playerName: body.winner } },
    create: { playgroupId: body.playgroupId, playerName: body.winner, rating: 1500, games: 0 },
    update: {},
  });

  const loserRow = await prisma.eloRating.upsert({
    where: { playgroupId_playerName: { playgroupId: body.playgroupId, playerName: body.loser } },
    create: { playgroupId: body.playgroupId, playerName: body.loser, rating: 1500, games: 0 },
    update: {},
  });

  const { winnerNew, loserNew } = calculateElo(winnerRow.rating, loserRow.rating);

  await prisma.eloRating.update({
    where: { id: winnerRow.id },
    data: { rating: winnerNew, games: { increment: 1 } },
  });
  await prisma.eloRating.update({
    where: { id: loserRow.id },
    data: { rating: loserNew, games: { increment: 1 } },
  });

  return NextResponse.json({ winnerNew, loserNew });
}
