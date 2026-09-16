import { asIconKey } from "../../mappers.js"
import { requireActiveCharacter } from "../helpers.js"
import { protectedProcedure, router } from "../trpc.js"

/** The only skills endpoint. It only ever reads through CharacterSkill — the
 * Skill catalog (including the secret pool) is never listed generically. */
export const skillsRouter = router({
  discovered: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const rows = await ctx.prisma.characterSkill.findMany({
      where: { characterId: character.id },
      include: { skill: true },
      orderBy: { discoveredAt: "asc" },
    })
    return rows.map((row) => ({
      id: row.skill.id,
      name: row.skill.name,
      description: row.skill.description,
      effect: row.skill.effect,
      cost: row.skill.cost,
      cooldown: row.skill.cooldown,
      duration: row.skill.duration ?? undefined,
      awakenedCondition: row.skill.awakenedCondition,
      icon: asIconKey(row.skill.icon),
    }))
  }),
})
