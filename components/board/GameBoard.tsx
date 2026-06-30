import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import type { EffectKind, GlobalEffect, PanelEffect } from '@/animations/effects';
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
  onClearPanelEffect: () => void;
  onClearGlobalEffect: () => void;
};

function lifeFontSize(playerCount: number): number {
  if (playerCount >= 6) return typography.fontSize.xxl;
  if (playerCount >= 4) return typography.fontSize.xl;
  return typography.fontSize.lifeCounter;
}

export function GameBoard({
  game,
  panelEffect,
  globalEffect,
  reducedMotion,
  onLifeChange,
  onOpenActions,
  onClearPanelEffect,
  onClearGlobalEffect,
}: GameBoardProps) {
  const grid = useMemo(() => getBoardGrid(game.players.length), [game.players.length]);

  useEffect(() => {
    if (!globalEffect) return;
    const timer = setTimeout(onClearGlobalEffect, 700);
    return () => clearTimeout(timer);
  }, [globalEffect, onClearGlobalEffect]);

  const handleLifeChange = useCallback(
    (playerId: string, delta: number) => onLifeChange(playerId, delta),
    [onLifeChange],
  );

  const cellStyle = (row: number, col: number, rowSpan: number, colSpan: number): ViewStyle => ({
    position: 'absolute',
    left: `${(col / grid.cols) * 100}%`,
    top: `${(row / grid.rows) * 100}%`,
    width: `${(colSpan / grid.cols) * 100}%`,
    height: `${(rowSpan / grid.rows) * 100}%`,
    padding: spacing.xs / 2,
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
    <View style={styles.board}>
      <View style={styles.vignette} pointerEvents="none" />
      <View style={styles.gridGlow} pointerEvents="none" />
      {grid.seats.map((seat) => {
        const player = game.players[seat.playerIndex];
        if (!player) return null;

        const fx = resolveEffect(player.id, seat.playerIndex);

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
              onEffectEnd={() => {
                if (panelEffect?.playerId === player.id) onClearPanelEffect();
              }}
              onLifeChange={handleLifeChange}
              onOpenActions={onOpenActions}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    backgroundColor: palette.background,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: spacing.md,
    borderColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },
  gridGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.accentMuted,
    opacity: 0.15,
    zIndex: 0,
  },
});
