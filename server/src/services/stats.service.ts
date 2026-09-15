import type { PrismaClient } from "@prisma/client"
import { RANK_ORDER } from "../game/config"
import type { Rank } from "@prisma/client"

const BASIC_EXERCISE_FIELD: Record<string, "flexoes" | "agachamentos" | "abdominais"> = {
  flexao: "flexoes",
  agachamento: "agachamentos",
  abdominal: "abdominais",
}

export async function recordExerciseCompletion(
  prisma: PrismaClient,
  characterId: string,
  exerciseId: string,
  opts: { reps?: number; km?: number },
) {
  const field = BASIC_EXERCISE_FIELD[exerciseId]

  if (field) {
    await prisma.characterStats.update({ where: { characterId }, data: { [field]: { increment: opts.reps ?? 1 } } })
  } else if (exerciseId === "corrida") {
    await prisma.characterStats.update({ where: { characterId }, data: { km: { increment: opts.km ?? 0 } } })
  } else {
    await prisma.characterStats.update({ where: { characterId }, data: { exerciciosAvancados: { increment: 1 } } })
  }
}

type CounterField =
  | "bossesDerrotados"
  | "missoesConcluidas"
  | "vitoriasX1"
  | "derrotasX1"
  | "eventosConcluidos"
  | "mortes"
  | "ressurreicoes"
  | "itensLendarios"
  | "itensDeus"

export async function incrementStats(prisma: PrismaClient, characterId: string, data: Partial<Record<CounterField, number>>) {
  const incrementData: Record<string, { increment: number }> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value) incrementData[key] = { increment: value }
  }
  if (Object.keys(incrementData).length === 0) return
  await prisma.characterStats.update({ where: { characterId }, data: incrementData })
}

export async function bumpRecordStats(prisma: PrismaClient, characterId: string, level: number, rank: Rank, streak: number) {
  const stats = await prisma.characterStats.findUniqueOrThrow({ where: { characterId } })
  const data: { maiorLevel?: number; maiorRank?: Rank; maiorStreak?: number } = {}

  if (level > stats.maiorLevel) data.maiorLevel = level
  if (RANK_ORDER.indexOf(rank) > RANK_ORDER.indexOf(stats.maiorRank)) data.maiorRank = rank
  if (streak > stats.maiorStreak) data.maiorStreak = streak

  if (Object.keys(data).length > 0) {
    await prisma.characterStats.update({ where: { characterId }, data })
  }
}
