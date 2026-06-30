import { getBoardGrid } from '@/engine/seatLayouts';

describe('seat layouts', () => {
  it('returns correct seat count for each player count', () => {
    for (const count of [2, 3, 4, 5, 6]) {
      expect(getBoardGrid(count).seats).toHaveLength(count);
    }
  });

  it('uses 180° rotation for top player in 2-player layout', () => {
    const grid = getBoardGrid(2);
    const top = grid.seats.find((s) => s.playerIndex === 1);
    expect(top?.rotation).toBe(180);
  });

  it('uses 0° rotation for bottom player in 2-player layout', () => {
    const grid = getBoardGrid(2);
    const bottom = grid.seats.find((s) => s.playerIndex === 0);
    expect(bottom?.rotation).toBe(0);
  });
});
