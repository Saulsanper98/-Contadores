import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatClock } from '@/hooks/useLiveClock';
import type { GameState } from '@/engine/types';
import { getCurrentTurnElapsedMs } from '@/engine/turns';
import { getManaPanelTheme } from '@/theme/manaTheme';
import { palette, radius, spacing, typography } from '@/theme';

type TurnBarProps = {
  game: GameState;
  turnElapsedMs: number;
  gameElapsedMs: number;
  onPassTurn: () => void;
  onOpenTimeline: () => void;
};

export function TurnBar({
  game,
  turnElapsedMs,
  gameElapsedMs,
  onPassTurn,
  onOpenTimeline,
}: TurnBarProps) {
  const active = game.players.find((p) => p.id === game.turn.activePlayerId);
  const activeTheme = active ? getManaPanelTheme(active.manaIdentity) : null;

  return (
    <View style={styles.bar}>
      <Pressable onPress={onOpenTimeline} style={styles.timelineBtn}>
        <Text style={styles.timelineIcon}>📋</Text>
      </Pressable>

      <View style={styles.center}>
        <View style={styles.activeRow}>
          {activeTheme ? (
            <View style={[styles.activeDot, { backgroundColor: activeTheme.accent }]} />
          ) : null}
          <Text style={styles.activeLabel} numberOfLines={1}>
            {active?.name ?? '—'}
          </Text>
          <Text style={styles.turnBadge}>TURNO {game.turn.turnNumber}</Text>
        </View>
        <View style={styles.timers}>
          <Text style={styles.turnTime}>{formatClock(turnElapsedMs)}</Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.gameTime}>{formatClock(gameElapsedMs)} total</Text>
        </View>
      </View>

      <Pressable onPress={onPassTurn} style={styles.passBtn}>
        <Text style={styles.passText}>Pasar</Text>
      </Pressable>
    </View>
  );
}

export function useTurnElapsed(game: GameState, nowMs: number): number {
  return getCurrentTurnElapsedMs(game, nowMs);
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  timelineBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIcon: {
    fontSize: typography.fontSize.md,
  },
  center: {
    flex: 1,
    gap: 2,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeLabel: {
    flex: 1,
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  turnBadge: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: palette.accentSecondary,
  },
  timers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  turnTime: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  sep: {
    color: palette.textMuted,
  },
  gameTime: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
  },
  passBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: palette.accent,
    minWidth: 72,
    alignItems: 'center',
  },
  passText: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.sm,
    color: '#fff',
  },
});
