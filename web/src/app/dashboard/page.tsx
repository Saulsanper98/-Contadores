import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { calculateElo } from '@/lib/elo';

export default async function DashboardPage() {
  const games = await prisma.game.findMany({
    include: { events: true, players: true },
  });

  const totalGames = games.length;
  const completed = games.filter((g) => g.status === 'COMPLETED').length;
  const totalEvents = games.reduce((sum, g) => sum + g.events.length, 0);

  const knockouts = games.flatMap((g) =>
    g.events.filter((e) => e.kind === 'KNOCKOUT' || e.kind === 'knockout'),
  );

  const ratings = await prisma.eloRating.findMany({ orderBy: { rating: 'desc' }, take: 10 });

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/" className="text-cyan-400 text-sm">
          ← Inicio
        </Link>
        <h1 className="text-3xl font-bold">Player Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Partidas', value: totalGames },
            { label: 'Completadas', value: completed },
            { label: 'Eventos', value: totalEvents },
            { label: 'Knockouts', value: knockouts.length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-4">ELO Leaderboard</h2>
          {ratings.length === 0 ? (
            <p className="text-slate-500">Sin ratings aún. Ejemplo: {calculateElo(1500, 1500).winnerNew} tras victoria.</p>
          ) : (
            <ol className="space-y-2">
              {ratings.map((r, i) => (
                <li key={r.id} className="flex justify-between border-b border-white/5 py-2">
                  <span>
                    #{i + 1} {r.playerName}
                  </span>
                  <span className="font-mono text-cyan-400">{r.rating}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
