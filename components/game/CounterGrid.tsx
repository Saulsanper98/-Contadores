import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GenericCounterDef } from '@/engine/types';
import type { PlayerGameState } from '@/engine/types';
import { palette, radius, spacing, typography } from '@/theme';

type CounterGridProps = {
  counters: GenericCounterDef[];
  player: PlayerGameState;
  onAdjust: (counterId: string, delta: number) => void;
};

export function CounterGrid({ counters, player, onAdjust }: CounterGridProps) {
  if (counters.length === 0) {
    return (
      <Text style={styles.empty}>
        Activa contadores en la configuración de partida
      </Text>
    );
  }

  return (
    <View style={styles.grid}>
      {counters.map((def) => {
        const state = player.counters.find((c) => c.defId === def.id);
        const value = state?.value ?? 0;

        return (
          <Pressable
            key={def.id}
            onPress={() => onAdjust(def.id, 1)}
            onLongPress={() => onAdjust(def.id, -1)}
            style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}>
            <View style={styles.cellTop}>
              <Text style={styles.label}>{def.name}</Text>
              <Text style={styles.icon}>{def.icon}</Text>
            </View>
            <View style={styles.controls}>
              <Pressable
                onPress={() => onAdjust(def.id, -1)}
                style={styles.stepBtn}
                hitSlop={8}>
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Text style={styles.value}>{value}</Text>
              <Pressable
                onPress={() => onAdjust(def.id, 1)}
                style={styles.stepBtn}
                hitSlop={8}>
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </Pressable>
        );
      })}
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  cellPressed: {
    backgroundColor: palette.surfaceHover,
  },
  cellTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  icon: {
    fontSize: typography.fontSize.lg,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.lg,
    color: palette.textPrimary,
  },
  value: {
    minWidth: 28,
    textAlign: 'center',
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.xl,
    color: palette.textPrimary,
  },
  empty: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
