import {
  findPanelAtPoint,
  pointInPanel,
  resolveCombatTarget,
  shouldBeginCombatDrag,
  type PanelBounds,
} from '../combatHitTest';

const bounds: PanelBounds[] = [
  { playerId: 'a', x: 0, y: 0, width: 100, height: 100 },
  { playerId: 'b', x: 100, y: 0, width: 100, height: 100 },
  { playerId: 'c', x: 0, y: 100, width: 100, height: 100 },
  { playerId: 'd', x: 100, y: 100, width: 100, height: 100 },
];

describe('combatHitTest', () => {
  it('finds panel at point inside container', () => {
    expect(findPanelAtPoint(bounds, 150, 50, 'a')).toBe('b');
    expect(findPanelAtPoint(bounds, 50, 50, 'a')).toBeNull();
  });

  it('starts combat drag after min distance from anywhere on panel', () => {
    expect(shouldBeginCombatDrag(0, 7)).toBe(false);
    expect(shouldBeginCombatDrag(0, 8)).toBe(true);
    expect(shouldBeginCombatDrag(15, 15)).toBe(true);
  });

  it('resolves target anywhere inside opponent container', () => {
    expect(resolveCombatTarget(bounds, 'a', 110, 10, null)).toBe('b');
    expect(resolveCombatTarget(bounds, 'a', 199, 99, null)).toBe('b');
    expect(resolveCombatTarget(bounds, 'a', 50, 50, 'b')).toBe('b');
  });

  it('pointInPanel respects exact bounds', () => {
    expect(pointInPanel(10, 10, bounds[0]!)).toBe(true);
    expect(pointInPanel(200, 200, bounds[0]!)).toBe(false);
  });
});
