import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { FloatingDelta } from '@/components/board/FloatingDelta';
import { useLifeCounterGestures } from '@/hooks/useLifeCounterGestures';
import {
  getMaxCommanderDamage,
  isCommanderDanger,
  isPoisonDanger,
} from '@/engine';
import type { PlayerGameState } from '@/engine/types';
import { manaColors, opacity, palette, radius, spacing, typography } from '@/theme';

type PlayerPanelProps = {
  player: PlayerGameState;
  seatIndex: number;
  rotation: number;
  lifeFontSize: number;
  isMonarch: boolean;
  style?: object;
  onLifeChange: (playerId: string, delta: number) => void;
  onOpenActions: (playerId: string) => void;
};

export function PlayerPanel({
  player,
  seatIndex,
  rotation,
  lifeFontSize,
  isMonarch,
  style,
  onLifeChange,
  onOpenActions,
}: PlayerPanelProps) {
  const [panelHeight, setPanelHeight] = useState(0);
  const disabled = player.isEliminated;
  const accent = manaColors[player.manaIdentity];
  const maxCmd = getMaxCommanderDamage(player);
  const poisonWarn = isPoisonDanger(player.poison);
  const cmdWarn = isCommanderDanger(player);

  const onCommitDelta = useCallback(
    (delta: number) => {
      if (!disabled) onLifeChange(player.id, delta);
    },
    [disabled, onLifeChange, player.id],
  );

  const { gesture, floatingDelta } = useLifeCounterGestures({
    panelHeight,
    disabled,
    onCommitDelta,
  });

  return (
    <View
      style={[
        styles.slot,
        style,
        disabled && styles.eliminated,
        { borderColor: accent.glow },
      ]}>
      <View style={[styles.glow, { backgroundColor: accent.glow }]} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Acciones de ${player.name}`}
        onPress={() => onOpenActions(player.id)}
        style={styles.menuBtn}>
        <Text style={styles.menuIcon}>⋯</Text>
      </Pressable>

      <GestureDetector gesture={gesture}>
        <View
          style={styles.touchArea}
          onLayout={(e: LayoutChangeEvent) =>
            setPanelHeight(e.nativeEvent.layout.height)
          }>
          <View style={[styles.rotated, { transform: [{ rotate: `${rotation}deg` }] }]}>
            {isMonarch ? <Text style={styles.crown}>👑</Text> : null}

            <View style={[styles.manaStripe, { backgroundColor: accent.primary }]} />

            <Text style={styles.seat}>ASIENTO {seatIndex + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {player.name}
            </Text>

            <Text
              style={[
                styles.life,
                { fontSize: lifeFontSize },
                player.life <= 10 && !disabled && styles.lifeLow,
                disabled && styles.lifeEliminated,
              ]}>
              {player.life}
            </Text>

            {(player.poison > 0 || maxCmd > 0) && !disabled ? (
              <View style={styles.statsRow}>
                {player.poison > 0 ? (
                  <View style={[styles.statChip, poisonWarn && styles.statDanger]}>
                    <Text style={styles.statText}>☠ {player.poison}</Text>
                  </View>
                ) : null}
                {maxCmd > 0 ? (
                  <View style={[styles.statChip, cmdWarn && styles.statWarn]}>
                    <Text style={styles.statText}>⚔ {maxCmd}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {disabled ? (
              <View style={styles.fallen}>
                <Text style={styles.fallenX}>✕</Text>
                <Text style={styles.eliminatedLabel}>CAÍDO</Text>
              </View>
            ) : (
              <View style={styles.zones}>
                <View style={styles.zoneTop}>
                  <Text style={styles.zoneLabel}>+1</Text>
                </View>
                <View style={styles.zoneDivider} />
                <View style={styles.zoneBottom}>
                  <Text style={styles.zoneLabel}>−1</Text>
                </View>
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
    borderWidth: 1.5,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  eliminated: {
    opacity: opacity.muted,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  menuBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    zIndex: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.backgroundElevated,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
    color: palette.textSecondary,
    lineHeight: 20,
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
  crown: {
    fontSize: typography.fontSize.lg,
    marginBottom: 2,
  },
  manaStripe: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: spacing.xs,
    opacity: 0.9,
  },
  seat: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: 9,
    color: palette.textMuted,
    letterSpacing: 2,
  },
  name: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
    maxWidth: '88%',
    marginTop: 2,
  },
  life: {
    fontFamily: typography.fontFamily.monoBold,
    color: palette.life,
    letterSpacing: typography.letterSpacing.counter,
    marginVertical: spacing.xs,
    textShadowColor: 'rgba(255,255,255,0.08)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  lifeLow: {
    color: palette.warning,
  },
  lifeEliminated: {
    color: palette.eliminated,
    textDecorationLine: 'line-through',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  statChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: palette.backgroundElevated,
    borderWidth: 1,
    borderColor: palette.border,
  },
  statWarn: {
    borderColor: palette.commander,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statDanger: {
    borderColor: palette.poison,
    backgroundColor: 'rgba(132, 204, 22, 0.12)',
  },
  statText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: palette.textSecondary,
  },
  fallen: {
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.xs,
  },
  fallenX: {
    fontSize: typography.fontSize.lg,
    color: palette.danger,
  },
  eliminatedLabel: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: 9,
    color: palette.danger,
    letterSpacing: 2,
  },
  zones: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  zoneTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.healGlow,
  },
  zoneDivider: {
    height: 1,
    backgroundColor: palette.border,
  },
  zoneBottom: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.damageGlow,
  },
  zoneLabel: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
});
