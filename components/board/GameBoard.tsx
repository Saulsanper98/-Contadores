import { useCallback, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { PlayerPanel } from '@/components/board/PlayerPanel';
import { getBoardGrid } from '@/engine/seatLayouts';
import type { GameState } from '@/engine/types';
import { palette, spacing, typography } from '@/theme';

type GameBoardProps = {
  game: GameState;
  onLifeChange: (playerId: string, delta: number) => void;
  onOpenActions: (playerId: string) => void;
};

function lifeFontSize(playerCount: number): number {
  if (playerCount >= 6) return typography.fontSize.xxl;
  if (playerCount >= 4) return typography.fontSize.xl;
  return typography.fontSize.lifeCounter;
}

export function GameBoard({ game, onLifeChange, onOpenActions }: GameBoardProps) {
  const grid = useMemo(() => getBoardGrid(game.players.length), [game.players.length]);

  const handleLifeChange = useCallback(
    (playerId: string, delta: number) => onLifeChange(playerId, delta),
    [onLifeChange],
  );

  const cellStyle = (row: number, col: number, rowSpan: number, colSpan: number): ViewStyle => {
    const widthPercent = (colSpan / grid.cols) * 100;
    const heightPercent = (rowSpan / grid.rows) * 100;
    const leftPercent = (col / grid.cols) * 100;
    const topPercent = (row / grid.rows) * 100;

    return {
      position: 'absolute',
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      width: `${widthPercent}%`,
      height: `${heightPercent}%`,
      padding: spacing.xs / 2,
    };
  };

  return (
    <View style={styles.board}>
      <View style={styles.vignette} pointerEvents="none" />
      {grid.seats.map((seat) => {
        const player = game.players[seat.playerIndex];
        if (!player) return null;

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
    borderColor: 'rgba(0,0,0,0.35)',
    zIndex: 1,
    pointerEvents: 'none',
  },
});
