import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { RANK_TO_CLIENT } from "../../mappers"
import { unlockAchievements } from "../../services/achievement.service"
import { incrementStats } from "../../services/stats.service"
import { requireActiveCharacter } from "../helpers"
import { protectedProcedure, router } from "../trpc"

function serializeOpponent(character: { id: string; name: string; rank: string; level: number; hp: number; hpMax: number }) {
  return {
    id: character.id,
    name: character.name,
    rank: RANK_TO_CLIENT[character.rank as keyof typeof RANK_TO_CLIENT] ?? character.rank,
    level: character.level,
    hp: character.hp,
    hpMax: character.hpMax,
  }
}

async function findOpponentCharacter(ctx: { prisma: import("@prisma/client").PrismaClient; player: { id: string } }) {
  const otherPlayer = await ctx.prisma.player.findFirst({ where: { id: { not: ctx.player.id } } })
  if (!otherPlayer) return null
  return ctx.prisma.character.findFirst({ where: { playerId: otherPlayer.id, isAlive: true } })
}

export const duelRouter = router({
  opponent: protectedProcedure.query(async ({ ctx }) => {
    const opponent = await findOpponentCharacter(ctx)
    return opponent ? serializeOpponent(opponent) : null
  }),

  pending: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const [incoming, outgoing] = await Promise.all([
      ctx.prisma.duel.findMany({ where: { opponentId: character.id, status: "PENDENTE" }, include: { exercise: true } }),
      ctx.prisma.duel.findMany({
        where: { challengerId: character.id, status: { in: ["PENDENTE", "ACEITO"] } },
        include: { exercise: true },
      }),
    ])
    return { incoming, outgoing }
  }),

  history: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const duels = await ctx.prisma.duel.findMany({
      where: { status: "CONCLUIDO", OR: [{ challengerId: character.id }, { opponentId: character.id }] },
      include: { exercise: true },
      orderBy: { resolvedAt: "desc" },
      take: 20,
    })

    return duels.map((duel) => {
      const isChallenger = duel.challengerId === character.id
      const myScore = isChallenger ? duel.challengerScore : duel.opponentScore
      const opponentScore = isChallenger ? duel.opponentScore : duel.challengerScore
      return {
        id: duel.id,
        challenge: duel.exercise.name,
        result: duel.winnerId === character.id ? "vitoria" : "derrota",
        score: `${myScore ?? 0} x ${opponentScore ?? 0}`,
        date: duel.resolvedAt?.toISOString() ?? duel.createdAt.toISOString(),
      }
    })
  }),

  challenge: protectedProcedure
    .input(z.object({ exerciseId: z.string(), targetSeconds: z.number().int().min(10).max(300) }))
    .mutation(async ({ ctx, input }) => {
      const character = await requireActiveCharacter(ctx)
      const opponent = await findOpponentCharacter(ctx)
      if (!opponent) throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum oponente disponível ainda." })

      return ctx.prisma.duel.create({
        data: {
          challengerId: character.id,
          opponentId: opponent.id,
          exerciseId: input.exerciseId,
          targetSeconds: input.targetSeconds,
        },
      })
    }),

  respond: protectedProcedure.input(z.object({ duelId: z.string(), accept: z.boolean() })).mutation(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)
    const duel = await ctx.prisma.duel.findUniqueOrThrow({ where: { id: input.duelId } })
    if (duel.opponentId !== character.id) throw new TRPCError({ code: "FORBIDDEN" })
    if (duel.status !== "PENDENTE") throw new TRPCError({ code: "BAD_REQUEST", message: "Este desafio já foi respondido." })

    return ctx.prisma.duel.update({
      where: { id: duel.id },
      data: { status: input.accept ? "ACEITO" : "RECUSADO", respondedAt: new Date() },
    })
  }),

  submitResult: protectedProcedure.input(z.object({ duelId: z.string(), score: z.number().int().min(0).max(500) })).mutation(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)
    const duel = await ctx.prisma.duel.findUniqueOrThrow({ where: { id: input.duelId } })

    if (duel.challengerId !== character.id && duel.opponentId !== character.id) {
      throw new TRPCError({ code: "FORBIDDEN" })
    }
    if (duel.status !== "ACEITO") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Este X1 ainda não foi aceito pelo oponente." })
    }

    const isChallenger = duel.challengerId === character.id
    const updated = await ctx.prisma.duel.update({
      where: { id: duel.id },
      data: isChallenger ? { challengerScore: input.score } : { opponentScore: input.score },
    })

    if (updated.challengerScore === null || updated.opponentScore === null) {
      return updated
    }

    const winnerId =
      updated.challengerScore === updated.opponentScore
        ? null
        : updated.challengerScore > updated.opponentScore
          ? updated.challengerId
          : updated.opponentId

    const resolved = await ctx.prisma.duel.update({
      where: { id: duel.id },
      data: { status: "CONCLUIDO", resolvedAt: new Date(), winnerId },
    })

    if (winnerId) {
      const loserId = winnerId === updated.challengerId ? updated.opponentId : updated.challengerId
      await incrementStats(ctx.prisma, winnerId, { vitoriasX1: 1 })
      await incrementStats(ctx.prisma, loserId, { derrotasX1: 1 })
      await unlockAchievements(ctx.prisma, winnerId)
    }

    return resolved
  }),
})
