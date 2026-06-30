import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { palette, spacing, typography } from '@/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>COMMANDER</Text>
        </View>

        <Text style={styles.title}>Contador de vidas</Text>
        <Text style={styles.subtitle}>Magic: The Gathering · EDH</Text>

        <View style={styles.divider} />

        <Text style={styles.description}>
          Coloca el teléfono en el centro de la mesa.{'\n'}
          Cada jugador verá su panel orientado hacia su asiento.
        </Text>

        <View style={styles.actions}>
          <Button label="Nueva partida" onPress={() => router.push('/setup')} />
        </View>

        <View style={styles.manaRow}>
          {(['W', 'U', 'B', 'R', 'G'] as const).map((symbol, index) => (
            <View
              key={symbol}
              style={[
                styles.manaPip,
                index === 0 && styles.manaWhite,
                index === 1 && styles.manaBlue,
                index === 2 && styles.manaBlack,
                index === 3 && styles.manaRed,
                index === 4 && styles.manaGreen,
              ]}>
              <Text
                style={[
                  styles.manaSymbol,
                  (index === 0 || index === 2) && styles.manaSymbolDark,
                ]}>
                {symbol}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: palette.accentMuted,
    borderWidth: 1,
    borderColor: palette.border,
  },
  badgeText: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.xs,
    letterSpacing: typography.letterSpacing.wide,
    color: palette.accent,
  },
  title: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.xxl,
    letterSpacing: typography.letterSpacing.tight,
    color: palette.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg,
    color: palette.textSecondary,
  },
  divider: {
    width: 48,
    height: 2,
    marginVertical: spacing.sm,
    backgroundColor: palette.borderStrong,
    borderRadius: 1,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    textAlign: 'center',
    color: palette.textMuted,
    paddingHorizontal: spacing.md,
  },
  actions: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  manaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  manaPip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  manaWhite: { backgroundColor: '#F8F6D8' },
  manaBlue: { backgroundColor: '#0E68AB' },
  manaBlack: { backgroundColor: '#2A2A2A' },
  manaRed: { backgroundColor: '#D3202A' },
  manaGreen: { backgroundColor: '#00733E' },
  manaSymbol: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.sm,
    color: palette.textPrimary,
  },
  manaSymbolDark: {
    color: palette.textInverse,
  },
});
