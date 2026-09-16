import type { Boss, BossAbility } from "@prisma/client"
import { BOSS_ENCOUNTER_TO_CLIENT, RANK_TO_CLIENT } from "../mappers.js"

export function serializeBoss(boss: Boss & { abilities: BossAbility[] }, defeated: boolean) {
  return {
    id: boss.id,
    name: boss.name,
    rank: RANK_TO_CLIENT[boss.rank],
    hp: boss.hp,
    dano: boss.dano,
    description: boss.description,
    abilities: boss.abilities.map((ability) => ability.name),
    encounterType: BOSS_ENCOUNTER_TO_CLIENT[boss.encounterType],
    defeated,
  }
}

/** Deterministic "boss of the day" — the same for every player on a given calendar day, cycling through all 50. */
export function pickTodaysBoss<T>(bosses: T[]): T {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  return bosses[dayIndex % bosses.length]
}

export const BATTLE_CHALLENGE_EXERCISES = ["flexao", "agachamento", "abdominal", "burpee"]

export function challengeTargetFor(bossRankWeight: number, turnNumber: number, duplicate: boolean): number {
  const base = 15 + bossRankWeight * 4 + Math.floor(turnNumber / 2)
  return duplicate ? base * 2 : base
}
