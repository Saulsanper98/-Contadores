import { Pressable, StyleSheet, Text, View } from 'react-native';

import { manaColors, type ManaIdentity, palette, typography } from '@/theme';

type ManaPipProps = {
  identity: ManaIdentity;
  size?: 'sm' | 'md';
  selected?: boolean;
  onPress?: () => void;
  label?: string;
};

const SIZES = { sm: 28, md: 40 } as const;

export function ManaPip({ identity, size = 'sm', selected, onPress, label }: ManaPipProps) {
  const dim = SIZES[size];
  const color = manaColors[identity];
  const darkText = identity === 'white' || identity === 'colorless';

  const content = (
    <View
      style={[
        styles.pip,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: color.primary,
        },
        selected && styles.selected,
      ]}>
      <Text style={[styles.symbol, darkText && styles.symbolDark]}>
        {label ?? identity[0].toUpperCase()}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: palette.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
  symbol: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  symbolDark: {
    color: palette.textInverse,
  },
});
