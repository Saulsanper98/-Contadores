export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function flipCoin(): 'cara' | 'cruz' {
  return Math.random() < 0.5 ? 'cara' : 'cruz';
}

export function pickRandomIndex(count: number): number {
  if (count <= 0) return 0;
  return Math.floor(Math.random() * count);
}
