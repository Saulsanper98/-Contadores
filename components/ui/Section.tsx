import { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { palette, radius, spacing, typography } from '@/theme';

type SectionProps = {
  title: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function Section({ title, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.xs,
    letterSpacing: typography.letterSpacing.wide,
    color: palette.textMuted,
    textTransform: 'uppercase',
  },
  body: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
