import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { scoreFromEvents } from '@/lib/playscore';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const game = await prisma.game.findUnique({
    where: { id },
    include: { players: true, events: { orderBy: { at: 'asc' } } },
  });
  if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const playscore = scoreFromEvents(
    game.events.map((e) => ({
      kind: e.kind,
      playerId: e.playerId,
      sourceId: e.sourceId,
    })),
  );

  return NextResponse.json({ ...game, playscore });
}
