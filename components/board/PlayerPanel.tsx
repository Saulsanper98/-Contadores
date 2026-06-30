import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

import { PanelEffectWrapper } from '@/components/animations/PanelEffectWrapper';
import type { PanelBounds } from '@/components/board/CombatDragOverlay';
import { CommanderArtBackground } from '@/components/board/CommanderArtBackground';
import { FloatingDelta } from '@/components/board/FloatingDelta';
import { PanelLifeStrip } from '@/components/board/PanelLifeStrip';
import type { EffectKind } from '@/animations/effects';
import {
  getMaxCommanderDamage,
  isCommanderDanger,
  isPoisonDanger,
} from '@/engine';
import type { PlayerGameState } from '@/engine/types';
import { usePlayerPanelGestures } from '@/hooks/usePlayerPanelGestures';
import { MANA_OPTIONS } from '@/store/gameStore';
import { getManaPanelTheme, opacity, palette, radius, spacing, typography } from '@/theme';

type PlayerPanelProps = {
  player: PlayerGameState;
  seatIndex: number;
  rotation: number;
  lifeFontSize: number;
  isMonarch: boolean;
  isActive?: boolean;
  effectId?: number;
  effectKind?: EffectKind | null;
  reducedMotion?: boolean;
  combatHighlight?: 'source' | 'target' | null;
  onEffectEnd?: () => void;
  style?: object;
  onLifeChange: (playerId: string, delta: number) => void;
  onOpenActions: (playerId: string) => void;
  onRegisterBounds?: (bounds: PanelBounds) => void;
  boundsVersion?: number;
  onTryCombatStart?: (
    absoluteX: number,
    absoluteY: number,
    translationX: number,
    translationY: number,
  ) => boolean;
  onAttackDragMove?: (absoluteX: number, absoluteY: number) => void;
  onAttackDragEnd?: (absoluteX: number, absoluteY: number) => void;
};

export function PlayerPanel({
  player,
  seatIndex,
  rotation,
  lifeFontSize,
  isMonarch,
  isActive,
  effectId = 0,
  effectKind = null,
  reducedMotion,
  combatHighlight,
  onEffectEnd,
  style,
  onLifeChange,
  onOpenActions,
  onRegisterBounds,
  boundsVersion = 0,
  onTryCombatStart,
  onAttackDragMove,
  onAttackDragEnd,
}: PlayerPanelProps) {
  const viewRef = useRef<View>(null);
  const [panelWidth, setPanelWidth] = useState(0);
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

  const { gesture, leftFloatingDelta, rightFloatingDelta } = usePlayerPanelGestures({
    panelWidth,
    disabled,
    onCommitDelta,
    onTryCombatStart,
    onAttackDragMove,
    onAttackDragEnd,
    onOpenMenu: () => onOpenActions(player.id),
  });

  const reportBounds = useCallback(() => {
    viewRef.current?.measureInWindow((x, y, width, height) => {
      onRegisterBounds?.({ playerId: player.id, x, y, width, height });
    });
  }, [onRegisterBounds, player.id]);

  useEffect(() => {
    reportBounds();
  }, [boundsVersion, reportBounds]);

  return (
    <View
      ref={viewRef}
      style={[
        styles.slot,
        style,
        disabled && styles.eliminated,
        combatHighlight === 'target' && styles.highlightTarget,
        combatHighlight === 'source' && styles.highlightSource,
        isActive && styles.activePlayer,
      ]}
      onLayout={reportBounds}>
      <PanelEffectWrapper
        effectId={effectId}
        effectKind={effectKind}
        reducedMotion={reducedMotion}
        onEffectEnd={onEffectEnd}>
        <CommanderArtBackground
          commanderName={player.commanderName}
          manaIdentity={player.manaIdentity}
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.55)']}
          style={styles.vignette}
          pointerEvents="none"
        />

        <GestureDetector gesture={gesture}>
          <View
            style={[
              styles.touchRotator,
              { transform: [{ rotate: `${rotation}deg` }] },
            ]}
            onLayout={(e) => setPanelWidth(e.nativeEvent.layout.width)}>
            <View style={styles.touchRow} collapsable={false}>
              <View style={styles.stripSlot}>
                <PanelLifeStrip side="minus" accentColor={palette.damage} />
                <FloatingDelta delta={leftFloatingDelta} />
              </View>

              <View style={styles.combatZone} pointerEvents="none">
                <View style={styles.combatContent}>
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
                            player.manaIdentity === 'white' ||
                            player.manaIdentity === 'colorless'
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

                  <Text style={[styles.seat, { color: theme.mutedColor }]} numberOfLines={1}>
                    {player.commanderName
                      ? player.commanderName.toUpperCase()
                      : `ASIENTO ${seatIndex + 1}`}
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
              </View>

              <View style={styles.stripSlot}>
                <PanelLifeStrip side="plus" accentColor={palette.heal} />
                <FloatingDelta delta={rightFloatingDelta} />
              </View>
            </View>
          </View>
        </GestureDetector>
      </PanelEffectWrapper>
    </View>
  );
}

const STRIP_WIDTH = '23%';

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  highlightTarget: {
    borderWidth: 2.5,
    borderColor: '#f87171',
    shadowColor: '#f87171',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  highlightSource: {
    borderWidth: 2,
    borderColor: palette.accent,
  },
  activePlayer: {
    borderWidth: 2,
    borderColor: palette.accentSecondary,
    shadowColor: palette.accentSecondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  eliminated: {
    opacity: opacity.muted,
  },
  touchRotator: {
    flex: 1,
    zIndex: 2,
  },
  touchRow: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.xs,
    gap: 4,
  },
  stripSlot: {
    width: STRIP_WIDTH,
    position: 'relative',
  },
  combatZone: {
    flex: 1,
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  combatContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  crownWrap: {
    position: 'absolute',
    top: spacing.xs,
    alignSelf: 'center',
  },
  crown: {
    fontSize: typography.fontSize.md,
  },
  manaPip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  manaSymbol: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.sm,
  },
  name: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    maxWidth: '95%',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  life: {
    fontFamily: typography.fontFamily.monoBold,
    letterSpacing: typography.letterSpacing.counter,
    marginVertical: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
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
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 2,
    maxWidth: '92%',
    textAlign: 'center',
    opacity: 0.85,
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
