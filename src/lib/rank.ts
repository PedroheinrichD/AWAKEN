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
