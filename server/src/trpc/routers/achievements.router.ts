import { asIconKey } from "../../mappers.js"
import { requireActiveCharacter } from "../helpers.js"
import { protectedProcedure, router } from "../trpc.js"

export const achievementsRouter = router({
  unlocked: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const rows = await ctx.prisma.characterAchievement.findMany({
      where: { characterId: character.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    })
    return rows.map((row) => ({
      id: row.achievement.id,
      name: row.achievement.name,
      description: row.achievement.description,
      unlockedAt: row.unlockedAt.toISOString(),
      icon: asIconKey(row.achievement.icon),
    }))
  }),
})
