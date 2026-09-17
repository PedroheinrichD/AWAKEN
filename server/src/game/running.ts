import { RUN_OVERRUN_CONFIG } from "./config.js"

export interface RunOverrunBonus {
  xp: number
  currency: number
}

/**
 * Bonus for running beyond a mission's target distance. Scales with the extra
 * distance but is capped low relative to the mission's own reward — going further
 * is worth celebrating, not worth making the primary reward source (claude.md §36).
 */
export function runOverrunBonus(baseXpReward: number, targetKm: number, distanceKm: number): RunOverrunBonus {
  const extraKm = distanceKm - targetKm
  if (extraKm < RUN_OVERRUN_CONFIG.minExtraKm) return { xp: 0, currency: 0 }

  const xpCap = Math.round(baseXpReward * RUN_OVERRUN_CONFIG.xpBonusCapFraction)
  const xp = Math.min(xpCap, Math.round(extraKm * baseXpReward * RUN_OVERRUN_CONFIG.xpBonusPerKmFraction))
  const currency = Math.min(RUN_OVERRUN_CONFIG.currencyBonusCap, Math.floor(extraKm * RUN_OVERRUN_CONFIG.currencyBonusPerKm))

  return { xp, currency }
}
