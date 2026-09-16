import { RESURRECTION_CONFIG } from "./config.js"

export interface ReviveResult {
  level: number
  xp: number
}

/** Solo resurrection restores the character but at a real cost — never a full restore. */
export function applySoloRevivePenalty(levelAtDeath: number): ReviveResult {
  const level = Math.max(1, Math.floor(levelAtDeath * RESURRECTION_CONFIG.levelPenaltyFraction))
  return { level, xp: 0 }
}
