import { asIconKey } from "../../mappers"
import { requireActiveCharacter } from "../helpers"
import { protectedProcedure, router } from "../trpc"

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
