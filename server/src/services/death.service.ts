import type { Character, PrismaClient } from "@prisma/client"
import { hpMaxFor } from "../game/attributes.js"
import { RESURRECTION_CONFIG } from "../game/config.js"
import { applySoloRevivePenalty } from "../game/death.js"
import { CHARACTER_INCLUDE } from "./character.service.js"

export async function killCharacter(prisma: PrismaClient, character: Character, cause: string) {
  await prisma.$transaction([
    prisma.character.update({ where: { id: character.id }, data: { isAlive: false, hp: 0, diedAt: new Date() } }),
    prisma.deathRecord.create({ data: { characterId: character.id, cause, level: character.level, rank: character.rank } }),
    prisma.characterStats.update({ where: { characterId: character.id }, data: { mortes: { increment: 1 } } }),
  ])
}

export async function canReviveSolo(prisma: PrismaClient, playerId: string): Promise<boolean> {
  const vaultItem = await prisma.playerVaultItem.findUnique({
    where: { playerId_itemId: { playerId, itemId: RESURRECTION_CONFIG.soloItemId } },
  })
  return Boolean(vaultItem && vaultItem.quantity > 0)
}

export class NoResurrectionItemError extends Error {
  constructor() {
    super("Nenhum Item de Ressurreição Solo disponível.")
  }
}

export async function reviveSolo(prisma: PrismaClient, playerId: string, characterId: string) {
  const character = await prisma.character.findFirstOrThrow({ where: { id: characterId, playerId, isAlive: false } })
  const vaultItem = await prisma.playerVaultItem.findUnique({
    where: { playerId_itemId: { playerId, itemId: RESURRECTION_CONFIG.soloItemId } },
  })
  if (!vaultItem || vaultItem.quantity < 1) throw new NoResurrectionItemError()

  const { level, xp } = applySoloRevivePenalty(character.level)
  const hpMax = hpMaxFor(level, character.vitalidade)

  await prisma.$transaction([
    prisma.playerVaultItem.update({ where: { id: vaultItem.id }, data: { quantity: { decrement: 1 } } }),
    prisma.character.update({
      where: { id: character.id },
      data: { isAlive: true, diedAt: null, level, xp, hp: hpMax, hpMax },
    }),
    prisma.deathRecord.updateMany({
      where: { characterId: character.id, revivedAt: null },
      data: { revivedAt: new Date() },
    }),
    prisma.characterStats.update({ where: { characterId: character.id }, data: { ressurreicoes: { increment: 1 } } }),
  ])

  return prisma.character.findUniqueOrThrow({ where: { id: character.id }, include: CHARACTER_INCLUDE })
}
