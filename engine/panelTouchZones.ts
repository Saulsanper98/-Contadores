export const PANEL_STRIP_WIDTH_RATIO = 0.23;

export type PanelTouchZone = 'left' | 'center' | 'right';

export function getPanelTouchZone(localX: number, panelWidth: number): PanelTouchZone {
  if (panelWidth <= 0) return 'center';
  const ratio = localX / panelWidth;
  if (ratio < PANEL_STRIP_WIDTH_RATIO) return 'left';
  if (ratio > 1 - PANEL_STRIP_WIDTH_RATIO) return 'right';
  return 'center';
}
