import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { manaColors, type ManaIdentity, palette, radius, spacing, typography } from '@/theme';
import { MANA_OPTIONS } from '@/store/gameStore';

type ManaIdentityPickerProps = {
  value: ManaIdentity;
  onChange: (identity: ManaIdentity) => void;
};

export function ManaIdentityPicker({ value, onChange }: ManaIdentityPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {MANA_OPTIONS.map((option) => {
        const selected = value === option.id;
        const color = manaColors[option.id].primary;
        const darkText = option.id === 'white' || option.id === 'colorless';

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={[
              styles.chip,
              { backgroundColor: color },
              selected && styles.chipSelected,
            ]}>
            <Text style={[styles.symbol, darkText && styles.symbolDark]}>{option.symbol}</Text>
            <Text style={[styles.chipLabel, darkText && styles.symbolDark]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    minWidth: 88,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 2,
  },
  chipSelected: {
    borderColor: palette.textPrimary,
  },
  symbol: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  symbolDark: {
    color: palette.textInverse,
  },
  chipLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
    color: palette.textPrimary,
  },
});
