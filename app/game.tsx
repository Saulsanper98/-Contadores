import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameBoard } from '@/components/board/GameBoard';
import { CombatActionSheet } from '@/components/game/CombatActionSheet';
import { EventTimelineSheet } from '@/components/game/EventTimelineSheet';
import { GameMenuSheet } from '@/components/game/GameMenuSheet';
import { GameToastOverlay } from '@/components/game/GameToastOverlay';
import { GroupToolsSheet } from '@/components/game/GroupToolsSheet';
import { PlayerActionSheet } from '@/components/game/PlayerActionSheet';
import { TurnBar } from '@/components/game/TurnBar';
import { WinGameSheet } from '@/components/game/WinGameSheet';
import type { PlayerActionId } from '@/data/playerActions';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { getBoardGrid } from '@/engine/seatLayouts';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLiveClock } from '@/hooks/useLiveClock';
import { palette, radius, spacing, typography } from '@/theme';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { flushSyncQueue } from '@/sync/syncQueue';

type CombatSession = {
  sourceId: string;
  targetId: string;
};

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
  const applyDamageAll = useGameStore((state) => state.applyDamageAll);
  const applyHealAll = useGameStore((state) => state.applyHealAll);
  const applySetAllLife = useGameStore((state) => state.applySetAllLife);
  const resolveCombat = useGameStore((state) => state.resolveCombat);
  const handlePlayerAction = useGameStore((state) => state.handlePlayerAction);
  const passTurn = useGameStore((state) => state.passTurn);
  const addGameNote = useGameStore((state) => state.addGameNote);
  const adjustMulligans = useGameStore((state) => state.adjustMulligans);
  const declareWinner = useGameStore((state) => state.declareWinner);
  const syncGameToCloud = useGameStore((state) => state.syncGameToCloud);
  const syncEnabled = useSettingsStore((s) => s.syncEnabled);
  const syncApiUrl = useSettingsStore((s) => s.syncApiUrl);

  useEffect(() => {
    if (!game || !syncEnabled) return;
    void syncGameToCloud().then(() => {
      const remoteId = useGameStore.getState().game?.meta.remoteGameId;
      if (remoteId) void flushSyncQueue(syncApiUrl, remoteId);
    });
  }, [game, syncEnabled, syncApiUrl, syncGameToCloud]);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [combatSession, setCombatSession] = useState<CombatSession | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [winOpen, setWinOpen] = useState(false);

  const turnElapsedMs = useLiveClock(!!game?.turn, game?.turn?.turnStartedAt ?? null);
  const gameElapsedMs = useLiveClock(!!game?.turn, game?.turn?.gameStartedAt ?? null);

  const canUndo = past.length > 0;

  const selectedPlayer = useMemo(
    () => game?.players.find((p) => p.id === selectedPlayerId) ?? null,
    [game, selectedPlayerId],
  );

  const combatSource = useMemo(
    () => game?.players.find((p) => p.id === combatSession?.sourceId) ?? null,
    [game, combatSession],
  );

  const combatTarget = useMemo(
    () => game?.players.find((p) => p.id === combatSession?.targetId) ?? null,
    [game, combatSession],
  );

  const combatRotation = useMemo(() => {
    if (!game || !combatSession) return 0;
    const grid = getBoardGrid(game.players.length);
    const seat = grid.seats.find((s) => game.players[s.playerIndex]?.id === combatSession.sourceId);
    return seat?.rotation ?? 0;
  }, [game, combatSession]);

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

  const handleCombatReady = useCallback((sourceId: string, targetId: string) => {
    setCombatSession({ sourceId, targetId });
  }, []);

  const handlePlayerSheetAction = useCallback(
    (playerId: string, actionId: PlayerActionId) => {
      handlePlayerAction(playerId, actionId);
    },
    [handlePlayerAction],
  );

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
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <StatusBar style="light" hidden />

      <View style={[styles.toolbar, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Menú"
          onPress={() => setMenuOpen(true)}
          style={styles.toolBtn}>
          <Text style={styles.toolBtnText}>☰</Text>
        </Pressable>

        <View style={styles.toolbarCenter}>
          <Text style={styles.toolbarTitle}>COMMANDER</Text>
          <Text style={styles.toolbarMeta}>
            {game.players.length} jugadores{canUndo ? ' · ↩ undo' : ''}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Acciones de mesa"
          onPress={() => setGroupOpen(true)}
          style={[styles.toolBtn, styles.toolBtnAccent]}>
          <Text style={styles.toolBtnTextAccent}>⚡</Text>
        </Pressable>
      </View>

      <TurnBar
        game={game}
        turnElapsedMs={turnElapsedMs}
        gameElapsedMs={gameElapsedMs}
        onPassTurn={passTurn}
        onOpenTimeline={() => setTimelineOpen(true)}
      />

      <GameBoard
        game={game}
        panelEffect={panelEffect}
        globalEffect={globalEffect}
        reducedMotion={reducedMotion}
        onLifeChange={adjustPlayerLife}
        onOpenActions={setSelectedPlayerId}
        onCombatReady={handleCombatReady}
        onClearPanelEffect={clearPanelEffect}
        onClearGlobalEffect={clearGlobalEffect}
      />

      <PlayerActionSheet
        visible={selectedPlayerId !== null}
        game={game}
        player={selectedPlayer}
        onClose={() => setSelectedPlayerId(null)}
        onAction={handlePlayerSheetAction}
        onCommanderDamage={dealCommanderDamage}
        onPoison={adjustPlayerPoison}
        onCounter={adjustPlayerCounter}
        onMulligan={adjustMulligans}
        onToast={showToast}
      />

      {combatSource && combatTarget ? (
        <CombatActionSheet
          visible={combatSession !== null}
          source={combatSource}
          target={combatTarget}
          sourceRotation={combatRotation}
          onClose={() => setCombatSession(null)}
          onResolve={resolveCombat}
        />
      ) : null}

      <EventTimelineSheet
        visible={timelineOpen}
        game={game}
        onClose={() => setTimelineOpen(false)}
        onAddNote={addGameNote}
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
        game={game}
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
        onDeclareWin={() => setWinOpen(true)}
        onSync={() => {
          void syncGameToCloud();
          showToast('Sync', 'Intentando sincronizar con la web…');
        }}
      />

      <WinGameSheet
        visible={winOpen}
        game={game}
        onClose={() => setWinOpen(false)}
        onDeclare={declareWinner}
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
    paddingBottom: spacing.sm,
    gap: spacing.md,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  toolbarCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  toolbarTitle: {
    fontFamily: typography.fontFamily.sansBold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 4,
    color: palette.textPrimary,
  },
  toolbarMeta: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 10,
    color: palette.textMuted,
    letterSpacing: 0.5,
  },
  toolBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnAccent: {
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
