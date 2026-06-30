import { StyleSheet, View } from 'react-native';
import { Canvas, Line, vec } from '@shopify/react-native-skia';

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

type CombatDragOverlayProps = {
  drag: CombatDragState;
  panelBounds: PanelBounds[];
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

export function CombatDragOverlay({ drag, panelBounds }: CombatDragOverlayProps) {
  if (!drag) return null;

  const sourceCenter = getPanelCenter(panelBounds, drag.sourceId);
  const targetCenter = drag.targetId
    ? getPanelCenter(panelBounds, drag.targetId)
    : { x: drag.x, y: drag.y };

  const endX = drag.targetId ? targetCenter.x : drag.x;
  const endY = drag.targetId ? targetCenter.y : drag.y;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Line
          p1={vec(sourceCenter.x, sourceCenter.y)}
          p2={vec(endX, endY)}
          color={drag.targetId ? palette.accentSecondary : palette.textMuted}
          strokeWidth={drag.targetId ? 3 : 2}
          style="stroke"
        />
      </Canvas>
      {drag.targetId ? (
        <View
          style={[
            styles.targetRing,
            {
              left: targetCenter.x - 40,
              top: targetCenter.y - 40,
              width: 80,
              height: 80,
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
  targetRing: {
    position: 'absolute',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: palette.accentSecondary,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
});
