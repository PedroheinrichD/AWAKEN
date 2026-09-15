import { z } from "zod"
import { pickTodaysBoss, serializeBoss } from "../../services/boss.service"
import { requireActiveCharacter } from "../helpers"
import { protectedProcedure, router } from "../trpc"

export const bossesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const [bosses, wins] = await Promise.all([
      ctx.prisma.boss.findMany({ include: { abilities: true }, orderBy: { id: "asc" } }),
      ctx.prisma.battle.findMany({ where: { characterId: character.id, status: "VITORIA" }, select: { bossId: true } }),
    ])
    const defeatedIds = new Set(wins.map((w) => w.bossId))
    return bosses.map((boss) => serializeBoss(boss, defeatedIds.has(boss.id)))
  }),

  today: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const [bosses, wins] = await Promise.all([
      ctx.prisma.boss.findMany({ include: { abilities: true }, orderBy: { id: "asc" } }),
      ctx.prisma.battle.findMany({ where: { characterId: character.id, status: "VITORIA" }, select: { bossId: true } }),
    ])
    const boss = pickTodaysBoss(bosses)
    const defeatedIds = new Set(wins.map((w) => w.bossId))
    return serializeBoss(boss, defeatedIds.has(boss.id))
  }),

  getById: protectedProcedure.input(z.object({ bossId: z.string() })).query(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)
    const boss = await ctx.prisma.boss.findUniqueOrThrow({ where: { id: input.bossId }, include: { abilities: true } })
    const win = await ctx.prisma.battle.findFirst({ where: { characterId: character.id, bossId: boss.id, status: "VITORIA" } })
    return serializeBoss(boss, Boolean(win))
  }),
})
