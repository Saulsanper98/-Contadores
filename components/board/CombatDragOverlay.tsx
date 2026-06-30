import { StyleSheet, View } from 'react-native';
import { Canvas, DashPathEffect, Line, Path, Skia, vec } from '@shopify/react-native-skia';

import { palette } from '@/theme';

export type PanelBounds = {
  playerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CombatDragState = {
  sourceId: string;
  x: number;
  y: number;
  targetId: string | null;
} | null;

type BoardOrigin = { x: number; y: number };

type CombatDragOverlayProps = {
  drag: CombatDragState;
  panelBounds: PanelBounds[];
  boardOrigin: BoardOrigin;
};

export function findPanelAtPoint(
  bounds: PanelBounds[],
  x: number,
  y: number,
  excludeId?: string,
): string | null {
  for (const panel of bounds) {
    if (panel.playerId === excludeId) continue;
    if (
      x >= panel.x &&
      x <= panel.x + panel.width &&
      y >= panel.y &&
      y <= panel.y + panel.height
    ) {
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

function toLocal(point: { x: number; y: number }, origin: BoardOrigin) {
  return { x: point.x - origin.x, y: point.y - origin.y };
}

function buildArrowPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const tip = { x: to.x - ux * 14, y: to.y - uy * 14 };
  const left = {
    x: tip.x - uy * 9,
    y: tip.y + ux * 9,
  };
  const right = {
    x: tip.x + uy * 9,
    y: tip.y - ux * 9,
  };

  const path = Skia.Path.Make();
  path.moveTo(from.x, from.y);
  path.lineTo(tip.x, tip.y);
  path.moveTo(to.x, to.y);
  path.lineTo(left.x, left.y);
  path.moveTo(to.x, to.y);
  path.lineTo(right.x, right.y);
  return path;
}

export function CombatDragOverlay({
  drag,
  panelBounds,
  boardOrigin,
}: CombatDragOverlayProps) {
  if (!drag) return null;

  const sourceCenter = toLocal(getPanelCenter(panelBounds, drag.sourceId), boardOrigin);
  const finger = toLocal({ x: drag.x, y: drag.y }, boardOrigin);
  const targetCenter = drag.targetId
    ? toLocal(getPanelCenter(panelBounds, drag.targetId), boardOrigin)
    : finger;

  const endX = drag.targetId ? targetCenter.x : finger.x;
  const endY = drag.targetId ? targetCenter.y : finger.y;
  const locked = Boolean(drag.targetId);
  const lineColor = locked ? '#f87171' : 'rgba(255, 255, 255, 0.55)';
  const arrowPath = buildArrowPath(sourceCenter, { x: endX, y: endY });

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Line
          p1={vec(sourceCenter.x, sourceCenter.y)}
          p2={vec(endX, endY)}
          color={lineColor}
          strokeWidth={locked ? 3.5 : 2.5}
          style="stroke">
          <DashPathEffect intervals={[10, 8]} />
        </Line>
        <Path path={arrowPath} color={lineColor} style="stroke" strokeWidth={3} strokeCap="round" />
      </Canvas>

      <View
        style={[
          styles.sourceDot,
          {
            left: sourceCenter.x - 6,
            top: sourceCenter.y - 6,
          },
        ]}
      />

      {drag.targetId ? (
        <View
          style={[
            styles.targetRing,
            {
              left: targetCenter.x - 44,
              top: targetCenter.y - 44,
              width: 88,
              height: 88,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  sourceDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.textPrimary,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  targetRing: {
    position: 'absolute',
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: '#f87171',
    backgroundColor: 'rgba(248, 113, 113, 0.14)',
    shadowColor: '#f87171',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
});
