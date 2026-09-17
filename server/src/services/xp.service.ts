import type { Character, PrismaClient } from "@prisma/client"
import { applyXp } from "../game/xp.js"
import { checkRankPromotion } from "../game/requirements.js"
import { bumpRecordStats } from "./stats.service.js"

export async function grantXp(prisma: PrismaClient, character: Character, xpGained: number) {
  const result = applyXp(
    {
      level: character.level,
      xp: character.xp,
      hp: character.hp,
      attributes: {
        forca: character.forca,
        resistencia: character.resistencia,
        agilidade: character.agilidade,
        vitalidade: character.vitalidade,
        stamina: character.stamina,
      },
    },
    xpGained,
  )

  const updated = await prisma.character.update({
    where: { id: character.id },
    data: {
      level: result.level,
      xp: result.xp,
      hp: result.hp,
      hpMax: result.hpMax,
      forca: result.attributes.forca,
      resistencia: result.attributes.resistencia,
      agilidade: result.attributes.agilidade,
      vitalidade: result.attributes.vitalidade,
      stamina: result.attributes.stamina,
    },
  })

  if (result.levelsGained > 0) {
    await bumpRecordStats(prisma, character.id, result.level, character.rank, character.streakCurrent)
  }

  // Only true on the grant that pushes the level across the next rank's minLevel — a
  // later grant sees the *old* level already at/above the threshold, so this won't refire
  // every time the player is simply eligible (claude.md §4 — promotion should feel like a
  // real moment, not a state the UI silently sits in).
  const rankStatus = checkRankPromotion(character.rank, result.level, () => false)
  const rankPromotionJustUnlocked =
    rankStatus.nextRank && rankStatus.levelMet && character.level < rankStatus.minLevel
      ? { rank: rankStatus.nextRank, minLevel: rankStatus.minLevel }
      : null

  return {
    character: updated,
    levelsGained: result.levelsGained,
    fromLevel: character.level,
    toLevel: result.level,
    rankPromotionJustUnlocked,
  }
}
