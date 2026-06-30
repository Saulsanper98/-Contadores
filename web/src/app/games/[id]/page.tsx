import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { scoreFromEvents } from '@/lib/playscore';

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await prisma.game.findUnique({
    where: { id },
    include: { players: true, events: { orderBy: { at: 'asc' } } },
  });

  if (!game) {
    return (
      <main className="min-h-screen bg-[#06090f] text-white p-8">
        <p>Partida no encontrada</p>
      </main>
    );
  }

  const damageByPlayer: Record<string, number> = {};
  for (const e of game.events) {
    if (e.kind.toLowerCase().includes('damage') || e.kind === 'LIFE_CHANGE') {
      const key = e.targetId ?? e.playerId ?? 'unknown';
      damageByPlayer[key] = (damageByPlayer[key] ?? 0) + Math.abs(e.amount ?? 0);
    }
  }

  const playscore = scoreFromEvents(
    game.events.map((e) => ({ kind: e.kind, playerId: e.playerId, sourceId: e.sourceId })),
  );

  const turnPasses = game.events.filter((e) => e.kind.toLowerCase() === 'turn_pass');

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/" className="text-cyan-400 text-sm">
          ← Inicio
        </Link>
        <h1 className="text-3xl font-bold">Game Dashboard</h1>
        <p className="text-slate-400">
          {game.players.length} jugadores · {game.status} · código {game.claimCode}
        </p>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold mb-2">Jugadores</h2>
            <ul className="space-y-1 text-sm">
              {game.players.map((p) => (
                <li key={p.id}>
                  {p.displayName}
                  {p.isGuest ? ' (invitado)' : ''} · asiento {p.seatIndex + 1}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold mb-2">Playscore</h2>
            <ul className="space-y-1 text-sm">
              {Object.entries(playscore).map(([name, pts]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span className="text-cyan-400">{pts}</span>
                </li>
              ))}
              {Object.keys(playscore).length === 0 ? (
                <li className="text-slate-500">Sin puntos aún</li>
              ) : null}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold mb-2">Timeline ({game.events.length} eventos · {turnPasses.length} turnos)</h2>
          <ul className="max-h-96 overflow-y-auto space-y-2 text-sm">
            {game.events.map((e) => (
              <li key={e.id} className="border-b border-white/5 py-1">
                <span className="text-slate-500">{new Date(e.at).toLocaleTimeString()}</span>{' '}
                {e.message}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
