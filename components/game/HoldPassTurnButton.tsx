import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Canvas, Circle, Path, Skia } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { palette, typography } from '@/theme';

const HOLD_MS = 1100;
const SIZE = 52;
const RING_R = 21;
const CX = SIZE / 2;
const CY = SIZE / 2;

type HoldPassTurnButtonProps = {
  onPass: () => void;
};

export function HoldPassTurnButton({ onPass }: HoldPassTurnButtonProps) {
  const progress = useSharedValue(0);

  const ringPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const sweep = Math.max(0, Math.min(1, progress.value)) * 360;
    if (sweep <= 0) return path;
    path.addArc(
      { x: CX - RING_R, y: CY - RING_R, width: RING_R * 2, height: RING_R * 2 },
      -90,
      sweep,
    );
    return path;
  });

  const triggerPass = useCallback(() => {
    onPass();
  }, [onPass]);

  const gesture = Gesture.LongPress()
    .minDuration(HOLD_MS)
    .maxDistance(14)
    .onBegin(() => {
      progress.value = withTiming(1, { duration: HOLD_MS });
    })
    .onFinalize(() => {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 140 });
    })
    .onStart(() => {
      runOnJS(triggerPass)();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.wrap} accessibilityLabel="Mantén pulsado para pasar turno">
        <Canvas style={styles.canvas}>
          <Circle
            cx={CX}
            cy={CY}
            r={RING_R}
            style="stroke"
            strokeWidth={3}
            color="rgba(255, 255, 255, 0.18)"
          />
          <Path
            path={ringPath}
            style="stroke"
            strokeWidth={3.5}
            color={palette.accentSecondary}
            strokeCap="round"
          />
          <Circle cx={CX} cy={CY} r={RING_R - 6} color="rgba(99, 102, 241, 0.35)" />
        </Canvas>
        <Text style={styles.label}>Pasar</Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE + 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: SIZE,
    height: SIZE,
  },
  label: {
    marginTop: 2,
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: palette.textMuted,
  },
});
