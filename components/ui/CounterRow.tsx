import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/theme';

type CounterRowProps = {
  label: string;
  value: number;
  icon?: string;
  danger?: boolean;
  warning?: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
};

export function CounterRow({
  label,
  value,
  icon,
  danger,
  warning,
  onDecrement,
  onIncrement,
}: CounterRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          onPress={onDecrement}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text
          style={[
            styles.value,
            warning && styles.warning,
            danger && styles.danger,
          ]}>
          {value}
        </Text>
        <Pressable
          onPress={onIncrement}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  labelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: typography.fontSize.lg,
  },
  label: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: palette.backgroundElevated,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: palette.surfaceHover,
    transform: [{ scale: 0.94 }],
  },
  btnText: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.lg,
    color: palette.textPrimary,
  },
  value: {
    minWidth: 40,
    textAlign: 'center',
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.xl,
    color: palette.textPrimary,
  },
  warning: {
    color: palette.warning,
  },
  danger: {
    color: palette.danger,
  },
});
