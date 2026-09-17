export type Rank = "E" | "D" | "C" | "B" | "A" | "S" | "S++"

interface RankConfig {
  slug: string
  weight: number
  danger: string
}

export const RANK_ORDER: Rank[] = ["E", "D", "C", "B", "A", "S", "S++"]

export const RANK_CONFIG: Record<Rank, RankConfig> = {
  E: { slug: "rank-e", weight: 0, danger: "Trivial" },
  D: { slug: "rank-d", weight: 1, danger: "Baixo" },
  C: { slug: "rank-c", weight: 2, danger: "Moderado" },
  B: { slug: "rank-b", weight: 3, danger: "Elevado" },
  A: { slug: "rank-a", weight: 4, danger: "Severo" },
  S: { slug: "rank-s", weight: 5, danger: "Extremo" },
  "S++": { slug: "rank-splus", weight: 6, danger: "Apocalíptico" },
}

export function rankAtLeast(rank: Rank, threshold: Rank): boolean {
  return RANK_CONFIG[rank].weight >= RANK_CONFIG[threshold].weight
}

interface RankEffectConfig {
  /** Static glow strength (boxShadow blur, px) — 0 means no glow at all. */
  glowPx: number
  /** Slow breathing opacity (see --animate-pulse-slow). */
  pulse: boolean
  /** Thin rotating ring around the badge, one size up from the badge itself. */
  ring: boolean
  /** Full animated shimmer gradient fill — reserved for the very top rank. */
  shimmer: boolean
}

/**
 * Visual intensity ramps with rank difficulty (claude.md §19 — a higher rank should
 * feel like a real step up, not just a different color). Every rank uses primitives
 * that already exist elsewhere in the app (pulse-slow, shimmer, the spinning-sigil
 * pattern from BossSigil) instead of inventing new effects per tier.
 */
export const RANK_EFFECTS: Record<Rank, RankEffectConfig> = {
  E: { glowPx: 0, pulse: false, ring: false, shimmer: false },
  D: { glowPx: 6, pulse: false, ring: false, shimmer: false },
  C: { glowPx: 10, pulse: false, ring: false, shimmer: false },
  B: { glowPx: 14, pulse: true, ring: false, shimmer: false },
  A: { glowPx: 18, pulse: true, ring: true, shimmer: false },
  S: { glowPx: 24, pulse: true, ring: true, shimmer: false },
  "S++": { glowPx: 30, pulse: true, ring: true, shimmer: true },
}
