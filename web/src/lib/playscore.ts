export type PlayscoreRules = Record<string, number>;

export const DEFAULT_PLAYSCORE: PlayscoreRules = {
  kill: 3,
  first_blood: 1,
  long_turn_penalty: -1,
  save_ally: 2,
  infinite_combo_penalty: -2,
};

export function scoreFromEvents(
  events: { kind: string; playerId?: string | null; sourceId?: string | null }[],
  rules: PlayscoreRules = DEFAULT_PLAYSCORE,
): Record<string, number> {
  const scores: Record<string, number> = {};

  const add = (name: string, pts: number) => {
    scores[name] = (scores[name] ?? 0) + pts;
  };

  for (const e of events) {
    if (e.kind === 'knockout' && e.sourceId) {
      const killer = e.sourceId;
      add(killer, rules.kill ?? 0);
    }
    if (e.kind === 'first_blood' && e.playerId) {
      add(e.playerId, rules.first_blood ?? 0);
    }
  }

  return scores;
}
