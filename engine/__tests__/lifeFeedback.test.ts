import { lifeFeedbackDuration, lifeStepInterval, panelEffectDuration } from '@/animations/lifeFeedback';

describe('lifeFeedback', () => {
  it('scales duration with delta magnitude', () => {
    expect(lifeFeedbackDuration(1)).toBeLessThan(lifeFeedbackDuration(5));
    expect(lifeFeedbackDuration(5)).toBeLessThanOrEqual(1600);
  });

  it('step interval divides total duration by steps', () => {
    expect(lifeStepInterval(-2)).toBe(lifeFeedbackDuration(-2) / 2);
  });

  it('panel effect duration grows with magnitude', () => {
    expect(panelEffectDuration(1)).toBeLessThan(panelEffectDuration(5));
  });
});
