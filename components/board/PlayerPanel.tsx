import { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { FloatingDelta } from '@/components/board/FloatingDelta';
import { useLifeCounterGestures } from '@/hooks/useLifeCounterGestures';
import { manaColors, opacity, palette, radius, spacing, typography } from '@/theme';
import type { PlayerGameState } from '@/engine/types';

type PlayerPanelProps = {
  player: PlayerGameState;
  seatIndex: number;
  rotation: number;
  lifeFontSize: number;
  style?: object;
  onLifeChange: (playerId: string, delta: number) => void;
};

export function PlayerPanel({
  player,
  seatIndex,
  rotation,
  lifeFontSize,
  style,
  onLifeChange,
}: PlayerPanelProps) {
  const [panelHeight, setPanelHeight] = useState(0);
  const disabled = player.isEliminated;

  const onCommitDelta = useCallback(
    (delta: number) => {
      if (!disabled) {
        onLifeChange(player.id, delta);
      }
    },
    [disabled, onLifeChange, player.id],
  );

  const { gesture, floatingDelta } = useLifeCounterGestures({
    panelHeight,
    disabled,
    onCommitDelta,
  });

  const onLayout = (event: LayoutChangeEvent) => {
    setPanelHeight(event.nativeEvent.layout.height);
  };

  const accent = manaColors[player.manaIdentity];

  return (
    <View
      style={[
        styles.slot,
        style,
        disabled && styles.eliminated,
        { borderColor: accent.glow },
      ]}>
      <GestureDetector gesture={gesture}>
        <View style={styles.touchArea} onLayout={onLayout}>
          <View style={[styles.rotated, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <Text style={styles.seat}>Asiento {seatIndex + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {player.name}
            </Text>
            <Text
              style={[
                styles.life,
                { fontSize: lifeFontSize },
                player.life <= 10 && styles.lifeLow,
                disabled && styles.lifeEliminated,
              ]}>
              {player.life}
            </Text>
            {disabled && <Text style={styles.eliminatedLabel}>ELIMINADO</Text>}
            {!disabled && (
              <View style={styles.hints}>
                <Text style={styles.hintTop}>+1</Text>
                <Text style={styles.hintBottom}>−1</Text>
              </View>
            )}
          </View>
          <FloatingDelta delta={floatingDelta} />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  eliminated: {
    opacity: opacity.muted,
  },
  touchArea: {
    flex: 1,
  },
  rotated: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  seat: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
    letterSpacing: typography.letterSpacing.wide,
  },
  name: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textSecondary,
    maxWidth: '90%',
    marginTop: 2,
  },
  life: {
    fontFamily: typography.fontFamily.monoBold,
    color: palette.life,
    letterSpacing: typography.letterSpacing.counter,
    marginVertical: spacing.xs,
  },
  lifeLow: {
    color: palette.warning,
  },
  lifeEliminated: {
    color: palette.eliminated,
    textDecorationLine: 'line-through',
  },
  eliminatedLabel: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.xs,
    color: palette.danger,
    letterSpacing: typography.letterSpacing.wide,
  },
  hints: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    opacity: 0.18,
  },
  hintTop: {
    alignSelf: 'center',
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: palette.heal,
  },
  hintBottom: {
    alignSelf: 'center',
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: palette.damage,
  },
});
