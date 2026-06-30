import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, typography } from '@/theme';

type PanelLifeStripProps = {
  side: 'minus' | 'plus';
  accentColor: string;
};

export function PanelLifeStrip({ side, accentColor }: PanelLifeStripProps) {
  const isMinus = side === 'minus';
  const glyph = isMinus ? '−' : '+';
  const label = isMinus ? 'VIDA' : 'VIDA';

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={
          isMinus
            ? ['rgba(248, 113, 113, 0.22)', 'rgba(0, 0, 0, 0.35)']
            : ['rgba(52, 211, 153, 0.22)', 'rgba(0, 0, 0, 0.35)']
        }
        start={{ x: isMinus ? 0 : 1, y: 0.5 }}
        end={{ x: isMinus ? 1 : 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.edgeLine, { backgroundColor: accentColor }]} />
      <Text style={styles.glyph}>{glyph}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  edgeLine: {
    position: 'absolute',
    top: '12%',
    bottom: '12%',
    width: 2,
    opacity: 0.55,
    borderRadius: 1,
  },
  glyph: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: 36,
    color: palette.textPrimary,
    lineHeight: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  label: {
    marginTop: 4,
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: 8,
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.45)',
  },
});
