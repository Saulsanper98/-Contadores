export type EffectKind =
  | 'damage'
  | 'heal'
  | 'commander'
  | 'poison'
  | 'elimination'
  | 'revive'
  | 'monarch'
  | 'groupDamage'
  | 'groupHeal';

export type PanelEffect = {
  id: number;
  playerId: string;
  kind: EffectKind;
  magnitude?: number;
};

export type GlobalEffect = {
  id: number;
  kind: 'groupDamage' | 'groupHeal' | 'groupSet';
  magnitude?: number;
};

export type PanelEffectInput = {
  playerId: string;
  kind: EffectKind;
  magnitude?: number;
};

export function lifePanelEffect(
  playerId: string,
  delta: number,
): PanelEffectInput | null {
  if (delta === 0) return null;
  return {
    playerId,
    kind: delta > 0 ? 'heal' : 'damage',
    magnitude: Math.abs(delta),
  };
}

export function combatPanelEffects(
  sourceId: string,
  targetId: string,
  amount: number,
  type: 'normal' | 'heal' | 'commander' | 'infect' | 'lifelink',
): PanelEffectInput[] {
  const magnitude = Math.abs(amount);
  switch (type) {
    case 'heal':
      return [{ playerId: targetId, kind: 'heal', magnitude }];
    case 'commander':
      return [{ playerId: targetId, kind: 'commander', magnitude }];
    case 'infect':
      return [{ playerId: targetId, kind: 'poison', magnitude }];
    case 'lifelink':
      return [
        { playerId: targetId, kind: 'damage', magnitude },
        { playerId: sourceId, kind: 'heal', magnitude },
      ];
    case 'normal':
    default:
      return [{ playerId: targetId, kind: 'damage', magnitude }];
  }
}

let effectCounter = 0;

export function nextEffectId(): number {
  effectCounter += 1;
  return effectCounter;
}

export function effectKindForLifeDelta(delta: number): EffectKind | null {
  if (delta > 0) return 'heal';
  if (delta < 0) return 'damage';
  return null;
}
