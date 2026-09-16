import type { Mission, MissionAssignment, PrismaClient } from "@prisma/client"
import { MISSION_TYPE_TO_CLIENT } from "../mappers.js"
import { todayDateOnly } from "../utils/date.js"

const SENTINEL_DATE = new Date("2000-01-01T00:00:00.000Z")

/** Daily missions reset every day; bonus/special missions are assigned once and persist until completed. */
export async function ensureMissionAssignments(prisma: PrismaClient, characterId: string) {
  const missions = await prisma.mission.findMany({ where: { active: true } })
  const today = todayDateOnly()

  await Promise.all(
    missions.map((mission) => {
      const assignedDate = mission.type === "DIARIA" ? today : SENTINEL_DATE
      return prisma.missionAssignment.upsert({
        where: { characterId_missionId_assignedDate: { characterId, missionId: mission.id, assignedDate } },
        update: {},
        create: { characterId, missionId: mission.id, assignedDate },
      })
    }),
  )
}

export function missionTarget(mission: Pick<Mission, "targetReps" | "targetSeconds" | "targetKm">): number {
  return mission.targetReps ?? mission.targetSeconds ?? mission.targetKm ?? 1
}

export function serializeMissionAssignment(assignment: MissionAssignment & { mission: Mission }) {
  const target = missionTarget(assignment.mission)
  const rewardParts = [`+${assignment.mission.xpReward} XP`]
  if (assignment.mission.currencyReward > 0) rewardParts.push(`${assignment.mission.currencyReward} moedas`)

  return {
    id: assignment.id,
    title: assignment.mission.title,
    description: assignment.mission.description,
    type: MISSION_TYPE_TO_CLIENT[assignment.mission.type],
    objective: assignment.mission.objective,
    exerciseId: assignment.mission.exerciseId,
    progress: assignment.progress,
    target,
    reward: rewardParts.join(" · "),
    completed: assignment.completed,
  }
}
