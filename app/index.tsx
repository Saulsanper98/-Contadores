import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/ui/Button';
import { ManaPip } from '@/components/ui/ManaPip';
import { Screen } from '@/components/ui/Screen';
import { MANA_OPTIONS, useGameStore } from '@/store/gameStore';
import { palette, radius, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const game = useGameStore((state) => state.game);

  return (
    <Screen>
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.18)', 'transparent', 'rgba(34, 211, 238, 0.08)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>MAGIC: THE GATHERING</Text>
        <Text style={styles.title}>Commander</Text>
        <Text style={styles.subtitle}>Contador de vidas · EDH</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroText}>
            Coloca el teléfono en el centro de la mesa. Cada jugador toca su panel,
            orientado hacia su asiento.
          </Text>
        </View>

        <View style={styles.actions}>
          {game ? (
            <Button label="Continuar partida" onPress={() => router.push('/game')} />
          ) : null}
          <Button
            label="Nueva partida"
            variant={game ? 'secondary' : 'primary'}
            onPress={() => router.push('/setup')}
          />
          <Button label="Ajustes" variant="ghost" onPress={() => router.push('/settings')} />
        </View>

        <View style={styles.manaRow}>
          {MANA_OPTIONS.slice(0, 5).map((option) => (
            <ManaPip key={option.id} identity={option.id} size="md" label={option.symbol} />
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
    paddingHorizontal: spacing.lg,
  },
  eyebrow: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 4,
    color: palette.textMuted,
  },
  title: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: 52,
    letterSpacing: typography.letterSpacing.tight,
    color: palette.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg,
    color: palette.textSecondary,
    marginBottom: spacing.sm,
  },
  heroCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    maxWidth: 360,
  },
  heroText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    textAlign: 'center',
    color: palette.textSecondary,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  manaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    opacity: 0.85,
  },
});
