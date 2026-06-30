import { appendEvent } from './events';
import type { GameEventKind, GameState, PlayerId } from './types';

export function createInitialTurnState(
  players: { id: PlayerId; isEliminated?: boolean }[],
  startedAt: number,
): GameState['turn'] {
  const turnDurationsMs: Record<PlayerId, number> = {};
  for (const player of players) {
    turnDurationsMs[player.id] = 0;
  }

  const firstActive =
    players.find((p) => !p.isEliminated)?.id ?? players[0]?.id ?? null;

  return {
    activePlayerId: firstActive,
    turnStartedAt: startedAt,
    turnNumber: 1,
    turnDurationsMs,
    gameStartedAt: startedAt,
  };
}

export function getNextActivePlayerId(state: GameState, fromId: PlayerId): PlayerId | null {
  const { players } = state;
  const startIndex = players.findIndex((p) => p.id === fromId);
  if (startIndex < 0) return null;

  for (let step = 1; step <= players.length; step += 1) {
    const candidate = players[(startIndex + step) % players.length];
    if (!candidate.isEliminated) return candidate.id;
  }

  return fromId;
}

export function getCurrentTurnElapsedMs(state: GameState, now = Date.now()): number {
  if (!state.turn.turnStartedAt) return 0;
  return Math.max(0, now - state.turn.turnStartedAt);
}

export function getPlayerTurnTotalMs(state: GameState, playerId: PlayerId, now = Date.now()): number {
  const base = state.turn.turnDurationsMs[playerId] ?? 0;
  if (state.turn.activePlayerId === playerId) {
    return base + getCurrentTurnElapsedMs(state, now);
  }
  return base;
}

export function passTurn(state: GameState, now = Date.now()): GameState {
  const { activePlayerId, turnStartedAt, turnNumber, turnDurationsMs } = state.turn;
  if (!activePlayerId) return state;

  const elapsed = turnStartedAt ? Math.max(0, now - turnStartedAt) : 0;
  const updatedDurations = {
    ...turnDurationsMs,
    [activePlayerId]: (turnDurationsMs[activePlayerId] ?? 0) + elapsed,
  };

  const nextPlayerId = getNextActivePlayerId(state, activePlayerId);
  if (!nextPlayerId) return state;

  let next: GameState = {
    ...state,
    turn: {
      ...state.turn,
      activePlayerId: nextPlayerId,
      turnStartedAt: now,
      turnNumber: turnNumber + 1,
      turnDurationsMs: updatedDurations,
    },
  };

  return appendEvent(next, {
    kind: 'turn_pass',
    playerId: activePlayerId,
    targetId: nextPlayerId,
    message: `Turno de ${playerLabel(next, activePlayerId)} → ${playerLabel(next, nextPlayerId)}`,
    meta: { elapsedMs: elapsed, turnNumber: turnNumber + 1 },
  });
}

function playerLabel(state: GameState, playerId: PlayerId): string {
  return state.players.find((p) => p.id === playerId)?.name ?? 'Jugador';
}

export function setActivePlayer(state: GameState, playerId: PlayerId, now = Date.now()): GameState {
  if (state.turn.activePlayerId === playerId) return state;

  let next = state;
  if (state.turn.activePlayerId && state.turn.turnStartedAt) {
    const elapsed = now - state.turn.turnStartedAt;
    const activeId = state.turn.activePlayerId;
    next = {
      ...next,
      turn: {
        ...next.turn,
        turnDurationsMs: {
          ...next.turn.turnDurationsMs,
          [activeId]: (next.turn.turnDurationsMs[activeId] ?? 0) + elapsed,
        },
      },
    };
  }

  return {
    ...next,
    turn: {
      ...next.turn,
      activePlayerId: playerId,
      turnStartedAt: now,
    },
  };
}

export type EventLogInput = {
  kind: GameEventKind;
  playerId?: PlayerId;
  targetId?: PlayerId;
  sourceId?: PlayerId;
  amount?: number;
  message: string;
  meta?: Record<string, unknown>;
};

export function withEvent(state: GameState, event: EventLogInput): GameState {
  return appendEvent(state, event);
}
