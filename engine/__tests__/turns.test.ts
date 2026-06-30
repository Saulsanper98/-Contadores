import { createDefaultSetup, createGameFromSetup } from '@/engine';
import { normalizeGameState } from '@/engine/migrate';
import { getCurrentTurnElapsedMs, getNextActivePlayerId, passTurn } from '@/engine/turns';

describe('turn system', () => {
  const setup = createDefaultSetup(4);
  const base = normalizeGameState(createGameFromSetup(setup), Date.now());

  it('starts with first player active', () => {
    expect(base.turn.activePlayerId).toBe(base.players[0].id);
    expect(base.turn.turnNumber).toBe(1);
  });

  it('passes turn to next player and logs event', () => {
    const now = base.turn.turnStartedAt + 5000;
    const next = passTurn(base, now);

    expect(next.turn.turnNumber).toBe(2);
    expect(next.turn.activePlayerId).toBe(base.players[1].id);
    expect(next.turn.turnDurationsMs[base.players[0].id]).toBe(5000);
    expect(next.events[next.events.length - 1].kind).toBe('turn_pass');
  });

  it('skips eliminated players when passing turn', () => {
    let state = base;
    state = {
      ...state,
      players: state.players.map((p, i) =>
        i === 1 ? { ...p, isEliminated: true } : p,
      ),
    };

    const nextId = getNextActivePlayerId(state, state.players[0].id);
    expect(nextId).toBe(state.players[2].id);
  });

  it('tracks elapsed time for active player', () => {
    const now = base.turn.turnStartedAt + 3000;
    expect(getCurrentTurnElapsedMs(base, now)).toBe(3000);
  });
});
