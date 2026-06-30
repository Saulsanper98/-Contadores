import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = (await req.json()) as { claimCode: string; playerName: string; email?: string };
  const game = await prisma.game.findUnique({
    where: { claimCode: body.claimCode },
    include: { players: true },
  });
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

  const player = game.players.find(
    (p) => p.displayName.toLowerCase() === body.playerName.toLowerCase() && p.isGuest,
  );
  if (!player) return NextResponse.json({ error: 'Guest player not found' }, { status: 404 });

  return NextResponse.json({
    gameId: game.id,
    playerId: player.id,
    message: 'Partida reclamable — vincula tu cuenta en la app web',
    email: body.email,
  });
}
