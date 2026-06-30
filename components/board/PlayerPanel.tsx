import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector } from 'react-native-gesture-handler';

import { PanelEffectWrapper } from '@/components/animations/PanelEffectWrapper';
import { FloatingDelta } from '@/components/board/FloatingDelta';
import { useLifeCounterGestures } from '@/hooks/useLifeCounterGestures';
import type { EffectKind } from '@/animations/effects';
import {
  getMaxCommanderDamage,
  isCommanderDanger,
  isPoisonDanger,
} from '@/engine';
import type { PlayerGameState } from '@/engine/types';
import { MANA_OPTIONS } from '@/store/gameStore';
import { getManaPanelTheme, opacity, palette, radius, spacing, typography } from '@/theme';

type PlayerPanelProps = {
  player: PlayerGameState;
  seatIndex: number;
  rotation: number;
  lifeFontSize: number;
  isMonarch: boolean;
  effectId?: number;
  effectKind?: EffectKind | null;
  reducedMotion?: boolean;
  onEffectEnd?: () => void;
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
  effectId = 0,
  effectKind = null,
  reducedMotion,
  onEffectEnd,
  style,
  onLifeChange,
  onOpenActions,
}: PlayerPanelProps) {
  const [panelHeight, setPanelHeight] = useState(0);
  const disabled = player.isEliminated;
  const theme = getManaPanelTheme(player.manaIdentity);
  const manaSymbol =
    MANA_OPTIONS.find((m) => m.id === player.manaIdentity)?.symbol ?? '?';
  const maxCmd = getMaxCommanderDamage(player);
  const poisonWarn = isPoisonDanger(player.poison);
  const cmdWarn = isCommanderDanger(player);
  const hasStats = (player.poison > 0 || maxCmd > 0) && !disabled;

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
    <View style={[styles.slot, style, disabled && styles.eliminated]}>
      <PanelEffectWrapper
        effectId={effectId}
        effectKind={effectKind}
        reducedMotion={reducedMotion}
        onEffectEnd={onEffectEnd}>
        <LinearGradient
          colors={theme.gradient}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.glowOrb, { backgroundColor: theme.glow }]} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Acciones de ${player.name}`}
          onPress={() => onOpenActions(player.id)}
          style={styles.menuBtn}>
          <Text style={[styles.menuIcon, { color: theme.mutedColor }]}>⋯</Text>
        </Pressable>

        <GestureDetector gesture={gesture}>
          <View
            style={styles.touchArea}
            onLayout={(e: LayoutChangeEvent) =>
              setPanelHeight(e.nativeEvent.layout.height)
            }>
            <View style={[styles.rotated, { transform: [{ rotate: `${rotation}deg` }] }]}>
              {isMonarch ? (
                <View style={styles.crownWrap}>
                  <Text style={styles.crown}>👑</Text>
                </View>
              ) : null}

              <View style={[styles.manaPip, { backgroundColor: theme.accent }]}>
                <Text
                  style={[
                    styles.manaSymbol,
                    {
                      color:
                        player.manaIdentity === 'white' || player.manaIdentity === 'colorless'
                          ? palette.textInverse
                          : palette.textPrimary,
                    },
                  ]}>
                  {manaSymbol}
                </Text>
              </View>

              <Text
                style={[styles.name, { color: theme.nameColor }]}
                numberOfLines={1}>
                {player.name}
              </Text>

              <Text
                style={[
                  styles.life,
                  {
                    fontSize: lifeFontSize,
                    color: disabled ? palette.eliminated : theme.lifeColor,
                  },
                  player.life <= 10 && !disabled && styles.lifeLow,
                  disabled && styles.lifeEliminated,
                ]}>
                {player.life}
              </Text>

              <Text style={[styles.seat, { color: theme.mutedColor }]}>
                ASIENTO {seatIndex + 1}
              </Text>

              {hasStats ? (
                <View style={styles.statsRow}>
                  {player.poison > 0 ? (
                    <View
                      style={[
                        styles.statChip,
                        { backgroundColor: theme.chipBg, borderColor: theme.chipBorder },
                        poisonWarn && styles.statDanger,
                      ]}>
                      <Text style={[styles.statText, { color: theme.nameColor }]}>
                        ☠ {player.poison}
                      </Text>
                    </View>
                  ) : null}
                  {maxCmd > 0 ? (
                    <View
                      style={[
                        styles.statChip,
                        { backgroundColor: theme.chipBg, borderColor: theme.chipBorder },
                        cmdWarn && styles.statWarn,
                      ]}>
                      <Text style={[styles.statText, { color: theme.nameColor }]}>
                        ⚔ {maxCmd}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {disabled ? (
                <View style={styles.fallen}>
                  <Text style={styles.fallenX}>✕</Text>
                  <Text style={styles.eliminatedLabel}>CAÍDO</Text>
                </View>
              ) : null}
            </View>
            <FloatingDelta delta={floatingDelta} />
          </View>
        </GestureDetector>
      </PanelEffectWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.background,
  },
  eliminated: {
    opacity: opacity.muted,
  },
  glowOrb: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: '70%',
    height: '35%',
    borderRadius: radius.full,
    opacity: 0.22,
  },
  menuBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 16,
    lineHeight: 18,
  },
  touchArea: {
    flex: 1,
  },
  rotated: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: 2,
  },
  crownWrap: {
    position: 'absolute',
    top: spacing.sm,
    alignSelf: 'center',
  },
  crown: {
    fontSize: typography.fontSize.md,
  },
  manaPip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  manaSymbol: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.sm,
  },
  name: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    maxWidth: '90%',
    letterSpacing: 0.3,
  },
  life: {
    fontFamily: typography.fontFamily.monoBold,
    letterSpacing: typography.letterSpacing.counter,
    marginVertical: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  lifeLow: {
    color: palette.warning,
  },
  lifeEliminated: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  seat: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: 9,
    letterSpacing: 2.5,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  statChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statWarn: {
    borderColor: palette.commander,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  statDanger: {
    borderColor: palette.poison,
    backgroundColor: 'rgba(163, 230, 53, 0.18)',
  },
  statText: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.xs,
  },
  fallen: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
  },
  fallenX: {
    fontSize: typography.fontSize.xxl,
    color: palette.danger,
    opacity: 0.85,
  },
  eliminatedLabel: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: 10,
    color: palette.danger,
    letterSpacing: 3,
  },
});
