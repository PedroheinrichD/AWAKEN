import { Rarity } from "@prisma/client"
import { LOOT_CONFIG } from "./config"

export interface LootTableRow {
  rarity: Rarity
  weight: number
}

/** Rolls a rarity for a boss of the given rank's loot table, or null for "no drop". */
export function rollLootRarity(entries: LootTableRow[]): Rarity | null {
  if (Math.random() < LOOT_CONFIG.noDropChance || entries.length === 0) return null

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0)
  if (totalWeight <= 0) return null

  let roll = Math.random() * totalWeight
  for (const entry of entries) {
    roll -= entry.weight
    if (roll <= 0) return entry.rarity
  }
  return entries[entries.length - 1].rarity
}

export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null
  return items[Math.floor(Math.random() * items.length)]
}
