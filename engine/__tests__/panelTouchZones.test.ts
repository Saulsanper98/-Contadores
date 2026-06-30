import { getPanelTouchZone, PANEL_STRIP_WIDTH_RATIO } from '../panelTouchZones';

describe('panelTouchZones', () => {
  it('maps x position to life strips and center', () => {
    const width = 300;
    expect(getPanelTouchZone(30, width)).toBe('left');
    expect(getPanelTouchZone(width * PANEL_STRIP_WIDTH_RATIO - 1, width)).toBe('left');
    expect(getPanelTouchZone(width / 2, width)).toBe('center');
    expect(getPanelTouchZone(width - 30, width)).toBe('right');
  });
});
