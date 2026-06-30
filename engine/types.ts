import type { ManaIdentity } from '@/theme/colors';

export type { ManaIdentity };

export type PlayerId = string;

export type EliminationReason = 'life' | 'commander' | 'poison';

export type WinCondition = 'combat' | 'commander' | 'poison' | 'mill' | 'other';

export type TableLayoutId = 'center' | 'compact' | 'classic';

export type GameStatus = 'in_progress' | 'completed';

export type GameEventKind =
  | 'game_start'
  | 'turn_pass'
  | 'life_change'
  | 'commander_damage'
  | 'poison_change'
  | 'counter_change'
  | 'combat_resolved'
  | 'elimination'
  | 'knockout'
  | 'first_blood'
  | 'revive'
  | 'monarch'
  | 'group_damage'
  | 'group_heal'
  | 'note'
  | 'dice_roll'
  | 'mulligan'
  | 'win_condition'
  | 'game_end'
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

export interface KnockoutRecord {
  id: string;
  victimId: PlayerId;
  killerId?: PlayerId;
  reason: EliminationReason;
  at: number;
  turnNumber: number;
}

export interface GameMeta {
  firstBloodPlayerId: PlayerId | null;
  firstBloodAt: number | null;
  knockouts: KnockoutRecord[];
  winnerId: PlayerId | null;
  winCondition: WinCondition | null;
  status: GameStatus;
  remoteGameId: string | null;
  claimCode: string | null;
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
  isGuest?: boolean;
  commanderName?: string;
  deckTheme?: string;
}

export interface GameSetup {
  playerCount: number;
  startingLife: number;
  players: PlayerSetup[];
  genericCounters: GenericCounterDef[];
  tableLayout: TableLayoutId;
}

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
  eliminatedBy: PlayerId | null;
  mulligans: number;
  isGuest: boolean;
  commanderName?: string;
  deckTheme?: string;
  hasReceivedDamage: boolean;
}

export interface GameState {
  setup: GameSetup;
  players: PlayerGameState[];
  monarchPlayerId: PlayerId | null;
  turn: TurnState;
  events: GameEvent[];
  meta: GameMeta;
}
