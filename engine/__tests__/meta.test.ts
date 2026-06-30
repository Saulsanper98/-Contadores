import { createDefaultSetup, createGameFromSetup } from '@/engine';
import { normalizeGameState } from '@/engine/migrate';
import { endGame, markPlayerDamaged, recordFirstBlood, recordKnockout } from '@/engine/meta';

describe('game meta tracking', () => {
  const base = normalizeGameState(createGameFromSetup(createDefaultSetup(4)), Date.now());

  it('records first blood once', () => {
    const p1 = base.players[1].id;
    let state = markPlayerDamaged(base, p1);
    expect(state.meta.firstBloodPlayerId).toBe(p1);
    state = markPlayerDamaged(state, base.players[2].id);
    expect(state.meta.firstBloodPlayerId).toBe(p1);
  });

  it('records knockout with killer', () => {
    const victim = base.players[2].id;
    const killer = base.players[0].id;
    const state = recordKnockout(base, victim, 'commander', killer);
    expect(state.meta.knockouts).toHaveLength(1);
    expect(state.players.find((p) => p.id === victim)?.eliminatedBy).toBe(killer);
  });

  it('ends game with winner', () => {
    const winner = base.players[0].id;
    const state = endGame(base, winner, 'combat');
    expect(state.meta.status).toBe('completed');
    expect(state.meta.winnerId).toBe(winner);
  });
});
