import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GenericCounterEditor } from '@/components/setup/GenericCounterEditor';
import { PlayerConfigCard } from '@/components/setup/PlayerConfigCard';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Stepper } from '@/components/ui/Stepper';
import { layout, palette, spacing, typography } from '@/theme';
import { useGameStore, useSetupStore } from '@/store/gameStore';

export default function SetupScreen() {
  const setup = useSetupStore((state) => state.setup);
  const setPlayerCount = useSetupStore((state) => state.setPlayerCount);
  const setStartingLife = useSetupStore((state) => state.setStartingLife);
  const updatePlayer = useSetupStore((state) => state.updatePlayer);
  const addGenericCounter = useSetupStore((state) => state.addGenericCounter);
  const removeGenericCounter = useSetupStore((state) => state.removeGenericCounter);
  const startGame = useGameStore((state) => state.startGame);

  const handleStart = () => {
    startGame(setup);
    router.push('/game');
  };

  return (
    <Screen padded={false}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.badge}>FASE 1</Text>
          <Text style={styles.title}>Nueva partida</Text>
          <Text style={styles.subtitle}>Configura la mesa antes de empezar</Text>
        </View>

        <View style={styles.section}>
          <Stepper
            label="Jugadores"
            value={setup.playerCount}
            min={layout.minPlayerCount}
            max={layout.maxPlayerCount}
            onChange={setPlayerCount}
          />
          <Stepper
            label="Vida inicial"
            value={setup.startingLife}
            min={1}
            max={99}
            onChange={setStartingLife}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jugadores</Text>
          {setup.players.map((player, index) => (
            <PlayerConfigCard
              key={player.id}
              index={index}
              player={player}
              onChange={(patch) => updatePlayer(player.id, patch)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <GenericCounterEditor
            counters={setup.genericCounters}
            onAdd={addGenericCounter}
            onRemove={removeGenericCounter}
          />
        </View>

        <View style={styles.actions}>
          <Button label="Empezar partida" onPress={handleStart} />
          <Button label="Volver" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.xs,
    letterSpacing: typography.letterSpacing.wide,
    color: palette.accent,
    backgroundColor: palette.accentMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    overflow: 'hidden',
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.lg,
    color: palette.textPrimary,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
