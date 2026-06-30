import type { TableLayoutId } from './types';

export interface SeatSlot {
  playerIndex: number;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  rotation: number;
}

export interface BoardGrid {
  rows: number;
  cols: number;
  seats: SeatSlot[];
}

const LAYOUTS: Record<TableLayoutId, (count: number) => BoardGrid> = {
  center: getCenterLayout,
  compact: getCompactLayout,
  classic: getClassicLayout,
};

export function getBoardGrid(playerCount: number, layoutId: TableLayoutId = 'center'): BoardGrid {
  const factory = LAYOUTS[layoutId] ?? getCenterLayout;
  return factory(playerCount);
}

export const TABLE_LAYOUT_OPTIONS: { id: TableLayoutId; label: string; description: string }[] = [
  { id: 'center', label: 'Centro de mesa', description: 'Teléfono en el centro, paneles rotados' },
  { id: 'compact', label: 'Compacto', description: 'Cuadrícula densa, menos espacio' },
  { id: 'classic', label: 'Clásico', description: 'Rotaciones suaves tipo playmat' },
];

function getCenterLayout(playerCount: number): BoardGrid {
  switch (playerCount) {
    case 2:
      return {
        rows: 2,
        cols: 1,
        seats: [
          { playerIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1, rotation: 180 },
          { playerIndex: 0, row: 1, col: 0, rowSpan: 1, colSpan: 1, rotation: 0 },
        ],
      };
    case 3:
      return {
        rows: 2,
        cols: 2,
        seats: [
          { playerIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1, rotation: 180 },
          { playerIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1, rotation: 180 },
          { playerIndex: 0, row: 1, col: 0, rowSpan: 1, colSpan: 2, rotation: 0 },
        ],
      };
    case 4:
      return {
        rows: 2,
        cols: 2,
        seats: [
          { playerIndex: 2, row: 0, col: 0, rowSpan: 1, colSpan: 1, rotation: 225 },
          { playerIndex: 3, row: 0, col: 1, rowSpan: 1, colSpan: 1, rotation: 315 },
          { playerIndex: 0, row: 1, col: 0, rowSpan: 1, colSpan: 1, rotation: 135 },
          { playerIndex: 1, row: 1, col: 1, rowSpan: 1, colSpan: 1, rotation: 45 },
        ],
      };
    case 5:
      return {
        rows: 3,
        cols: 2,
        seats: [
          { playerIndex: 3, row: 0, col: 0, rowSpan: 1, colSpan: 1, rotation: 225 },
          { playerIndex: 4, row: 0, col: 1, rowSpan: 1, colSpan: 1, rotation: 315 },
          { playerIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1, rotation: 180 },
          { playerIndex: 2, row: 1, col: 1, rowSpan: 1, colSpan: 1, rotation: 180 },
          { playerIndex: 0, row: 2, col: 0, rowSpan: 1, colSpan: 2, rotation: 0 },
        ],
      };
    case 6:
      return {
        rows: 3,
        cols: 2,
        seats: [
          { playerIndex: 3, row: 0, col: 0, rowSpan: 1, colSpan: 1, rotation: 225 },
          { playerIndex: 4, row: 0, col: 1, rowSpan: 1, colSpan: 1, rotation: 315 },
          { playerIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1, rotation: 180 },
          { playerIndex: 5, row: 1, col: 1, rowSpan: 1, colSpan: 1, rotation: 180 },
          { playerIndex: 0, row: 2, col: 0, rowSpan: 1, colSpan: 1, rotation: 135 },
          { playerIndex: 1, row: 2, col: 1, rowSpan: 1, colSpan: 1, rotation: 45 },
        ],
      };
    default:
      return getCenterLayout(4);
  }
}

function getCompactLayout(playerCount: number): BoardGrid {
  const base = getCenterLayout(playerCount);
  return {
    ...base,
    seats: base.seats.map((seat) => ({
      ...seat,
      rotation: seat.rotation === 180 ? 180 : seat.rotation === 0 ? 0 : 180,
    })),
  };
}

function getClassicLayout(playerCount: number): BoardGrid {
  const base = getCenterLayout(playerCount);
  return {
    ...base,
    seats: base.seats.map((seat) => ({
      ...seat,
      rotation: [0, 90, 180, 270][seat.playerIndex % 4],
    })),
  };
}
