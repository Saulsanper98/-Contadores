import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as {
    claimCode?: string;
    event: {
      id: string;
      at: number;
      kind: string;
      playerId?: string;
      targetId?: string;
      sourceId?: string;
      amount?: number;
      message: string;
      meta?: Record<string, unknown>;
    };
  };

  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (body.claimCode && game.claimCode !== body.claimCode) {
    return NextResponse.json({ error: 'Invalid claim code' }, { status: 403 });
  }

  const count = await prisma.gameEvent.count({ where: { gameId: id } });

  const created = await prisma.gameEvent.create({
    data: {
      id: body.event.id,
      gameId: id,
      at: new Date(body.event.at),
      kind: body.event.kind.toUpperCase(),
      playerId: body.event.playerId,
      targetId: body.event.targetId,
      sourceId: body.event.sourceId,
      amount: body.event.amount,
      message: body.event.message,
      meta: body.event.meta ? JSON.stringify(body.event.meta) : null,
      syncVersion: count + 1,
    },
  });

  return NextResponse.json(created);
}
