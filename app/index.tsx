import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

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
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>MAGIC: THE GATHERING</Text>
        <Text style={styles.title}>Commander</Text>
        <Text style={styles.subtitle}>Contador de vidas · EDH</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroText}>
            Coloca el teléfono en el centro de la mesa. Cada jugador toca su panel, orientado
            hacia su asiento.
          </Text>
        </View>

        <View style={styles.actions}>
          {game ? (
            <Button label="Continuar partida" onPress={() => router.push('/game')} />
          ) : null}
          <Button
            label={game ? 'Nueva partida' : 'Nueva partida'}
            variant={game ? 'secondary' : 'primary'}
            onPress={() => router.push('/setup')}
          />
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
  glowTop: {
    position: 'absolute',
    top: '8%',
    left: '10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: palette.accentMuted,
    opacity: 0.4,
  },
  glowBottom: {
    position: 'absolute',
    bottom: '12%',
    right: '5%',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 90, 78, 0.12)',
  },
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
    letterSpacing: 3,
    color: palette.textMuted,
  },
  title: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: 48,
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
    borderRadius: radius.lg,
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
  },
  manaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
