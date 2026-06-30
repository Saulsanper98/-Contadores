import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameBoard } from '@/components/board/GameBoard';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { palette, spacing, typography } from '@/theme';
import { useGameStore } from '@/store/gameStore';

export default function GameScreen() {
  useKeepAwake();

  const insets = useSafeAreaInsets();
  const game = useGameStore((state) => state.game);
  const clearGame = useGameStore((state) => state.clearGame);
  const adjustPlayerLife = useGameStore((state) => state.adjustPlayerLife);

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

  const handleExit = () => {
    clearGame();
    router.replace('/');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" hidden />

      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" onPress={handleExit} hitSlop={12}>
          <Text style={styles.exit}>✕ Salir</Text>
        </Pressable>
        <Text style={styles.toolbarTitle}>Partida · {game.players.length} jugadores</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <GameBoard game={game} onLifeChange={adjustPlayerLife} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  exit: {
    fontFamily: typography.fontFamily.sansMedium,
    fontSize: typography.fontSize.sm,
    color: palette.textSecondary,
    minWidth: 64,
  },
  toolbarTitle: {
    fontFamily: typography.fontFamily.sansSemiBold,
    fontSize: typography.fontSize.sm,
    color: palette.textMuted,
  },
  toolbarSpacer: {
    minWidth: 64,
  },
});
