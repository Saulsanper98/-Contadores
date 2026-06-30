import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import type { EffectKind, GlobalEffect, PanelEffect } from '@/animations/effects';
import {
  CombatDragOverlay,
  findPanelAtPoint,
  type CombatDragState,
  type PanelBounds,
} from '@/components/board/CombatDragOverlay';
import { PlayerPanel } from '@/components/board/PlayerPanel';
import { getBoardGrid } from '@/engine/seatLayouts';
import type { GameState } from '@/engine/types';
import { palette, spacing, typography } from '@/theme';

type GameBoardProps = {
  game: GameState;
  panelEffect: PanelEffect | null;
  globalEffect: GlobalEffect | null;
  reducedMotion?: boolean;
  onLifeChange: (playerId: string, delta: number) => void;
  onOpenActions: (playerId: string) => void;
  onCombatReady: (sourceId: string, targetId: string) => void;
  onClearPanelEffect: () => void;
  onClearGlobalEffect: () => void;
};

function lifeFontSize(playerCount: number): number {
  if (playerCount >= 6) return typography.fontSize.lifeCounter;
  if (playerCount >= 4) return typography.fontSize.lifeCounterLarge;
  return typography.fontSize.lifeCounterHero;
}

const PANEL_GAP = 3;

export function GameBoard({
  game,
  panelEffect,
  globalEffect,
  reducedMotion,
  onLifeChange,
  onOpenActions,
  onCombatReady,
  onClearPanelEffect,
  onClearGlobalEffect,
}: GameBoardProps) {
  const grid = useMemo(() => getBoardGrid(game.players.length), [game.players.length]);
  const boardRef = useRef<View>(null);
  const panelBoundsRef = useRef<PanelBounds[]>([]);
  const [combatDrag, setCombatDrag] = useState<CombatDragState>(null);

  useEffect(() => {
    if (!globalEffect) return;
    const timer = setTimeout(onClearGlobalEffect, 700);
    return () => clearTimeout(timer);
  }, [globalEffect, onClearGlobalEffect]);

  const handleLifeChange = useCallback(
    (playerId: string, delta: number) => onLifeChange(playerId, delta),
    [onLifeChange],
  );

  const registerPanelBounds = useCallback((bounds: PanelBounds) => {
    const list = panelBoundsRef.current.filter((b) => b.playerId !== bounds.playerId);
    panelBoundsRef.current = [...list, bounds];
  }, []);

  const handleAttackDragStart = useCallback((sourceId: string, x: number, y: number) => {
    setCombatDrag({ sourceId, x, y, targetId: null });
  }, []);

  const handleAttackDragMove = useCallback((sourceId: string, x: number, y: number) => {
    const targetId = findPanelAtPoint(panelBoundsRef.current, x, y, sourceId);
    setCombatDrag({ sourceId, x, y, targetId });
  }, []);

  const handleAttackDragEnd = useCallback(
    (sourceId: string, x: number, y: number) => {
      const targetId = findPanelAtPoint(panelBoundsRef.current, x, y, sourceId);
      setCombatDrag(null);
      if (targetId) {
        onCombatReady(sourceId, targetId);
      }
    },
    [onCombatReady],
  );

  const cellStyle = (row: number, col: number, rowSpan: number, colSpan: number): ViewStyle => ({
    position: 'absolute',
    left: `${(col / grid.cols) * 100}%`,
    top: `${(row / grid.rows) * 100}%`,
    width: `${(colSpan / grid.cols) * 100}%`,
    height: `${(rowSpan / grid.rows) * 100}%`,
    padding: PANEL_GAP,
  });

  const resolveEffect = (
    playerId: string,
    seatIndex: number,
  ): { id: number; kind: EffectKind | null } => {
    if (panelEffect?.playerId === playerId) {
      return { id: panelEffect.id, kind: panelEffect.kind };
    }
    if (globalEffect) {
      const kind = globalEffect.kind === 'groupHeal' ? 'groupHeal' : 'groupDamage';
      return { id: globalEffect.id * 100 + seatIndex, kind };
    }
    return { id: 0, kind: null };
  };

  return (
    <View ref={boardRef} style={styles.board} collapsable={false}>
      <View style={styles.tableCenter} pointerEvents="none">
        <View style={styles.tableRing} />
      </View>

      {grid.seats.map((seat) => {
        const player = game.players[seat.playerIndex];
        if (!player) return null;

        const fx = resolveEffect(player.id, seat.playerIndex);
        const isDragTarget = combatDrag?.targetId === player.id;
        const isDragSource = combatDrag?.sourceId === player.id;

        return (
          <View
            key={player.id}
            style={cellStyle(seat.row, seat.col, seat.rowSpan, seat.colSpan)}>
            <PlayerPanel
              player={player}
              seatIndex={seat.playerIndex}
              rotation={seat.rotation}
              lifeFontSize={lifeFontSize(game.players.length)}
              isMonarch={game.monarchPlayerId === player.id}
              effectId={fx.id}
              effectKind={fx.kind}
              reducedMotion={reducedMotion}
              combatHighlight={isDragTarget ? 'target' : isDragSource ? 'source' : null}
              onRegisterBounds={registerPanelBounds}
              onAttackDragStart={(x, y) => handleAttackDragStart(player.id, x, y)}
              onAttackDragMove={(x, y) => handleAttackDragMove(player.id, x, y)}
              onAttackDragEnd={(x, y) => handleAttackDragEnd(player.id, x, y)}
              onEffectEnd={() => {
                if (panelEffect?.playerId === player.id) onClearPanelEffect();
              }}
              onLifeChange={handleLifeChange}
              onOpenActions={onOpenActions}
            />
          </View>
        );
      })}

      <CombatDragOverlay drag={combatDrag} panelBounds={panelBoundsRef.current} />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    backgroundColor: palette.background,
    padding: spacing.xs,
  },
  tableCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  tableRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
});
