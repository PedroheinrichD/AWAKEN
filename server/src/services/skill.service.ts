import type { PrismaClient } from "@prisma/client"
import { asIconKey } from "../mappers"
import type { ClientIconKey } from "../mappers"

export interface SerializedSkill {
  id: string
  name: string
  description: string
  effect: string
  cost: string
  cooldown: string
  duration?: string
  awakenedCondition: string
  icon: ClientIconKey
}

/** Discovers a skill for a character if it isn't already known. Returns the skill if newly discovered, otherwise null. */
export async function tryDiscoverSkill(prisma: PrismaClient, characterId: string, skillId: string): Promise<SerializedSkill | null> {
  const existing = await prisma.characterSkill.findUnique({
    where: { characterId_skillId: { characterId, skillId } },
  })
  if (existing) return null

  await prisma.characterSkill.create({ data: { characterId, skillId } })
  const skill = await prisma.skill.findUniqueOrThrow({ where: { id: skillId } })

  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    effect: skill.effect,
    cost: skill.cost,
    cooldown: skill.cooldown,
    duration: skill.duration ?? undefined,
    awakenedCondition: skill.awakenedCondition,
    icon: asIconKey(skill.icon),
  }
}
