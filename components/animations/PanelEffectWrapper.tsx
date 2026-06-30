import { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { panelEffectDuration } from '@/animations/lifeFeedback';
import { ParticleBurst } from '@/components/animations/ParticleBurst';
import type { EffectKind } from '@/animations/effects';
import { useSettingsStore } from '@/store/settingsStore';
import { palette } from '@/theme';
import { spring } from '@/theme/tokens';

type PanelEffectWrapperProps = {
  children: ReactNode;
  effectId: number;
  effectKind: EffectKind | null;
  effectMagnitude?: number;
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
  effectMagnitude = 1,
  reducedMotion,
  onEffectEnd,
}: PanelEffectWrapperProps) {
  const shakeX = useSharedValue(0);
  const flash = useSharedValue(0);
  const scale = useSharedValue(1);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!effectKind || effectId === 0) return;
    if (!useSettingsStore.getState().effectsEnabled) {
      onEffectEnd?.();
      return;
    }

    const magnitude = Math.max(1, effectMagnitude);
    const totalMs = panelEffectDuration(magnitude);
    const flashOutMs = Math.round(totalMs * 0.55);

    if (reducedMotion) {
      flash.value = withSequence(
        withTiming(0.35, { duration: 120 }),
        withTiming(0, { duration: 180 }),
      );
      const timer = setTimeout(() => onEffectEnd?.(), totalMs * 0.7);
      return () => clearTimeout(timer);
    }

    switch (effectKind) {
      case 'damage':
      case 'commander':
      case 'groupDamage': {
        const shakes = Math.min(4, 1 + Math.floor(magnitude / 3));
        const shakeSeq = [];
        for (let i = 0; i < shakes; i += 1) {
          shakeSeq.push(withTiming(i % 2 === 0 ? -7 : 7, { duration: 55 }));
        }
        shakeSeq.push(withSpring(0, spring.stiff));
        shakeX.value = withSequence(...shakeSeq);
        flash.value = withSequence(
          withTiming(0.55 + Math.min(0.2, magnitude * 0.03), { duration: 100 }),
          withTiming(0, { duration: flashOutMs }),
        );
        break;
      }
      case 'heal':
      case 'revive':
      case 'groupHeal':
        scale.value = withSequence(
          withSpring(1.03 + Math.min(0.06, magnitude * 0.01), spring.gentle),
          withSpring(1, spring.gentle),
        );
        flash.value = withSequence(
          withTiming(0.4, { duration: 120 }),
          withTiming(0, { duration: flashOutMs }),
        );
        break;
      case 'poison':
        flash.value = withSequence(
          withTiming(0.45, { duration: 140 }),
          withTiming(0, { duration: flashOutMs }),
        );
        break;
      case 'elimination':
        flash.value = withTiming(0.5, { duration: totalMs * 0.6 });
        scale.value = withTiming(0.97, { duration: totalMs * 0.5 });
        break;
      case 'monarch':
        scale.value = withSequence(withSpring(1.08, spring.bouncy), withSpring(1, spring.gentle));
        flash.value = withSequence(
          withTiming(0.35, { duration: 120 }),
          withTiming(0, { duration: flashOutMs }),
        );
        break;
      default:
        break;
    }

    const timer = setTimeout(() => onEffectEnd?.(), totalMs);
    return () => clearTimeout(timer);
  }, [effectId, effectKind, effectMagnitude, flash, onEffectEnd, reducedMotion, scale, shakeX]);

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
          magnitude={effectMagnitude}
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
