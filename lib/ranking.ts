import { emptyScore, type Score } from "./scoring";
import type { Critic, Settings } from "./types";

export type RankedCritic = Critic & { score: Score; position: number };
export type Ranking = { mode: "editorial" | "community"; entries: RankedCritic[]; eligibleCount: number; settings: Settings };

export const DEFAULT_SETTINGS: Settings = { min_votes: 50, community_size: 10, force_editorial: false };

/**
 * The community order takes over once at least `community_size` critics have
 * each reached `min_votes`. Until then the editorial order stands.
 */
export function computeRanking(critics: Critic[], scores: Map<string, Score>, settings: Settings): Ranking {
  const withScore = critics.map((c) => ({ ...c, score: scores.get(c.id) ?? emptyScore(c.id) }));
  const eligible = withScore.filter((c) => c.score.eligible);
  const community = !settings.force_editorial && eligible.length >= settings.community_size;
  const ordered = community
    ? [...eligible].sort((a, b) => b.score.wilson - a.score.wilson || b.score.total - a.score.total)
    : withScore.filter((c) => c.editorial_rank !== null).sort((a, b) => a.editorial_rank! - b.editorial_rank!);
  return {
    mode: community ? "community" : "editorial",
    entries: ordered.slice(0, settings.community_size).map((c, i) => ({ ...c, position: i + 1 })),
    eligibleCount: eligible.length,
    settings,
  };
}

export function toScoreMap(rows: Score[] | null | undefined) {
  const map = new Map<string, Score>();
  for (const s of rows ?? []) map.set(s.critic_id, { ...s, wilson: Number(s.wilson), rotten_pct: s.rotten_pct === null ? null : Number(s.rotten_pct) });
  return map;
}
