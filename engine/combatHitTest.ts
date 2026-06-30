export type PanelBounds = {
  playerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Generous padding when locking onto a target during drag. */
const DRAG_HIT_PADDING = 6;

/** Full panel container — used on release so any point inside counts. */
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
  padding = 0,
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

/** Combat drag from the center zone — starts after a short movement. */
export function shouldBeginCombatDrag(
  translationX: number,
  translationY: number,
  minDistance = 10,
): boolean {
  return Math.hypot(translationX, translationY) >= minDistance;
}

/** Resolve target on release: full container, then last hovered target. */
export function resolveCombatTarget(
  bounds: PanelBounds[],
  sourceId: string,
  x: number,
  y: number,
  lastTargetId: string | null,
): string | null {
  const direct = findPanelAtPoint(bounds, x, y, sourceId, 0);
  if (direct) return direct;

  const padded = findPanelAtPoint(bounds, x, y, sourceId, DRAG_HIT_PADDING);
  if (padded) return padded;

  if (lastTargetId && lastTargetId !== sourceId) {
    const lastPanel = bounds.find((b) => b.playerId === lastTargetId);
    if (lastPanel) return lastTargetId;
  }

  return null;
}
