import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TABLE_LAYOUT_OPTIONS } from '@/engine/seatLayouts';
import type { TableLayoutId } from '@/engine/types';
import { palette, radius, spacing, typography } from '@/theme';

type TableLayoutPickerProps = {
  value: TableLayoutId;
  onChange: (layout: TableLayoutId) => void;
};

export function TableLayoutPicker({ value, onChange }: TableLayoutPickerProps) {
  return (
    <View style={styles.list}>
      {TABLE_LAYOUT_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.card, selected && styles.cardSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
            <Text style={styles.desc}>{option.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  cardSelected: {
    borderColor: palette.accentSecondary,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  label: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  labelSelected: { color: palette.accentSecondary },
  desc: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
    marginTop: 2,
  },
});
