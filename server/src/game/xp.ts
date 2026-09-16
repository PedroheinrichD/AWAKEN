import { attributeGainForLevel, hpMaxFor } from "./attributes.js"
import { MAX_LEVEL, xpForLevel } from "./config.js"
import type { Attributes } from "./types.js"

export interface XpApplyInput {
  level: number
  xp: number
  attributes: Attributes
  hp: number
}

export interface XpApplyResult {
  level: number
  xp: number
  attributes: Attributes
  hp: number
  hpMax: number
  levelsGained: number
}

/** Applies an XP grant, cascading through as many level-ups as the amount covers. */
export function applyXp(input: XpApplyInput, xpGained: number): XpApplyResult {
  let level = input.level
  let xp = input.xp + Math.max(0, xpGained)
  const attributes = { ...input.attributes }
  let levelsGained = 0
  let hpMax = hpMaxFor(level, attributes.vitalidade)
  let hp = input.hp

  while (level < MAX_LEVEL) {
    const required = xpForLevel(level)
    if (xp < required) break
    xp -= required
    level += 1
    levelsGained += 1

    const grownAttribute = attributeGainForLevel(level)
    attributes[grownAttribute] += 1

    const newHpMax = hpMaxFor(level, attributes.vitalidade)
    hp += newHpMax - hpMax
    hpMax = newHpMax
  }

  if (level >= MAX_LEVEL) {
    level = MAX_LEVEL
    xp = 0
  }

  hp = Math.min(hp, hpMax)

  return { level, xp, attributes, hp, hpMax, levelsGained }
}
