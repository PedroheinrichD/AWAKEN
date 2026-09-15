import type { BodyType, Character, CharacterEquipment, EquipmentSlot, HairStyle, Item, PrismaClient, Title } from "@prisma/client"
import { hpMaxFor } from "../game/attributes"
import { xpForLevel } from "../game/config"
import { BODY_TYPE_TO_CLIENT, HAIR_STYLE_TO_CLIENT, RANK_TO_CLIENT, SLOT_TO_CLIENT } from "../mappers"
import { ONE_DAY_MS, dateOnly, todayDateOnly } from "../utils/date"

export type CharacterWithRelations = Character & {
  equippedTitle: Title | null
  equipment: (CharacterEquipment & { item: Item })[]
}

export const CHARACTER_INCLUDE = {
  equippedTitle: true,
  equipment: { include: { item: true } },
} as const

export function serializeCharacter(character: CharacterWithRelations) {
  const equipment: Record<string, string> = {}
  for (const eq of character.equipment) {
    equipment[SLOT_TO_CLIENT[eq.slot]] = eq.itemId
  }

  return {
    id: character.id,
    name: character.name,
    rank: RANK_TO_CLIENT[character.rank],
    level: character.level,
    xp: character.xp,
    xpToNext: xpForLevel(character.level),
    hp: character.hp,
    hpMax: character.hpMax,
    attributes: {
      forca: character.forca,
      resistencia: character.resistencia,
      agilidade: character.agilidade,
      vitalidade: character.vitalidade,
      stamina: character.stamina,
    },
    streak: character.streakCurrent,
    streakLongest: character.streakLongest,
    eventCurrency: character.eventCurrency,
    equippedTitle: character.equippedTitleId,
    isAlive: character.isAlive,
    appearance: {
      skinTone: character.skinTone,
      hairStyle: HAIR_STYLE_TO_CLIENT[character.hairStyle],
      hairColor: character.hairColor,
      eyeColor: character.eyeColor,
      bodyType: BODY_TYPE_TO_CLIENT[character.bodyType],
    },
    equipment,
  }
}

export function getEquippedBonuses(character: CharacterWithRelations, excludeSlot?: EquipmentSlot) {
  return character.equipment
    .filter((eq) => eq.slot !== excludeSlot)
    .map((eq) => ({
      bonusForca: eq.item.bonusForca,
      bonusResistencia: eq.item.bonusResistencia,
      bonusAgilidade: eq.item.bonusAgilidade,
      bonusVitalidade: eq.item.bonusVitalidade,
      bonusStamina: eq.item.bonusStamina,
    }))
}

export interface StreakBumpResult {
  streakCurrent: number
  changed: boolean
}

/** Call once per character action that should count toward the daily streak (mission complete, exercise log). */
export async function bumpStreakIfNewDay(prisma: PrismaClient, character: Character): Promise<StreakBumpResult> {
  const today = todayDateOnly()
  const last = character.lastActiveDate ? dateOnly(character.lastActiveDate) : null

  if (last && last.getTime() === today.getTime()) {
    return { streakCurrent: character.streakCurrent, changed: false }
  }

  const isConsecutive = last !== null && today.getTime() - last.getTime() === ONE_DAY_MS
  const streakCurrent = isConsecutive ? character.streakCurrent + 1 : 1
  const streakLongest = Math.max(character.streakLongest, streakCurrent)

  await prisma.character.update({
    where: { id: character.id },
    data: { streakCurrent, streakLongest, lastActiveDate: today },
  })

  return { streakCurrent, changed: true }
}

export async function getAliveCharacter(prisma: PrismaClient, playerId: string) {
  return prisma.character.findFirst({
    where: { playerId, isAlive: true },
    include: CHARACTER_INCLUDE,
  })
}

export class NoActiveCharacterError extends Error {
  constructor() {
    super("Nenhum personagem vivo encontrado.")
  }
}

export async function requireActiveCharacter(prisma: PrismaClient, playerId: string) {
  const character = await getAliveCharacter(prisma, playerId)
  if (!character) throw new NoActiveCharacterError()
  return character
}

/** Comum-tier gear every new character starts with — deliberately unexciting; everything else is earned. */
export const STARTER_ITEM_IDS = ["lamina-do-iniciante", "armadura-de-couro", "calca-de-couro", "botas-de-viajante"]

export interface NewCharacterAppearance {
  skinTone: string
  hairStyle: HairStyle
  hairColor: string
  eyeColor: string
  bodyType: BodyType
}

export async function createCharacterForPlayer(
  prisma: PrismaClient,
  playerId: string,
  name: string,
  appearance: NewCharacterAppearance,
) {
  const level = 1
  const vitalidade = 10
  const hpMax = hpMaxFor(level, vitalidade)

  const characterId = await prisma.$transaction(async (tx) => {
    const character = await tx.character.create({
      data: { playerId, name, level, hp: hpMax, hpMax, ...appearance },
    })

    await tx.characterStats.create({ data: { characterId: character.id } })

    for (const itemId of STARTER_ITEM_IDS) {
      await tx.inventoryItem.create({
        data: { characterId: character.id, itemId, quantity: 1, source: "starter" },
      })
      const item = await tx.item.findUniqueOrThrow({ where: { id: itemId } })
      if (item.slot) {
        await tx.characterEquipment.create({
          data: { characterId: character.id, slot: item.slot, itemId },
        })
      }
    }

    return character.id
  })

  return prisma.character.findUniqueOrThrow({ where: { id: characterId }, include: CHARACTER_INCLUDE })
}
