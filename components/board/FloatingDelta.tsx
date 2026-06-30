import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { lifeFeedbackDuration } from '@/animations/lifeFeedback';
import { palette, typography } from '@/theme';

type FloatingDeltaProps = {
  delta: number | null;
};

export function FloatingDelta({ delta }: FloatingDeltaProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    if (delta === null || delta === 0) {
      opacity.value = 0;
      return;
    }

    const duration = lifeFeedbackDuration(delta);
    const hold = duration * 0.45;
    const fadeOut = duration * 0.55;

    opacity.value = 0;
    translateY.value = 16;
    scale.value = 0.75;

    opacity.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withDelay(hold, withTiming(0, { duration: fadeOut, easing: Easing.in(Easing.cubic) })),
    );
    translateY.value = withTiming(-28, { duration, easing: Easing.out(Easing.cubic) });
    scale.value = withSequence(
      withTiming(1.15, { duration: 200, easing: Easing.out(Easing.back(1.4)) }),
      withTiming(1, { duration: 120 }),
    );
  }, [delta, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (delta === null || delta === 0) return null;

  const label = delta > 0 ? `+${delta}` : `${delta}`;
  const magnitude = Math.abs(delta);
  const fontSize =
    magnitude >= 10
      ? typography.fontSize.xxl + 8
      : magnitude >= 5
        ? typography.fontSize.xxl + 4
        : typography.fontSize.xxl;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Animated.Text
        style={[
          styles.text,
          { fontSize },
          delta > 0 ? styles.positive : styles.negative,
        ]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  text: {
    fontFamily: typography.fontFamily.monoBold,
    letterSpacing: typography.letterSpacing.counter,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  positive: {
    color: palette.heal,
  },
  negative: {
    color: palette.damage,
  },
});
