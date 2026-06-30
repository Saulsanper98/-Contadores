import { rollD6, rollD20, flipCoin, pickRandomIndex } from '@/engine/tools';

describe('table tools', () => {
  it('rolls d6 in range 1-6', () => {
    for (let i = 0; i < 20; i++) {
      const v = rollD6();
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it('rolls d20 in range 1-20', () => {
    for (let i = 0; i < 20; i++) {
      const v = rollD20();
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(20);
    }
  });

  it('flips coin to cara or cruz', () => {
    const result = flipCoin();
    expect(['cara', 'cruz']).toContain(result);
  });

  it('picks index within range', () => {
    const index = pickRandomIndex(4);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(4);
  });
});
