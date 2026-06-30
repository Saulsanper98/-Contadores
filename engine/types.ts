import type { ManaIdentity } from '@/theme/colors';

export type { ManaIdentity };

export type PlayerId = string;

export type EliminationReason = 'life' | 'commander' | 'poison';

export type GameEventKind =
  | 'game_start'
  | 'turn_pass'
  | 'life_change'
  | 'commander_damage'
  | 'poison_change'
  | 'counter_change'
  | 'combat_resolved'
  | 'elimination'
  | 'revive'
  | 'monarch'
  | 'group_damage'
  | 'group_heal'
  | 'note'
  | 'dice_roll'
  | 'action';

export interface GameEvent {
  id: string;
  at: number;
  kind: GameEventKind;
  playerId?: PlayerId;
  targetId?: PlayerId;
  sourceId?: PlayerId;
  amount?: number;
  message: string;
  meta?: Record<string, unknown>;
}

export interface TurnState {
  activePlayerId: PlayerId | null;
  turnStartedAt: number;
  turnNumber: number;
  turnDurationsMs: Record<PlayerId, number>;
  gameStartedAt: number;
}

export interface GenericCounterDef {
  id: string;
  name: string;
  icon: string;
  presetId?: string;
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
  turn: TurnState;
  events: GameEvent[];
}
