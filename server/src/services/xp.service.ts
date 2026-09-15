import type { Character, PrismaClient } from "@prisma/client"
import { applyXp } from "../game/xp"
import { bumpRecordStats } from "./stats.service"

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

  return { character: updated, levelsGained: result.levelsGained, fromLevel: character.level, toLevel: result.level }
}
