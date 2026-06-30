import { layout } from '@/theme/tokens';

import { applyEliminationCheck } from './elimination';
import type {
  GameSetup,
  GameState,
  GenericCounterDef,
  ManaIdentity,
  PlayerGameState,
  PlayerId,
  PlayerSetup,
} from './types';

const DEFAULT_IDENTITIES: ManaIdentity[] = [
  'white',
  'blue',
  'black',
  'red',
  'green',
  'multicolor',
];

export function createPlayerId(index: number): PlayerId {
  return `player-${index}`;
}

export function createDefaultPlayers(count: number): PlayerSetup[] {
  return Array.from({ length: count }, (_, index) => ({
    id: createPlayerId(index),
    name: `Jugador ${index + 1}`,
    manaIdentity: DEFAULT_IDENTITIES[index % DEFAULT_IDENTITIES.length],
  }));
}

export function createDefaultSetup(playerCount = 4): GameSetup {
  const count = clampPlayerCount(playerCount);

  return {
    playerCount: count,
    startingLife: layout.defaultStartingLife,
    players: createDefaultPlayers(count),
    genericCounters: [],
  };
}

export function clampPlayerCount(count: number): number {
  return Math.min(layout.maxPlayerCount, Math.max(layout.minPlayerCount, count));
}

export function resizePlayers(
  players: PlayerSetup[],
  newCount: number,
): PlayerSetup[] {
  const count = clampPlayerCount(newCount);

  if (players.length === count) {
    return players;
  }

  if (players.length > count) {
    return players.slice(0, count);
  }

  const additional = createDefaultPlayers(count).slice(players.length);
  return [...players, ...additional];
}

export function createGameFromSetup(setup: GameSetup): GameState {
  const normalized: GameSetup = {
    ...setup,
    playerCount: clampPlayerCount(setup.playerCount),
    players: resizePlayers(setup.players, setup.playerCount),
    startingLife: Math.max(1, setup.startingLife),
  };

  const players: PlayerGameState[] = normalized.players.map((player) => ({
    id: player.id,
    name: player.name,
    manaIdentity: player.manaIdentity,
    life: normalized.startingLife,
    poison: 0,
    commanderDamageFrom: {},
    counters: normalized.genericCounters.map((counter) => ({
      defId: counter.id,
      value: 0,
    })),
    isEliminated: false,
    eliminationReason: null,
  }));

  return {
    setup: normalized,
    players,
    monarchPlayerId: null,
  };
}

function updatePlayer(
  state: GameState,
  playerId: PlayerId,
  updater: (player: PlayerGameState) => PlayerGameState,
): GameState {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? updater(player) : player,
    ),
  };
}

function mapActivePlayers(
  state: GameState,
  mapper: (player: PlayerGameState) => PlayerGameState,
): GameState {
  return {
    ...state,
    players: state.players.map((player) => mapper(player)),
  };
}

export function adjustLife(
  state: GameState,
  playerId: PlayerId,
  delta: number,
): GameState {
  return updatePlayer(state, playerId, (player) =>
    applyEliminationCheck({
      ...player,
      life: player.life + delta,
    }),
  );
}

export function applyCommanderDamage(
  state: GameState,
  targetId: PlayerId,
  sourceOpponentId: PlayerId,
  amount: number,
): GameState {
  if (targetId === sourceOpponentId || amount === 0) {
    return state;
  }

  return updatePlayer(state, targetId, (player) => {
    const previous = player.commanderDamageFrom[sourceOpponentId] ?? 0;
    const nextDamage = Math.max(0, previous + amount);

    return applyEliminationCheck({
      ...player,
      life: player.life - amount,
      commanderDamageFrom: {
        ...player.commanderDamageFrom,
        [sourceOpponentId]: nextDamage,
      },
    });
  });
}

export function adjustPoison(
  state: GameState,
  playerId: PlayerId,
  delta: number,
): GameState {
  return updatePlayer(state, playerId, (player) =>
    applyEliminationCheck({
      ...player,
      poison: Math.max(0, player.poison + delta),
    }),
  );
}

export function adjustGenericCounter(
  state: GameState,
  playerId: PlayerId,
  counterDefId: string,
  delta: number,
): GameState {
  return updatePlayer(state, playerId, (player) => ({
    ...player,
    counters: player.counters.map((counter) =>
      counter.defId === counterDefId
        ? { ...counter, value: Math.max(0, counter.value + delta) }
        : counter,
    ),
  }));
}

export function setMonarch(
  state: GameState,
  playerId: PlayerId | null,
): GameState {
  if (playerId === null) {
    return { ...state, monarchPlayerId: null };
  }

  const exists = state.players.some((player) => player.id === playerId);
  return exists ? { ...state, monarchPlayerId: playerId } : state;
}

export function eliminatePlayer(
  state: GameState,
  playerId: PlayerId,
  reason: PlayerGameState['eliminationReason'] = 'life',
): GameState {
  return updatePlayer(state, playerId, (player) => ({
    ...player,
    isEliminated: true,
    eliminationReason: reason,
  }));
}

export function revivePlayer(state: GameState, playerId: PlayerId): GameState {
  return updatePlayer(state, playerId, (player) =>
    applyEliminationCheck({
      ...player,
      isEliminated: false,
      eliminationReason: null,
    }),
  );
}

export function damageAll(state: GameState, amount: number): GameState {
  return mapActivePlayers(state, (player) =>
    applyEliminationCheck({
      ...player,
      life: player.life - amount,
    }),
  );
}

export function damageOthers(
  state: GameState,
  sourceId: PlayerId,
  amount: number,
): GameState {
  return mapActivePlayers(state, (player) => {
    if (player.id === sourceId) return player;
    return applyEliminationCheck({
      ...player,
      life: player.life - amount,
    });
  });
}

export function drainOthers(
  state: GameState,
  sourceId: PlayerId,
  amount: number,
): GameState {
  const opponentCount = state.players.filter((player) => player.id !== sourceId).length;
  const damaged = damageOthers(state, sourceId, amount);
  return adjustLife(damaged, sourceId, amount * opponentCount);
}

export function healAll(state: GameState, amount: number): GameState {
  return mapActivePlayers(state, (player) =>
    applyEliminationCheck({
      ...player,
      life: player.life + amount,
    }),
  );
}

export function setAllLife(state: GameState, life: number): GameState {
  const value = Math.max(0, life);

  return mapActivePlayers(state, (player) =>
    applyEliminationCheck({
      ...player,
      life: value,
    }),
  );
}

export function addGenericCounterDef(
  setup: GameSetup,
  counter: GenericCounterDef,
): GameSetup {
  if (setup.genericCounters.some((item) => item.id === counter.id)) {
    return setup;
  }

  return {
    ...setup,
    genericCounters: [...setup.genericCounters, counter],
  };
}

export function removeGenericCounterDef(
  setup: GameSetup,
  counterId: string,
): GameSetup {
  return {
    ...setup,
    genericCounters: setup.genericCounters.filter((item) => item.id !== counterId),
  };
}

export function getPlayer(state: GameState, playerId: PlayerId): PlayerGameState | undefined {
  return state.players.find((player) => player.id === playerId);
}

export function getCommanderDamage(
  player: PlayerGameState,
  fromOpponentId: PlayerId,
): number {
  return player.commanderDamageFrom[fromOpponentId] ?? 0;
}
