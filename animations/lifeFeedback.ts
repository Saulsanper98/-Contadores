/** Base ms for a ±1 life change; scales up with larger deltas. */
export function lifeFeedbackDuration(delta: number): number {
  const magnitude = Math.max(1, Math.abs(Math.round(delta)));
  return Math.min(1600, 420 + magnitude * 220);
}

export function lifeStepInterval(totalDelta: number): number {
  const magnitude = Math.max(1, Math.abs(Math.round(totalDelta)));
  return lifeFeedbackDuration(totalDelta) / magnitude;
}

export function panelEffectDuration(magnitude = 1): number {
  const m = Math.max(1, Math.min(21, Math.round(magnitude)));
  return Math.min(1200, 520 + (m - 1) * 90);
}
