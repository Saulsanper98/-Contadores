import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const games = await prisma.game.findMany({
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: { players: true, events: { take: 5, orderBy: { at: 'desc' } } },
  });
  return NextResponse.json(games);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    claimCode: string;
    playerCount: number;
    players: { name: string; seatIndex: number; isGuest: boolean }[];
  };

  const game = await prisma.game.create({
    data: {
      claimCode: body.claimCode,
      playerCount: body.playerCount,
      players: {
        create: body.players.map((p) => ({
          seatIndex: p.seatIndex,
          displayName: p.name,
          isGuest: p.isGuest,
        })),
      },
      events: {
        create: {
          kind: 'GAME_START',
          message: `Partida iniciada · ${body.playerCount} jugadores`,
        },
      },
    },
    include: { players: true },
  });

  return NextResponse.json({ id: game.id, claimCode: game.claimCode });
}
