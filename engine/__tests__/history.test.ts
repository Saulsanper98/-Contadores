import { createDefaultSetup, createGameFromSetup } from '@/engine/gameEngine';
import { popSnapshot, pushSnapshot } from '@/engine/history';

describe('history', () => {
  it('pushes and pops snapshots', () => {
    const setup = createDefaultSetup(2);
    const g1 = createGameFromSetup(setup);
    const g2 = createGameFromSetup({ ...setup, startingLife: 30 });

    let stack = pushSnapshot([], g1);
    expect(stack).toHaveLength(1);

    stack = pushSnapshot(stack, g2);
    const { state, stack: next } = popSnapshot(stack);
    expect(state?.setup.startingLife).toBe(30);
    expect(next).toHaveLength(1);
  });

  it('caps history length', () => {
    const setup = createDefaultSetup(2);
    let stack: ReturnType<typeof createGameFromSetup>[] = [];
    for (let i = 0; i < 60; i++) {
      stack = pushSnapshot(stack, createGameFromSetup(setup), 50);
    }
    expect(stack.length).toBeLessThanOrEqual(50);
  });
});
