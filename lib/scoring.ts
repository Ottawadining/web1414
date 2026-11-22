export type Score = {
  critic_id: string;
  rotten: number;
  not_rotten: number;
  total: number;
  rotten_pct: number | null;
  wilson: number;
  eligible: boolean;
  community_rank: number | null;
};

/** Mirror of the SQL implementation, used for explanations and tests. */
export function wilsonLower(positive: number, total: number, z = 1.96) {
  if (total === 0) return 0;
  const p = positive / total;
  const z2 = z * z;
  return (p + z2 / (2 * total) - z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total)) / (1 + z2 / total);
}

export function pct(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${Math.round(Number(n) * 100)}%`;
}

export const emptyScore = (critic_id: string): Score => ({
  critic_id, rotten: 0, not_rotten: 0, total: 0, rotten_pct: null, wilson: 0, eligible: false, community_rank: null,
});
