import { combatPanelEffects, lifePanelEffect } from '@/animations/effects';

describe('combatPanelEffects', () => {
  it('uses heal kind for combat healing', () => {
    expect(combatPanelEffects('a', 'b', 3, 'heal')).toEqual([
      { playerId: 'b', kind: 'heal', magnitude: 3 },
    ]);
  });

  it('creates dual effects for lifelink', () => {
    expect(combatPanelEffects('a', 'b', 2, 'lifelink')).toEqual([
      { playerId: 'b', kind: 'damage', magnitude: 2 },
      { playerId: 'a', kind: 'heal', magnitude: 2 },
    ]);
  });

  it('maps life deltas to panel effects', () => {
    expect(lifePanelEffect('p1', -5)).toEqual({
      playerId: 'p1',
      kind: 'damage',
      magnitude: 5,
    });
    expect(lifePanelEffect('p1', 0)).toBeNull();
  });
});
