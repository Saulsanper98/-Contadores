export type PanelBounds = {
  playerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const HIT_PADDING = 10;

export function pointInPanel(
  x: number,
  y: number,
  panel: PanelBounds,
  padding = 0,
): boolean {
  return (
    x >= panel.x - padding &&
    x <= panel.x + panel.width + padding &&
    y >= panel.y - padding &&
    y <= panel.y + panel.height + padding
  );
}

export function findPanelAtPoint(
  bounds: PanelBounds[],
  x: number,
  y: number,
  excludeId?: string,
  padding = HIT_PADDING,
): string | null {
  for (let i = bounds.length - 1; i >= 0; i -= 1) {
    const panel = bounds[i];
    if (!panel || panel.playerId === excludeId) continue;
    if (pointInPanel(x, y, panel, padding)) {
      return panel.playerId;
    }
  }
  return null;
}

export function getPanelCenter(bounds: PanelBounds[], playerId: string) {
  const panel = bounds.find((b) => b.playerId === playerId);
  if (!panel) return { x: 0, y: 0 };
  return { x: panel.x + panel.width / 2, y: panel.y + panel.height / 2 };
}

/** Combat drag starts once the finger enters another player's panel. */
export function shouldBeginCombatDrag(
  bounds: PanelBounds[],
  sourceId: string,
  x: number,
  y: number,
  translationX: number,
  translationY: number,
  minDistance = 14,
): boolean {
  if (Math.hypot(translationX, translationY) < minDistance) return false;
  return findPanelAtPoint(bounds, x, y, sourceId) !== null;
}
