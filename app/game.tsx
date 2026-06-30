import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameBoard } from '@/components/board/GameBoard';
import { GameMenuSheet } from '@/components/game/GameMenuSheet';
import { GameToastOverlay } from '@/components/game/GameToastOverlay';
import { GroupToolsSheet } from '@/components/game/GroupToolsSheet';
import { PlayerActionSheet } from '@/components/game/PlayerActionSheet';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { palette, radius, spacing, typography } from '@/theme';
import { useGameStore } from '@/store/gameStore';

export default function GameScreen() {
  useKeepAwake();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  const game = useGameStore((state) => state.game);
  const past = useGameStore((state) => state.past);
  const toast = useGameStore((state) => state.toast);
  const panelEffect = useGameStore((state) => state.panelEffect);
  const globalEffect = useGameStore((state) => state.globalEffect);
  const gameStartedAt = useGameStore((state) => state.gameStartedAt);

  const clearGame = useGameStore((state) => state.clearGame);
  const clearToast = useGameStore((state) => state.clearToast);
  const clearPanelEffect = useGameStore((state) => state.clearPanelEffect);
  const clearGlobalEffect = useGameStore((state) => state.clearGlobalEffect);
  const showToast = useGameStore((state) => state.showToast);
  const undo = useGameStore((state) => state.undo);
  const restartGame = useGameStore((state) => state.restartGame);
  const adjustPlayerLife = useGameStore((state) => state.adjustPlayerLife);
  const dealCommanderDamage = useGameStore((state) => state.dealCommanderDamage);
  const adjustPlayerPoison = useGameStore((state) => state.adjustPlayerPoison);
  const adjustPlayerCounter = useGameStore((state) => state.adjustPlayerCounter);
  const setPlayerMonarch = useGameStore((state) => state.setPlayerMonarch);
  const clearMonarch = useGameStore((state) => state.clearMonarch);
  const markEliminated = useGameStore((state) => state.markEliminated);
  const markRevived = useGameStore((state) => state.markRevived);
  const applyDamageAll = useGameStore((state) => state.applyDamageAll);
  const applyHealAll = useGameStore((state) => state.applyHealAll);
  const applySetAllLife = useGameStore((state) => state.applySetAllLife);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const canUndo = past.length > 0;

  const selectedPlayer = useMemo(
    () => game?.players.find((p) => p.id === selectedPlayerId) ?? null,
    [game, selectedPlayerId],
  );

  const handleUndo = useCallback(() => {
    const ok = undo();
    if (ok) {
      showToast('Deshecho', 'Último cambio revertido');
      setMenuOpen(false);
    }
  }, [showToast, undo]);

  const handleExit = useCallback(() => {
    clearGame();
    router.replace('/');
  }, [clearGame]);

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

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" hidden />

      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" onPress={() => setMenuOpen(true)} style={styles.toolBtn}>
          <Text style={styles.toolBtnText}>☰</Text>
        </Pressable>

        <View style={styles.toolbarCenter}>
          <Text style={styles.toolbarTitle}>COMMANDER</Text>
          <Text style={styles.toolbarMeta}>
            {game.players.length} jugadores · {canUndo ? '↩ disponible' : 'sin undo'}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setGroupOpen(true)}
          style={[styles.toolBtn, styles.toolBtnAccent]}>
          <Text style={styles.toolBtnTextAccent}>⚡</Text>
        </Pressable>
      </View>

      <GameBoard
        game={game}
        panelEffect={panelEffect}
        globalEffect={globalEffect}
        reducedMotion={reducedMotion}
        onLifeChange={adjustPlayerLife}
        onOpenActions={setSelectedPlayerId}
        onClearPanelEffect={clearPanelEffect}
        onClearGlobalEffect={clearGlobalEffect}
      />

      <PlayerActionSheet
        visible={selectedPlayerId !== null}
        game={game}
        player={selectedPlayer}
        onClose={() => setSelectedPlayerId(null)}
        onCommanderDamage={dealCommanderDamage}
        onPoison={adjustPlayerPoison}
        onCounter={adjustPlayerCounter}
        onMonarch={setPlayerMonarch}
        onClearMonarch={clearMonarch}
        onEliminate={markEliminated}
        onRevive={markRevived}
      />

      <GroupToolsSheet
        visible={groupOpen}
        game={game}
        onClose={() => setGroupOpen(false)}
        onDamageAll={applyDamageAll}
        onHealAll={applyHealAll}
        onSetAllLife={applySetAllLife}
        onToast={showToast}
      />

      <GameMenuSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        gameStartedAt={gameStartedAt}
        canUndo={canUndo}
        onUndo={handleUndo}
        onRestart={restartGame}
        onNewGame={() => {
          setMenuOpen(false);
          router.push('/setup');
        }}
        onExit={handleExit}
      />

      <GameToastOverlay toast={toast} onDismiss={clearToast} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    backgroundColor: palette.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  toolbarCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  toolbarTitle: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.sm,
    letterSpacing: 3,
    color: palette.textPrimary,
  },
  toolbarMeta: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: palette.textMuted,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnAccent: {
    borderColor: palette.accent,
    backgroundColor: palette.accentMuted,
  },
  toolBtnText: {
    fontSize: typography.fontSize.md,
    color: palette.textSecondary,
  },
  toolBtnTextAccent: {
    fontSize: typography.fontSize.lg,
  },
});
