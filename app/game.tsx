import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { manaColors, palette, radius, spacing, typography } from '@/theme';
import { useGameStore } from '@/store/gameStore';

export default function GamePlaceholderScreen() {
  const game = useGameStore((state) => state.game);
  const clearGame = useGameStore((state) => state.clearGame);

  if (!game) {
    return (
      <Screen>
        <StatusBar style="light" />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No hay partida activa</Text>
          <Button label="Configurar partida" onPress={() => router.replace('/setup')} />
        </View>
      </Screen>
    );
  }

  const handleBack = () => {
    clearGame();
    router.replace('/');
  };

  return (
    <Screen padded={false}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>MOTOR OK · FASE 2 PRÓXIMAMENTE</Text>
        <Text style={styles.title}>Partida iniciada</Text>
        <Text style={styles.subtitle}>
          {game.setup.playerCount} jugadores · {game.setup.startingLife} vidas ·{' '}
          {game.setup.genericCounters.length} contadores
        </Text>

        <View style={styles.list}>
          {game.players.map((player, index) => (
            <View
              key={player.id}
              style={[
                styles.playerRow,
                { borderLeftColor: manaColors[player.manaIdentity].primary },
              ]}>
              <View style={styles.playerMeta}>
                <Text style={styles.playerSeat}>Asiento {index + 1}</Text>
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
              <Text style={styles.playerLife}>{player.life}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          El tablero multijugador con rotación por asiento llega en la Fase 2. El motor de reglas ya
          está listo y testeado.
        </Text>

        <Button label="Volver al inicio" variant="secondary" onPress={handleBack} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.lg,
    color: palette.textPrimary,
  },
  badge: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    letterSpacing: typography.letterSpacing.wide,
    color: palette.accent,
  },
  title: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.xxl,
    color: palette.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    color: palette.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
  },
  playerMeta: {
    gap: 2,
  },
  playerSeat: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
  },
  playerName: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
  },
  playerLife: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.xl,
    color: palette.life,
  },
  note: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    color: palette.textMuted,
  },
});
