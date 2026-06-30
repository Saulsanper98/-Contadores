const K = 32;

export function calculateElo(
  winnerRating: number,
  loserRating: number,
): { winnerNew: number; loserNew: number } {
  const expectedWinner = 1 / (1 + 10 ** ((loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;
  return {
    winnerNew: Math.round(winnerRating + K * (1 - expectedWinner)),
    loserNew: Math.round(loserRating + K * (0 - expectedLoser)),
  };
}
