import { layout } from '@/theme/tokens';

import type { EliminationReason, PlayerGameState } from './types';

export function getEliminationReason(player: PlayerGameState): EliminationReason | null {
  if (player.life <= 0) {
    return 'life';
  }

  if (player.poison >= layout.poisonLethal) {
    return 'poison';
  }

  for (const damage of Object.values(player.commanderDamageFrom)) {
    if (damage >= layout.commanderDamageLethal) {
      return 'commander';
    }
  }

  return null;
}

export function applyEliminationCheck(player: PlayerGameState): PlayerGameState {
  const reason = getEliminationReason(player);

  if (reason) {
    return {
      ...player,
      isEliminated: true,
      eliminationReason: reason,
    };
  }

  return {
    ...player,
    isEliminated: false,
    eliminationReason: null,
  };
}
