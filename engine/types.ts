import type { ManaIdentity } from '@/theme/colors';

export type { ManaIdentity };

export type PlayerId = string;

export type EliminationReason = 'life' | 'commander' | 'poison';

export interface GenericCounterDef {
  id: string;
  name: string;
  icon: string;
}

export interface PlayerSetup {
  id: PlayerId;
  name: string;
  manaIdentity: ManaIdentity;
}

export interface GameSetup {
  playerCount: number;
  startingLife: number;
  players: PlayerSetup[];
  genericCounters: GenericCounterDef[];
}

/** Daño recibido del comandante de cada oponente (clave = id del oponente) */
export type CommanderDamageMap = Record<PlayerId, number>;

export interface GenericCounterState {
  defId: string;
  value: number;
}

export interface PlayerGameState {
  id: PlayerId;
  name: string;
  manaIdentity: ManaIdentity;
  life: number;
  poison: number;
  commanderDamageFrom: CommanderDamageMap;
  counters: GenericCounterState[];
  isEliminated: boolean;
  eliminationReason: EliminationReason | null;
}

export interface GameState {
  setup: GameSetup;
  players: PlayerGameState[];
  monarchPlayerId: PlayerId | null;
}
