import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { palette, radius, spacing, typography } from '@/theme';
import type { GameToast } from '@/store/gameStore';

type GameToastOverlayProps = {
  toast: GameToast | null;
  onDismiss: () => void;
};

export function GameToastOverlay({ toast, onDismiss }: GameToastOverlayProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 2200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.wrap}>
      <View style={styles.toast}>
        <Text style={styles.title}>{toast.title}</Text>
        {toast.subtitle ? <Text style={styles.subtitle}>{toast.subtitle}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 999,
  },
  toast: {
    backgroundColor: palette.surfaceGlass,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 160,
  },
  title: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.xxl,
    color: palette.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textSecondary,
  },
});
