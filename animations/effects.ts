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
};

export type GlobalEffect = {
  id: number;
  kind: 'groupDamage' | 'groupHeal' | 'groupSet';
};

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
