import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { unlockAchievements } from "../../services/achievement.service"
import { bumpStreakIfNewDay, CHARACTER_INCLUDE, serializeCharacter } from "../../services/character.service"
import { ensureMissionAssignments, missionTarget, serializeMissionAssignment } from "../../services/mission.service"
import { incrementStats, recordExerciseCompletion } from "../../services/stats.service"
import { todayDateOnly } from "../../utils/date"
import { grantXp } from "../../services/xp.service"
import { tryDiscoverSkill } from "../../services/skill.service"
import { requireActiveCharacter } from "../helpers"
import { protectedProcedure, router } from "../trpc"

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

  complete: protectedProcedure.input(z.object({ assignmentId: z.string() })).mutation(async ({ ctx, input }) => {
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
          distanceKm: assignment.mission.targetKm,
          xpAwarded: assignment.mission.xpReward,
          source: "MISSAO",
        },
      })
      await recordExerciseCompletion(ctx.prisma, character.id, assignment.mission.exerciseId, {
        reps: assignment.mission.targetReps ?? undefined,
        km: assignment.mission.targetKm ?? undefined,
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

    if (assignment.mission.currencyReward > 0) {
      await ctx.prisma.character.update({
        where: { id: character.id },
        data: { eventCurrency: { increment: assignment.mission.currencyReward } },
      })
    }

    const xpResult = await grantXp(
      ctx.prisma,
      { ...character, streakCurrent: streak.streakCurrent },
      assignment.mission.xpReward,
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
      unlockedAchievements,
      awakenedSkill,
    }
  }),
})
