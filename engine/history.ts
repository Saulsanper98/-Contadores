import type { GameState } from './types';

export const MAX_HISTORY = 50;

export function pushSnapshot(
  stack: GameState[],
  snapshot: GameState,
  max = MAX_HISTORY,
): GameState[] {
  return [...stack.slice(-(max - 1)), snapshot];
}

export function popSnapshot(stack: GameState[]): {
  state: GameState | null;
  stack: GameState[];
} {
  if (stack.length === 0) {
    return { state: null, stack: [] };
  }
  const state = stack[stack.length - 1];
  return { state, stack: stack.slice(0, -1) };
}
