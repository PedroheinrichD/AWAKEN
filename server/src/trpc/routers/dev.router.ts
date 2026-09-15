import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { asIconKey } from "../../mappers"
import { serializeCharacter } from "../../services/character.service"
import { canReviveSolo, killCharacter, reviveSolo } from "../../services/death.service"
import { grantXp } from "../../services/xp.service"
import { requireActiveCharacter } from "../helpers"
import { protectedProcedure, router } from "../trpc"

/**
 * Convenience mutations backing the in-app "System Diagnostics" panel. They
 * still go through the real persistence + rules layer (grantXp really
 * cascades level-ups, simulateDeath really kills the character) — this
 * exists only because the daily gameplay loop has no fast way to reach
 * those moments on demand for testing/demoing.
 */
export const devRouter = router({
  grantXp: protectedProcedure
    .input(z.object({ amount: z.number().int().min(1).max(1_000_000).default(500) }))
    .mutation(async ({ ctx, input }) => {
      const character = await requireActiveCharacter(ctx)
      const result = await grantXp(ctx.prisma, character, input.amount)
      return { leveledUp: result.levelsGained > 0, fromLevel: result.fromLevel, toLevel: result.toLevel }
    }),

  awaken: protectedProcedure.mutation(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const discovered = await ctx.prisma.characterSkill.findMany({
      where: { characterId: character.id },
      select: { skillId: true },
    })
    const discoveredIds = discovered.map((row) => row.skillId)

    const nextSkill = await ctx.prisma.skill.findFirst({ where: { id: { notIn: discoveredIds } } })
    if (!nextSkill) throw new TRPCError({ code: "BAD_REQUEST", message: "Todas as habilidades já foram despertadas." })

    await ctx.prisma.characterSkill.create({ data: { characterId: character.id, skillId: nextSkill.id } })

    return {
      id: nextSkill.id,
      name: nextSkill.name,
      description: nextSkill.description,
      effect: nextSkill.effect,
      cost: nextSkill.cost,
      cooldown: nextSkill.cooldown,
      duration: nextSkill.duration ?? undefined,
      awakenedCondition: nextSkill.awakenedCondition,
      icon: asIconKey(nextSkill.icon),
    }
  }),

  simulateDeath: protectedProcedure.mutation(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    await killCharacter(ctx.prisma, character, "dev:manual")
    return { success: true }
  }),

  reviveSoloEligible: protectedProcedure.query(({ ctx }) => canReviveSolo(ctx.prisma, ctx.player.id)),

  reviveSolo: protectedProcedure.mutation(async ({ ctx }) => {
    const deadCharacter = await ctx.prisma.character.findFirst({
      where: { playerId: ctx.player.id, isAlive: false },
      orderBy: { diedAt: "desc" },
    })
    if (!deadCharacter) throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum personagem morto para reviver." })

    const revived = await reviveSolo(ctx.prisma, ctx.player.id, deadCharacter.id)
    return serializeCharacter(revived)
  }),
})
