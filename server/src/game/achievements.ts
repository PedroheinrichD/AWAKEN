export interface AchievementFacts {
  bossesDerrotados: number
  streakCurrent: number
  survivedCriticalHp: boolean
  flexoesInSingleDay: number
  x1Wins: number
  ownsUltraRaroOrAbove: boolean
  level: number
}

type ConditionEvaluator = (facts: AchievementFacts) => boolean

/** conditionKey -> predicate. Keys are seeded on the Achievement rows, evaluators live only here. */
export const ACHIEVEMENT_CONDITIONS: Record<string, ConditionEvaluator> = {
  BOSSES_DEFEATED_10: (f) => f.bossesDerrotados >= 10,
  STREAK_20: (f) => f.streakCurrent >= 20,
  SURVIVED_CRITICAL_HP: (f) => f.survivedCriticalHp,
  SINGLE_DAY_FLEXOES_100: (f) => f.flexoesInSingleDay >= 100,
  X1_FIRST_WIN: (f) => f.x1Wins >= 1,
  OWNS_ULTRA_RARO_ITEM: (f) => f.ownsUltraRaroOrAbove,
}

export function evaluateNewAchievements(
  facts: AchievementFacts,
  achievements: { id: string; conditionKey: string }[],
  alreadyUnlockedIds: Set<string>,
): string[] {
  const newlyUnlocked: string[] = []
  for (const achievement of achievements) {
    if (alreadyUnlockedIds.has(achievement.id)) continue
    const evaluator = ACHIEVEMENT_CONDITIONS[achievement.conditionKey]
    if (evaluator?.(facts)) newlyUnlocked.push(achievement.id)
  }
  return newlyUnlocked
}
