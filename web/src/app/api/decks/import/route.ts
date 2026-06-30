import { NextResponse } from 'next/server';

import { fetchArchidektDeck } from '@/lib/archidekt';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = (await req.json()) as { url: string; userId: string };
  const deck = await fetchArchidektDeck(body.url);
  if (!deck) return NextResponse.json({ error: 'Could not import deck' }, { status: 400 });

  const saved = await prisma.deck.create({
    data: {
      userId: body.userId,
      name: deck.name,
      commanderName: deck.commanderName,
      colorIdentity: JSON.stringify(deck.colorIdentity),
      archidektUrl: body.url,
    },
  });

  return NextResponse.json(saved);
}
