import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { unlockAchievements } from "../../services/achievement.service.js"
import { bumpStreakIfNewDay, CHARACTER_INCLUDE, serializeCharacter } from "../../services/character.service.js"
import { runOverrunBonus } from "../../game/running.js"
import { RANK_TO_CLIENT } from "../../mappers.js"
import { ensureMissionAssignments, missionTarget, serializeMissionAssignment } from "../../services/mission.service.js"
import { incrementStats, recordExerciseCompletion } from "../../services/stats.service.js"
import { todayDateOnly } from "../../utils/date.js"
import { grantXp } from "../../services/xp.service.js"
import { tryDiscoverSkill } from "../../services/skill.service.js"
import { requireActiveCharacter } from "../helpers.js"
import { protectedProcedure, router } from "../trpc.js"

export const missionsRouter = router({
  listToday: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    await ensureMissionAssignments(ctx.prisma, character.id)

    const rows = await ctx.prisma.missionAssignment.findMany({
      where: {
        characterId: character.id,
        OR: [{ assignedDate: todayDateOnly(), mission: { type: "DIARIA" } }, { mission: { type: { in: ["BONUS", "ESPECIAL"] } } }],
      },
      include: { mission: true },
      orderBy: { mission: { type: "asc" } },
    })

    return rows.map(serializeMissionAssignment)
  }),

  complete: protectedProcedure
    .input(z.object({ assignmentId: z.string(), distanceKm: z.number().positive().optional() }))
    .mutation(async ({ ctx, input }) => {
      const character = await requireActiveCharacter(ctx)

      const assignment = await ctx.prisma.missionAssignment.findUnique({
        where: { id: input.assignmentId },
        include: { mission: true },
      })
      if (!assignment || assignment.characterId !== character.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada." })
      }
      if (assignment.completed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Esta missão já foi concluída." })
      }

      // Running missions require a real reported distance, validated server-side against
      // the mission's target — every other mission type stays trust-the-client on `complete`
      // (camera-validated reps already gate the button client-side; see claude.md §36/§29).
      const targetKm = assignment.mission.targetKm
      let bonus = { xp: 0, currency: 0 }
      let actualDistanceKm: number | null = null
      if (targetKm != null) {
        if (input.distanceKm == null || input.distanceKm < targetKm) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `É preciso percorrer pelo menos ${targetKm}km para concluir esta missão.` })
        }
        actualDistanceKm = input.distanceKm
        bonus = runOverrunBonus(assignment.mission.xpReward, targetKm, actualDistanceKm)
      }

      const target = missionTarget(assignment.mission)
      await ctx.prisma.missionAssignment.update({
        where: { id: assignment.id },
        data: { completed: true, completedAt: new Date(), progress: target },
      })

      if (assignment.mission.exerciseId) {
        await ctx.prisma.exerciseLog.create({
          data: {
            characterId: character.id,
            exerciseId: assignment.mission.exerciseId,
            reps: assignment.mission.targetReps,
            durationSeconds: assignment.mission.targetSeconds,
            distanceKm: actualDistanceKm ?? assignment.mission.targetKm,
            xpAwarded: assignment.mission.xpReward + bonus.xp,
            source: "MISSAO",
          },
        })
        await recordExerciseCompletion(ctx.prisma, character.id, assignment.mission.exerciseId, {
          reps: assignment.mission.targetReps ?? undefined,
          km: actualDistanceKm ?? assignment.mission.targetKm ?? undefined,
        })
      }

      await incrementStats(ctx.prisma, character.id, { missoesConcluidas: 1 })
      const streak = await bumpStreakIfNewDay(ctx.prisma, character)

      if (assignment.mission.itemRewardId) {
        await ctx.prisma.inventoryItem.upsert({
          where: { characterId_itemId: { characterId: character.id, itemId: assignment.mission.itemRewardId } },
          update: { quantity: { increment: 1 } },
          create: {
            characterId: character.id,
            itemId: assignment.mission.itemRewardId,
            quantity: 1,
            source: `mission:${assignment.mission.id}`,
          },
        })
      }

      const currencyReward = assignment.mission.currencyReward + bonus.currency
      if (currencyReward > 0) {
        await ctx.prisma.character.update({
          where: { id: character.id },
          data: { eventCurrency: { increment: currencyReward } },
        })
      }

      const xpResult = await grantXp(
        ctx.prisma,
        { ...character, streakCurrent: streak.streakCurrent },
        assignment.mission.xpReward + bonus.xp,
      )

      const unlockedAchievements = await unlockAchievements(ctx.prisma, character.id)

      // "Fôlego de Ferro" awakens exactly on the condition described in its own seed data.
      const awakenedSkill = streak.streakCurrent >= 20 ? await tryDiscoverSkill(ctx.prisma, character.id, "folego-de-ferro") : null

      const finalCharacter = await ctx.prisma.character.findUniqueOrThrow({
        where: { id: character.id },
        include: CHARACTER_INCLUDE,
      })

      return {
        character: serializeCharacter(finalCharacter),
        leveledUp: xpResult.levelsGained > 0,
        fromLevel: xpResult.fromLevel,
        toLevel: xpResult.toLevel,
        rankPromotionUnlocked: xpResult.rankPromotionJustUnlocked
          ? { rank: RANK_TO_CLIENT[xpResult.rankPromotionJustUnlocked.rank], minLevel: xpResult.rankPromotionJustUnlocked.minLevel }
          : null,
        unlockedAchievements,
        awakenedSkill,
        overrunBonus: bonus.xp > 0 || bonus.currency > 0 ? bonus : null,
      }
    }),
})
