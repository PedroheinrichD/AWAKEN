export type Rarity = "comum" | "incomum" | "raro" | "ultraRaro" | "lendario" | "deus"

interface RarityConfig {
  label: string
  slug: string
  weight: number
  shimmer?: "gold" | "deus"
}

export const RARITY_ORDER: Rarity[] = ["comum", "incomum", "raro", "ultraRaro", "lendario", "deus"]

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  comum: { label: "Comum", slug: "rarity-comum", weight: 0 },
  incomum: { label: "Incomum", slug: "rarity-incomum", weight: 1 },
  raro: { label: "Raro", slug: "rarity-raro", weight: 2 },
  ultraRaro: { label: "Ultra Raro", slug: "rarity-ultrararo", weight: 3 },
  lendario: { label: "Lendário", slug: "rarity-lendario", weight: 4, shimmer: "gold" },
  deus: { label: "DEUS", slug: "rarity-deus", weight: 5, shimmer: "deus" },
}

export function rarityAtLeast(rarity: Rarity, threshold: Rarity): boolean {
  return RARITY_CONFIG[rarity].weight >= RARITY_CONFIG[threshold].weight
}
