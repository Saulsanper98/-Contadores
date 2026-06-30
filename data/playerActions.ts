export type PlayerActionId =
  | 'pay-1'
  | 'pay-2'
  | 'heal-1'
  | 'heal-2'
  | 'damage-all'
  | 'damage-opponents'
  | 'drain'
  | 'poison-1'
  | 'monarch'
  | 'roll-d6'
  | 'roll-d20'
  | 'commander-damage'
  | 'revive'
  | 'eliminate';

export type PlayerActionDef = {
  id: PlayerActionId;
  label: string;
  icon: string;
  accent?: string;
};

export const PLAYER_ACTIONS: PlayerActionDef[] = [
  { id: 'pay-1', label: 'Pagar 1 vida', icon: '🩸' },
  { id: 'pay-2', label: 'Pagar 2 vidas', icon: '🩸' },
  { id: 'heal-1', label: 'Curar 1', icon: '💚' },
  { id: 'heal-2', label: 'Curar 2', icon: '💚' },
  { id: 'damage-opponents', label: 'Daño a oponentes', icon: '💥' },
  { id: 'damage-all', label: 'Daño a todos', icon: '☄' },
  { id: 'drain', label: 'Drenar 1', icon: '🫴' },
  { id: 'poison-1', label: '+1 veneno', icon: '☠' },
  { id: 'monarch', label: 'Monarca', icon: '👑' },
  { id: 'commander-damage', label: 'Daño comandante', icon: '⚔' },
  { id: 'roll-d6', label: 'Dado D6', icon: '🎲' },
  { id: 'roll-d20', label: 'Dado D20', icon: '🎲' },
  { id: 'eliminate', label: 'Eliminar', icon: '✕' },
  { id: 'revive', label: 'Revivir', icon: '↺' },
];
