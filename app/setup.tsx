import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GenericCounterEditor } from '@/components/setup/GenericCounterEditor';
import { PlayerConfigCard } from '@/components/setup/PlayerConfigCard';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { Stepper } from '@/components/ui/Stepper';
import { flipCoin, pickRandomIndex, rollD6, rollD20 } from '@/engine/tools';
import { layout, palette, radius, spacing, typography } from '@/theme';
import { useGameStore, useSetupStore } from '@/store/gameStore';

export default function SetupScreen() {
  const setup = useSetupStore((state) => state.setup);
  const setPlayerCount = useSetupStore((state) => state.setPlayerCount);
  const setStartingLife = useSetupStore((state) => state.setStartingLife);
  const updatePlayer = useSetupStore((state) => state.updatePlayer);
  const addGenericCounter = useSetupStore((state) => state.addGenericCounter);
  const removeGenericCounter = useSetupStore((state) => state.removeGenericCounter);
  const startGame = useGameStore((state) => state.startGame);

  const [toolResult, setToolResult] = useState<string | null>(null);

  const handleStart = () => {
    startGame(setup);
    router.push('/game');
  };

  const pickStarter = () => {
    const index = pickRandomIndex(setup.players.length);
    const name = setup.players[index]?.name ?? 'Jugador';
    setToolResult(`${name} empieza`);
  };

  return (
    <Screen padded={false}>
      <StatusBar style="light" />
      <View style={styles.bgGlow} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CONFIGURACIÓN</Text>
          <Text style={styles.title}>Nueva partida</Text>
          <Text style={styles.subtitle}>La última config se guarda automáticamente</Text>
        </View>

        <View style={styles.card}>
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

        <Text style={styles.sectionTitle}>Jugadores</Text>
        {setup.players.map((player, index) => (
          <PlayerConfigCard
            key={player.id}
            index={index}
            player={player}
            onChange={(patch) => updatePlayer(player.id, patch)}
          />
        ))}

        <GenericCounterEditor
          counters={setup.genericCounters}
          onAdd={addGenericCounter}
          onRemove={removeGenericCounter}
        />

        <Section title="Antes de empezar">
          <View style={styles.toolsRow}>
            <Button label="D6" variant="secondary" onPress={() => setToolResult(`D6 → ${rollD6()}`)} />
            <Button label="D20" variant="secondary" onPress={() => setToolResult(`D20 → ${rollD20()}`)} />
            <Button label="Moneda" variant="secondary" onPress={() => setToolResult(flipCoin())} />
            <Button label="Quién empieza" variant="secondary" onPress={pickStarter} />
          </View>
          {toolResult ? <Text style={styles.toolResult}>{toolResult}</Text> : null}
        </Section>

        <View style={styles.actions}>
          <Button label="Empezar partida →" onPress={handleStart} />
          <Button label="Volver" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bgGlow: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: palette.accentMuted,
    opacity: 0.35,
  },
  scroll: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 3,
    color: palette.accent,
  },
  title: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.xxl,
    color: palette.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.lg,
    color: palette.textPrimary,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toolResult: {
    fontFamily: typography.fontFamily.monoBold,
    fontSize: typography.fontSize.md,
    color: palette.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
