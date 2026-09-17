import { Rank } from "@prisma/client"

/**
 * Every tunable game-balance number lives in this file (claude.md §38 /
 * prompt §38). Nothing here reads the database — pure constants and
 * formulas only, so it can be retuned without touching routers or UI.
 */

export const XP_CURVE = { base: 80, exponent: 1.55 }

export function xpForLevel(level: number): number {
  return Math.round(XP_CURVE.base * level ** XP_CURVE.exponent)
}

export const MAX_LEVEL = 1000

export const HP_FORMULA = { base: 80, perLevel: 4, perVitalidade: 3 }

export const RANK_ORDER: Rank[] = [Rank.E, Rank.D, Rank.C, Rank.B, Rank.A, Rank.S, Rank.SPLUS]

export const RANK_LABEL: Record<Rank, string> = {
  E: "E",
  D: "D",
  C: "C",
  B: "B",
  A: "A",
  S: "S",
  SPLUS: "S++",
}

export function nextRank(rank: Rank): Rank | null {
  const index = RANK_ORDER.indexOf(rank)
  if (index === -1 || index === RANK_ORDER.length - 1) return null
  return RANK_ORDER[index + 1]
}

/** Minimum level unlocks the *attempt* only — the trial boss must still be defeated. */
export const RANK_REQUIREMENTS: Record<Rank, { minLevel: number; trialBossId: string | null }> = {
  E: { minLevel: 1, trialBossId: null },
  D: { minLevel: 40, trialBossId: "boss-d-01" },
  C: { minLevel: 120, trialBossId: "boss-c-01" },
  B: { minLevel: 250, trialBossId: "boss-b-01" },
  A: { minLevel: 450, trialBossId: "boss-a-01" },
  S: { minLevel: 700, trialBossId: "boss-s-01" },
  SPLUS: { minLevel: 900, trialBossId: "boss-splus-01" },
}

export const PERFORMANCE_MODIFIERS = {
  RUIM: { playerDamageMultiplier: 0.6, bossHitChance: 0.75, bossCritBonus: 0.08 },
  NORMAL: { playerDamageMultiplier: 1.0, bossHitChance: 0.55, bossCritBonus: 0.0 },
  EXCELENTE: { playerDamageMultiplier: 1.35, bossHitChance: 0.3, bossCritBonus: -0.04 },
  EXCEPCIONAL: { playerDamageMultiplier: 1.8, bossHitChance: 0.1, bossCritBonus: -0.08 },
} as const

export const BATTLE_CONFIG = {
  baseDamageFractionOfBossHp: 0.18,
  bossCritChance: 0.12,
  bossCritMultiplier: 1.6,
  bossDamageVarianceMin: 0.7,
  bossDamageVarianceMax: 1.3,
  turnTimeLimitSeconds: 45,
  maxTurns: 12,
}

export const LOOT_CONFIG = { noDropChance: 0.35 }

export const RESURRECTION_CONFIG = {
  soloItemId: "essencia-divina",
  levelPenaltyFraction: 0.5,
}

export const STREAK_CONFIG = { xpPerDay: 40 }

export const EXERCISE_XP = { perRep: 2, perKm: 25, perSecondHeld: 3 }

export const DAILY_MISSION_COUNT = 4

/** Bonus for exceeding a running mission's target distance — see game/running.ts. */
export const RUN_OVERRUN_CONFIG = {
  /** Extra km required before any bonus applies — filters GPS rounding/noise. */
  minExtraKm: 0.2,
  /** Bonus XP per extra km, as a fraction of the mission's base XP reward. */
  xpBonusPerKmFraction: 0.15,
  /** Bonus XP never exceeds this fraction of the mission's base XP reward. */
  xpBonusCapFraction: 0.5,
  /** Event currency granted per whole extra km. */
  currencyBonusPerKm: 1,
  /** Event currency bonus never exceeds this. */
  currencyBonusCap: 3,
}

export const BOSS_XP_REWARD: Record<Rank, number> = {
  E: 150,
  D: 400,
  C: 900,
  B: 1800,
  A: 3200,
  S: 5500,
  SPLUS: 9000,
}

export const POTION_HEAL_FRACTION = 0.25

/** Skills with a real (not purely flavor) mechanical effect wired into battle resolution. */
export const SKILL_EFFECT_IDS = {
  survivalPulse: "pulso-de-sobrevivencia",
  agileCritTurns: "golpe-agil",
} as const
