import type { Rank, Rarity } from "@prisma/client"

export interface LootTableEntrySeed {
  rank: Rank
  rarity: Rarity
  weight: number
}

/**
 * Rarity weights per boss rank (claude.md §25: "Boss mais poderoso = maior teto de
 * recompensa e possibilidade de itens absurdamente raros"). A flat no-drop chance
 * is applied separately in game/config.ts (LOOT_CONFIG.noDropChance) before this
 * table is even rolled. Centralized here for later rebalancing.
 */
export const LOOT_TABLE: LootTableEntrySeed[] = [
  { rank: "E", rarity: "COMUM", weight: 80 },
  { rank: "E", rarity: "INCOMUM", weight: 20 },

  { rank: "D", rarity: "COMUM", weight: 50 },
  { rank: "D", rarity: "INCOMUM", weight: 40 },
  { rank: "D", rarity: "RARO", weight: 10 },

  { rank: "C", rarity: "INCOMUM", weight: 40 },
  { rank: "C", rarity: "RARO", weight: 50 },
  { rank: "C", rarity: "ULTRA_RARO", weight: 10 },

  { rank: "B", rarity: "RARO", weight: 55 },
  { rank: "B", rarity: "ULTRA_RARO", weight: 35 },
  { rank: "B", rarity: "LENDARIO", weight: 10 },

  { rank: "A", rarity: "RARO", weight: 20 },
  { rank: "A", rarity: "ULTRA_RARO", weight: 55 },
  { rank: "A", rarity: "LENDARIO", weight: 25 },

  { rank: "S", rarity: "ULTRA_RARO", weight: 30 },
  { rank: "S", rarity: "LENDARIO", weight: 55 },
  { rank: "S", rarity: "DEUS", weight: 15 },

  { rank: "SPLUS", rarity: "LENDARIO", weight: 40 },
  { rank: "SPLUS", rarity: "DEUS", weight: 60 },
]
