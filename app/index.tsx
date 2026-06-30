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
        colors={['#1e1b4b', '#0f172a', '#06090f', '#020617']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <Text style={styles.eyebrow}>MAGIC: THE GATHERING</Text>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            Commander
          </Text>
          <Text style={styles.subtitle}>Contador de vidas · EDH</Text>
        </View>

        <View style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.25)', 'rgba(34, 211, 238, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          />
          <View style={styles.heroInner}>
            <Text style={styles.heroKicker}>Mesa central</Text>
            <Text style={styles.heroText}>
              Coloca el teléfono en el centro. Cada jugador ve su panel orientado hacia su asiento.
            </Text>
            <View style={styles.heroMana}>
              {MANA_OPTIONS.slice(0, 5).map((option) => (
                <ManaPip key={option.id} identity={option.id} size="sm" label={option.symbol} />
              ))}
            </View>
          </View>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  glowTop: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(99, 102, 241, 0.22)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  brandBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 4,
    color: palette.accentSecondary,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontFamily: typography.fontFamily.sansBold,
    fontSize: 48,
    letterSpacing: typography.letterSpacing.tight,
    color: palette.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg,
    color: palette.textSecondary,
  },
  heroCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroInner: {
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  heroKicker: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: 10,
    letterSpacing: 3,
    color: palette.textMuted,
    textTransform: 'uppercase',
  },
  heroText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    textAlign: 'center',
    color: palette.textSecondary,
    maxWidth: 320,
  },
  heroMana: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    gap: spacing.sm,
  },
});
