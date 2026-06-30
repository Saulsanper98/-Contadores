import { Pressable, StyleSheet, Text, View } from 'react-native';

import { manaColors, type ManaIdentity, palette, typography } from '@/theme';

type ManaPipProps = {
  identity: ManaIdentity;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onPress?: () => void;
  label?: string;
};

const SIZES = { sm: 28, md: 44, lg: 52 } as const;

export function ManaPip({ identity, size = 'sm', selected, onPress, label }: ManaPipProps) {
  const dim = SIZES[size];
  const color = manaColors[identity];
  const darkText = identity === 'white' || identity === 'colorless';
  const fontSize = size === 'lg' ? typography.fontSize.lg : size === 'md' ? typography.fontSize.md : typography.fontSize.sm;

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
      <Text style={[styles.symbol, { fontSize }, darkText && styles.symbolDark]}>
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
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: palette.textPrimary,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  symbol: {
    fontFamily: typography.fontFamily.sansBold,
    color: palette.textPrimary,
  },
  symbolDark: {
    color: palette.textInverse,
  },
});
