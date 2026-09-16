import type { PrismaClient, Rank } from "@prisma/client"
import { pickRandom, rollLootRarity } from "../game/loot.js"
import { serializeItem } from "./item.service.js"
import { incrementStats } from "./stats.service.js"

export async function rollAndGrantBossLoot(prisma: PrismaClient, characterId: string, bossRank: Rank) {
  const entries = await prisma.lootTableEntry.findMany({ where: { rank: bossRank } })
  const rarity = rollLootRarity(entries)
  if (!rarity) return null

  const candidates = await prisma.item.findMany({ where: { rarity } })
  const item = pickRandom(candidates)
  if (!item) return null

  await prisma.inventoryItem.upsert({
    where: { characterId_itemId: { characterId, itemId: item.id } },
    update: { quantity: { increment: 1 } },
    create: { characterId, itemId: item.id, quantity: 1, source: "boss" },
  })

  if (item.rarity === "LENDARIO") await incrementStats(prisma, characterId, { itensLendarios: 1 })
  if (item.rarity === "DEUS") await incrementStats(prisma, characterId, { itensDeus: 1 })

  return serializeItem(item)
}
