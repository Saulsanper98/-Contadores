import Link from 'next/link';

import { prisma } from '@/lib/prisma';

export default async function RewindPage() {
  const games = await prisma.game.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { endedAt: 'desc' },
    take: 20,
    include: { players: true, events: { where: { kind: { in: ['KNOCKOUT', 'knockout', 'GAME_END', 'game_end'] } } } },
  });

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/" className="text-cyan-400 text-sm">
          ← Inicio
        </Link>
        <h1 className="text-3xl font-bold">Rewind — Resumen de stats</h1>
        <p className="text-slate-400">Últimas partidas completadas y momentos clave.</p>
        <ul className="space-y-4">
          {games.map((game) => (
            <li key={game.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between">
                <span className="font-semibold">{game.players.map((p) => p.displayName).join(', ')}</span>
                <Link href={`/games/${game.id}`} className="text-cyan-400 text-sm">
                  Ver →
                </Link>
              </div>
              <ul className="mt-2 text-sm text-slate-400">
                {game.events.map((e) => (
                  <li key={e.id}>· {e.message}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
