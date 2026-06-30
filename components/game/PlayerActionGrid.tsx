import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PLAYER_ACTIONS, type PlayerActionId } from '@/data/playerActions';
import { palette, radius, spacing, typography } from '@/theme';

type PlayerActionGridProps = {
  onAction: (actionId: PlayerActionId) => void;
  isEliminated?: boolean;
  isMonarch?: boolean;
  hiddenActions?: PlayerActionId[];
};

export function PlayerActionGrid({
  onAction,
  isEliminated,
  isMonarch,
  hiddenActions = [],
}: PlayerActionGridProps) {
  const actions = PLAYER_ACTIONS.filter((action) => {
    if (hiddenActions.includes(action.id)) return false;
    if (isEliminated && action.id !== 'revive') return false;
    if (!isEliminated && action.id === 'revive') return false;
    if (isMonarch && action.id === 'monarch') return false;
    return true;
  });

  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={() => onAction(action.id)}
          style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}>
          <Text style={styles.label}>{action.label}</Text>
          <Text style={styles.icon}>{action.icon}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: '48%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: palette.backgroundElevated,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cellPressed: {
    backgroundColor: palette.surfaceHover,
    transform: [{ scale: 0.98 }],
  },
  label: {
    flex: 1,
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
    paddingRight: spacing.xs,
  },
  icon: {
    fontSize: typography.fontSize.lg,
    opacity: 0.9,
  },
});
