import {
  findPanelAtPoint,
  pointInPanel,
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
  it('finds panel at point with padding', () => {
    expect(findPanelAtPoint(bounds, 105, 50, 'a')).toBe('b');
    expect(findPanelAtPoint(bounds, 50, 50, 'a')).toBeNull();
  });

  it('starts combat when finger enters another panel in any direction', () => {
    expect(shouldBeginCombatDrag(bounds, 'a', 150, 50, 0, 40)).toBe(true);
    expect(shouldBeginCombatDrag(bounds, 'a', 50, 150, 0, 80)).toBe(true);
    expect(shouldBeginCombatDrag(bounds, 'a', 50, 40, 0, 30)).toBe(false);
  });

  it('pointInPanel respects bounds', () => {
    expect(pointInPanel(10, 10, bounds[0]!)).toBe(true);
    expect(pointInPanel(200, 200, bounds[0]!)).toBe(false);
  });
});
