import type { GameEvent, GameState, PlayerId } from './types';

let eventCounter = 0;

export function nextEventId(): string {
  eventCounter += 1;
  return `evt-${Date.now()}-${eventCounter}`;
}

export function appendEvent(state: GameState, event: Omit<GameEvent, 'id' | 'at'>): GameState {
  const entry: GameEvent = {
    ...event,
    id: nextEventId(),
    at: Date.now(),
  };
  return {
    ...state,
    events: [...state.events, entry],
  };
}

export function playerName(state: GameState, playerId?: PlayerId | null): string {
  if (!playerId) return 'Mesa';
  return state.players.find((p) => p.id === playerId)?.name ?? 'Jugador';
}

export function formatEventTime(at: number, gameStartedAt: number): string {
  const offsetSec = Math.max(0, Math.floor((at - gameStartedAt) / 1000));
  const m = Math.floor(offsetSec / 60);
  const s = offsetSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
