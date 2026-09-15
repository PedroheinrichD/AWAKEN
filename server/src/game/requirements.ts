import type { Item } from "@prisma/client"
import { RANK_ORDER, RANK_REQUIREMENTS } from "./config"
import type { Attributes } from "./types"
import { Rank } from "@prisma/client"

export function rankAtLeast(rank: Rank, threshold: Rank): boolean {
  return RANK_ORDER.indexOf(rank) >= RANK_ORDER.indexOf(threshold)
}

export interface RequirementCheck {
  met: boolean
  missing: string[]
}

/** Checks an item's requirements against the character's *effective* attributes (equipment already worn, excluding the slot being replaced). */
export function checkItemRequirements(
  item: Pick<Item, "reqLevel" | "reqRank" | "reqForca" | "reqResistencia" | "reqAgilidade" | "reqVitalidade" | "reqStamina">,
  character: { level: number; rank: Rank },
  effectiveAttributes: Attributes,
): RequirementCheck {
  const missing: string[] = []

  if (item.reqLevel && character.level < item.reqLevel) missing.push(`Nível ${item.reqLevel}`)
  if (item.reqRank && !rankAtLeast(character.rank, item.reqRank)) missing.push(`Rank ${item.reqRank}`)
  if (item.reqForca && effectiveAttributes.forca < item.reqForca) missing.push(`Força ${item.reqForca}`)
  if (item.reqResistencia && effectiveAttributes.resistencia < item.reqResistencia) missing.push(`Resistência ${item.reqResistencia}`)
  if (item.reqAgilidade && effectiveAttributes.agilidade < item.reqAgilidade) missing.push(`Agilidade ${item.reqAgilidade}`)
  if (item.reqVitalidade && effectiveAttributes.vitalidade < item.reqVitalidade) missing.push(`Vitalidade ${item.reqVitalidade}`)
  if (item.reqStamina && effectiveAttributes.stamina < item.reqStamina) missing.push(`Stamina ${item.reqStamina}`)

  return { met: missing.length === 0, missing }
}

export interface RankPromotionEligibility {
  eligible: boolean
  nextRank: Rank | null
  minLevel: number
  levelMet: boolean
  trialBossId: string | null
  trialDefeated: boolean
}

export function checkRankPromotion(
  currentRank: Rank,
  level: number,
  hasDefeatedTrialBoss: (bossId: string) => boolean,
): RankPromotionEligibility {
  const index = RANK_ORDER.indexOf(currentRank)
  const next = index === -1 || index === RANK_ORDER.length - 1 ? null : RANK_ORDER[index + 1]

  if (!next) {
    return { eligible: false, nextRank: null, minLevel: 0, levelMet: true, trialBossId: null, trialDefeated: true }
  }

  const requirement = RANK_REQUIREMENTS[next]
  const levelMet = level >= requirement.minLevel
  const trialDefeated = requirement.trialBossId ? hasDefeatedTrialBoss(requirement.trialBossId) : true

  return {
    eligible: levelMet && trialDefeated,
    nextRank: next,
    minLevel: requirement.minLevel,
    levelMet,
    trialBossId: requirement.trialBossId,
    trialDefeated,
  }
}
