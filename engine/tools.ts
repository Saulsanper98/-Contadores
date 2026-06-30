export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function flipCoin(): 'cara' | 'cruz' {
  return Math.random() < 0.5 ? 'cara' : 'cruz';
}

export function rollDN(sides: number): number {
  const safe = Math.min(100, Math.max(2, Math.floor(sides)));
  return Math.floor(Math.random() * safe) + 1;
}

export function pickRandomIndex(count: number): number {
  if (count <= 0) return 0;
  return Math.floor(Math.random() * count);
}
