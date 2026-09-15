import { requireActiveCharacter } from "../helpers"
import { protectedProcedure, router } from "../trpc"

export const titlesRouter = router({
  unlocked: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const rows = await ctx.prisma.characterTitle.findMany({
      where: { characterId: character.id },
      include: { title: true },
      orderBy: { unlockedAt: "asc" },
    })
    return rows.map((row) => ({
      id: row.title.id,
      name: row.title.name,
      description: row.title.description,
      equipped: character.equippedTitleId === row.title.id,
    }))
  }),
})
