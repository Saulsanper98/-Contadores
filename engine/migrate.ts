import { createInitialTurnState } from './turns';
import type { GameState } from './types';
import { appendEvent } from './events';

export function normalizeGameState(state: GameState, fallbackStartedAt?: number): GameState {
  const startedAt =
    state.turn?.gameStartedAt ?? fallbackStartedAt ?? Date.now();

  const turn =
    state.turn ??
    createInitialTurnState(
      state.players.map((p) => ({ id: p.id, isEliminated: p.isEliminated })),
      startedAt,
    );

  const events = state.events ?? [];

  return {
    ...state,
    turn: {
      ...turn,
      gameStartedAt: turn.gameStartedAt ?? startedAt,
      turnDurationsMs: {
        ...Object.fromEntries(state.players.map((p) => [p.id, 0])),
        ...turn.turnDurationsMs,
      },
    },
    events,
  };
}

export function createGameStartState(state: GameState, startedAt: number): GameState {
  const normalized = normalizeGameState(state, startedAt);
  return appendEvent(
    {
      ...normalized,
      turn: createInitialTurnState(normalized.players, startedAt),
    },
    {
      kind: 'game_start',
      message: `Partida iniciada · ${normalized.players.length} jugadores`,
      meta: { playerCount: normalized.players.length },
    },
  );
}
