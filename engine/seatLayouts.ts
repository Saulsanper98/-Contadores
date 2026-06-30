/**
 * Seat layout for table-centered phone. Each panel is rotated so the
 * life total faces the player at that physical seat.
 */

export interface SeatSlot {
  playerIndex: number;
  /** Grid position (0-based) */
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  /** Rotation in degrees applied to the panel content */
  rotation: number;
}

export interface BoardGrid {
  rows: number;
  cols: number;
  seats: SeatSlot[];
}

export function getBoardGrid(playerCount: number): BoardGrid {
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
      return getBoardGrid(4);
  }
}
