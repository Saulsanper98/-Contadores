import { appendEvent } from './events';
import type {
  EliminationReason,
  GameMeta,
  GameState,
  KnockoutRecord,
  PlayerId,
  WinCondition,
} from './types';

let knockoutCounter = 0;

export function createInitialMeta(): GameMeta {
  return {
    firstBloodPlayerId: null,
    firstBloodAt: null,
    knockouts: [],
    winnerId: null,
    winCondition: null,
    status: 'in_progress',
    remoteGameId: null,
    claimCode: null,
  };
}

export function generateClaimCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function recordFirstBlood(
  state: GameState,
  victimId: PlayerId,
  at = Date.now(),
): GameState {
  if (state.meta.firstBloodPlayerId) return state;

  const next: GameState = {
    ...state,
    meta: {
      ...state.meta,
      firstBloodPlayerId: victimId,
      firstBloodAt: at,
    },
    players: state.players.map((p) =>
      p.id === victimId ? { ...p, hasReceivedDamage: true } : p,
    ),
  };

  const victim = state.players.find((p) => p.id === victimId);
  return appendEvent(next, {
    kind: 'first_blood',
    playerId: victimId,
    message: `🩸 First blood: ${victim?.name ?? 'Jugador'}`,
  });
}

export function markPlayerDamaged(state: GameState, playerId: PlayerId): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.hasReceivedDamage) return state;

  let next: GameState = {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, hasReceivedDamage: true } : p,
    ),
  };

  if (!next.meta.firstBloodPlayerId) {
    next = recordFirstBlood(next, playerId);
  }

  return next;
}

export function recordKnockout(
  state: GameState,
  victimId: PlayerId,
  reason: EliminationReason,
  killerId?: PlayerId,
  at = Date.now(),
): GameState {
  if (state.meta.knockouts.some((k) => k.victimId === victimId)) return state;

  knockoutCounter += 1;
  const record: KnockoutRecord = {
    id: `ko-${knockoutCounter}`,
    victimId,
    killerId,
    reason,
    at,
    turnNumber: state.turn.turnNumber,
  };

  const victim = state.players.find((p) => p.id === victimId);
  const killer = killerId ? state.players.find((p) => p.id === killerId) : null;
  const killerText = killer ? ` · eliminado por ${killer.name}` : '';

  let next: GameState = {
    ...state,
    meta: {
      ...state.meta,
      knockouts: [...state.meta.knockouts, record],
    },
    players: state.players.map((p) =>
      p.id === victimId ? { ...p, eliminatedBy: killerId ?? null } : p,
    ),
  };

  return appendEvent(next, {
    kind: 'knockout',
    playerId: victimId,
    sourceId: killerId,
    message: `💀 ${victim?.name ?? 'Jugador'} eliminado (${reason})${killerText}`,
    meta: { reason, turnNumber: state.turn.turnNumber },
  });
}

export function checkAutoWinner(state: GameState): GameState {
  if (state.meta.status === 'completed') return state;

  const alive = state.players.filter((p) => !p.isEliminated);
  if (alive.length !== 1) return state;

  return endGame(state, alive[0].id, inferWinCondition(alive[0], state));
}

function inferWinCondition(winner: GameState['players'][0], state: GameState): WinCondition {
  const lastKo = state.meta.knockouts[state.meta.knockouts.length - 1];
  if (lastKo?.reason === 'commander') return 'commander';
  if (lastKo?.reason === 'poison') return 'poison';
  return 'combat';
}

export function endGame(
  state: GameState,
  winnerId: PlayerId,
  winCondition: WinCondition,
): GameState {
  const winner = state.players.find((p) => p.id === winnerId);
  let next: GameState = {
    ...state,
    meta: {
      ...state.meta,
      winnerId,
      winCondition,
      status: 'completed',
    },
  };

  return appendEvent(next, {
    kind: 'game_end',
    playerId: winnerId,
    message: `🏆 ${winner?.name ?? 'Jugador'} gana la partida (${winCondition})`,
    meta: { winCondition },
  });
}

export function adjustMulligans(state: GameState, playerId: PlayerId, delta: number): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, mulligans: Math.max(0, p.mulligans + delta) } : p,
    ),
  };
}
