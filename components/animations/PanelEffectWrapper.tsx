import { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ParticleBurst } from '@/components/animations/ParticleBurst';
import type { EffectKind } from '@/animations/effects';
import { palette } from '@/theme';
import { spring } from '@/theme/tokens';

type PanelEffectWrapperProps = {
  children: ReactNode;
  effectId: number;
  effectKind: EffectKind | null;
  reducedMotion?: boolean;
  onEffectEnd?: () => void;
};

const FLASH_COLORS: Partial<Record<EffectKind, string>> = {
  damage: palette.damageGlow,
  heal: palette.healGlow,
  commander: palette.commanderGlow,
  poison: palette.poisonGlow,
  elimination: 'rgba(80,80,80,0.5)',
  revive: palette.healGlow,
  monarch: palette.monarchGlow,
};

export function PanelEffectWrapper({
  children,
  effectId,
  effectKind,
  reducedMotion,
  onEffectEnd,
}: PanelEffectWrapperProps) {
  const shakeX = useSharedValue(0);
  const flash = useSharedValue(0);
  const scale = useSharedValue(1);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!effectKind || effectId === 0) return;

    if (reducedMotion) {
      flash.value = withSequence(withTiming(0.35, { duration: 80 }), withTiming(0, { duration: 120 }));
      const timer = setTimeout(() => onEffectEnd?.(), 220);
      return () => clearTimeout(timer);
    }

    switch (effectKind) {
      case 'damage':
      case 'commander':
      case 'groupDamage':
        shakeX.value = withSequence(
          withTiming(-6, { duration: 40 }),
          withSpring(0, spring.stiff),
        );
        flash.value = withSequence(withTiming(0.55, { duration: 60 }), withTiming(0, { duration: 200 }));
        break;
      case 'heal':
      case 'revive':
      case 'groupHeal':
        scale.value = withSequence(withSpring(1.04, spring.gentle), withSpring(1, spring.gentle));
        flash.value = withSequence(withTiming(0.4, { duration: 80 }), withTiming(0, { duration: 280 }));
        break;
      case 'poison':
        flash.value = withSequence(withTiming(0.45, { duration: 100 }), withTiming(0, { duration: 300 }));
        break;
      case 'elimination':
        flash.value = withTiming(0.5, { duration: 400 });
        scale.value = withTiming(0.97, { duration: 300 });
        break;
      case 'monarch':
        scale.value = withSequence(withSpring(1.08, spring.bouncy), withSpring(1, spring.gentle));
        flash.value = withSequence(withTiming(0.35, { duration: 100 }), withTiming(0, { duration: 300 }));
        break;
      default:
        break;
    }

    const timer = setTimeout(() => onEffectEnd?.(), 520);
    return () => clearTimeout(timer);
  }, [effectId, effectKind, flash, onEffectEnd, reducedMotion, scale, shakeX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
    backgroundColor: FLASH_COLORS[effectKind ?? 'damage'] ?? palette.accentMuted,
  }));

  return (
    <Animated.View
      style={[styles.wrap, animatedStyle]}
      onLayout={(e) =>
        setSize({
          w: e.nativeEvent.layout.width,
          h: e.nativeEvent.layout.height,
        })
      }>
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />
      {children}
      {effectKind && effectId > 0 && size.w > 0 ? (
        <ParticleBurst
          triggerId={effectId}
          kind={effectKind}
          width={size.w}
          height={size.h}
          reducedMotion={reducedMotion}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});
