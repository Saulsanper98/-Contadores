import Link from 'next/link';

import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const games = await prisma.game.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
    include: { players: true },
  });

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <p className="text-indigo-400 text-sm tracking-widest uppercase">Playgroup Commander</p>
          <h1 className="text-4xl font-bold mt-2">Estadísticas en tiempo real</h1>
          <p className="text-slate-400 mt-2">
            Dashboard web para partidas sincronizadas desde la app móvil.
          </p>
        </header>

        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className="text-cyan-400 hover:underline">
            Dashboard
          </Link>
          <Link href="/leagues" className="text-cyan-400 hover:underline">
            Leagues
          </Link>
          <Link href="/rewind" className="text-cyan-400 hover:underline">
            Rewind
          </Link>
          <Link href="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </nav>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-4">Partidas recientes</h2>
          {games.length === 0 ? (
            <p className="text-slate-500">No hay partidas sincronizadas aún.</p>
          ) : (
            <ul className="space-y-3">
              {games.map((game) => (
                <li key={game.id}>
                  <Link
                    href={`/games/${game.id}`}
                    className="flex justify-between items-center rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5">
                    <span>
                      {game.players.length} jugadores · {game.status}
                      {game.claimCode ? ` · ${game.claimCode}` : ''}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {new Date(game.startedAt).toLocaleString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
