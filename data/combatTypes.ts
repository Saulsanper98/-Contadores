export type CombatDamageType = 'normal' | 'heal' | 'commander' | 'infect' | 'lifelink';

export const COMBAT_DAMAGE_TYPES: {
  id: CombatDamageType;
  label: string;
}[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'heal', label: 'Curación' },
  { id: 'commander', label: 'Comandante' },
  { id: 'infect', label: 'Infectar' },
  { id: 'lifelink', label: 'Vínculo vital' },
];
