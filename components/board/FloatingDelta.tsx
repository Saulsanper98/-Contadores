import { StyleSheet, Text, View } from 'react-native';

import { palette, typography } from '@/theme';

type FloatingDeltaProps = {
  delta: number | null;
};

export function FloatingDelta({ delta }: FloatingDeltaProps) {
  if (delta === null || delta === 0) {
    return null;
  }

  const label = delta > 0 ? `+${delta}` : `${delta}`;

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={[styles.text, delta > 0 ? styles.positive : styles.negative]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.xxl,
    letterSpacing: typography.letterSpacing.counter,
  },
  positive: {
    color: palette.heal,
  },
  negative: {
    color: palette.damage,
  },
});
