import type { PrismaClient } from "@prisma/client"
import type { AchievementFacts } from "../game/achievements.js"
import { evaluateNewAchievements } from "../game/achievements.js"
import { todayDateOnly } from "../utils/date.js"

export async function gatherAchievementFacts(
  prisma: PrismaClient,
  characterId: string,
  extra: Partial<AchievementFacts> = {},
): Promise<AchievementFacts> {
  const [character, stats, ultraRaroCount, todayFlexoes] = await Promise.all([
    prisma.character.findUniqueOrThrow({ where: { id: characterId } }),
    prisma.characterStats.findUniqueOrThrow({ where: { characterId } }),
    prisma.inventoryItem.count({
      where: { characterId, item: { rarity: { in: ["ULTRA_RARO", "LENDARIO", "DEUS"] } } },
    }),
    prisma.exerciseLog.aggregate({
      where: { characterId, exerciseId: "flexao", performedAt: { gte: todayDateOnly() } },
      _sum: { reps: true },
    }),
  ])

  return {
    bossesDerrotados: stats.bossesDerrotados,
    streakCurrent: character.streakCurrent,
    survivedCriticalHp: false,
    flexoesInSingleDay: todayFlexoes._sum.reps ?? 0,
    x1Wins: stats.vitoriasX1,
    ownsUltraRaroOrAbove: ultraRaroCount > 0,
    level: character.level,
    ...extra,
  }
}

function serializeAchievement(achievement: { id: string; name: string; description: string; icon: string }) {
  return { id: achievement.id, name: achievement.name, description: achievement.description, icon: achievement.icon }
}

export async function unlockAchievements(prisma: PrismaClient, characterId: string, extraFacts: Partial<AchievementFacts> = {}) {
  const [achievements, unlockedRows, facts] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.characterAchievement.findMany({ where: { characterId }, select: { achievementId: true } }),
    gatherAchievementFacts(prisma, characterId, extraFacts),
  ])

  const alreadyUnlocked = new Set(unlockedRows.map((row) => row.achievementId))
  const newIds = evaluateNewAchievements(facts, achievements, alreadyUnlocked)
  if (newIds.length === 0) return []

  await prisma.characterAchievement.createMany({
    data: newIds.map((achievementId) => ({ characterId, achievementId })),
  })

  // Some achievements share an id with a matching Title (boss-hunter, the-tireless, survivor, first-blood) —
  // unlocking the feat also unlocks the title, per claude.md §32 ("Conquistas podem conceder títulos").
  const matchingTitles = await prisma.title.findMany({ where: { id: { in: newIds } } })
  if (matchingTitles.length > 0) {
    await prisma.characterTitle.createMany({
      data: matchingTitles.map((title) => ({ characterId, titleId: title.id })),
      skipDuplicates: true,
    })
  }

  return achievements.filter((achievement) => newIds.includes(achievement.id)).map(serializeAchievement)
}
