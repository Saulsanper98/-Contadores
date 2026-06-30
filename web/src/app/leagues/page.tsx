import Link from 'next/link';

import { prisma } from '@/lib/prisma';

export default async function LeaguesPage() {
  const leagues = await prisma.league.findMany({
    include: { playgroup: true, games: true },
  });

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/" className="text-cyan-400 text-sm">
          ← Inicio
        </Link>
        <h1 className="text-3xl font-bold">Leagues</h1>
        {leagues.length === 0 ? (
          <p className="text-slate-500">
            No hay ligas creadas. Crea una desde la API o el panel de admin.
          </p>
        ) : (
          <ul className="space-y-3">
            {leagues.map((league) => (
              <li key={league.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h2 className="font-semibold">{league.name}</h2>
                <p className="text-slate-400 text-sm">{league.playgroup.name}</p>
                <p className="text-sm mt-1">{league.games.length} partidas</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
