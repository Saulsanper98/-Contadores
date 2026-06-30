import { layout } from '@/theme/tokens';

import type { PlayerGameState } from './types';

export function getMaxCommanderDamage(player: PlayerGameState): number {
  const values = Object.values(player.commanderDamageFrom);
  return values.length === 0 ? 0 : Math.max(...values);
}

export function getTotalCommanderDamage(player: PlayerGameState): number {
  return Object.values(player.commanderDamageFrom).reduce((sum, v) => sum + v, 0);
}

export function isPoisonDanger(poison: number): boolean {
  return poison >= layout.poisonLethal - 2;
}

export function isCommanderDanger(player: PlayerGameState): boolean {
  return getMaxCommanderDamage(player) >= layout.commanderDamageLethal - 3;
}
