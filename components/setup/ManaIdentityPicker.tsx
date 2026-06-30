import { Pressable, StyleSheet, Text, View } from 'react-native';

import { manaColors, type ManaIdentity, palette, spacing, typography } from '@/theme';
import { MANA_OPTIONS } from '@/store/gameStore';

type ManaIdentityPickerProps = {
  value: ManaIdentity;
  onChange: (identity: ManaIdentity) => void;
};

const PIP_SIZE = 44;

export function ManaIdentityPicker({ value, onChange }: ManaIdentityPickerProps) {
  return (
    <View style={styles.row}>
      {MANA_OPTIONS.map((option) => {
        const selected = value === option.id;
        const color = manaColors[option.id].primary;
        const darkText = option.id === 'white' || option.id === 'colorless';

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [styles.pipWrap, pressed && styles.pressed]}>
            <View
              style={[
                styles.pip,
                { backgroundColor: color },
                selected && styles.pipSelected,
              ]}>
              <Text style={[styles.symbol, darkText && styles.symbolDark]}>
                {option.symbol}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pipWrap: {
    borderRadius: PIP_SIZE / 2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  pip: {
    width: PIP_SIZE,
    height: PIP_SIZE,
    borderRadius: PIP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  pipSelected: {
    borderColor: palette.textPrimary,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  symbol: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: 18,
    color: palette.textPrimary,
  },
  symbolDark: {
    color: palette.textInverse,
  },
});
