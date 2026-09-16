import { RANK_TO_CLIENT } from "../../mappers.js"
import { requireActiveCharacter } from "../helpers.js"
import { protectedProcedure, router } from "../trpc.js"

export const statsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const stats = await ctx.prisma.characterStats.findUniqueOrThrow({ where: { characterId: character.id } })
    return {
      flexoes: stats.flexoes,
      agachamentos: stats.agachamentos,
      abdominais: stats.abdominais,
      km: stats.km,
      exerciciosAvancados: stats.exerciciosAvancados,
      bossesDerrotados: stats.bossesDerrotados,
      missoesConcluidas: stats.missoesConcluidas,
      vitoriasX1: stats.vitoriasX1,
      derrotasX1: stats.derrotasX1,
      maiorStreak: stats.maiorStreak,
      eventosConcluidos: stats.eventosConcluidos,
      mortes: stats.mortes,
      ressurreicoes: stats.ressurreicoes,
      itensLendarios: stats.itensLendarios,
      itensDeus: stats.itensDeus,
      maiorLevel: stats.maiorLevel,
      maiorRank: RANK_TO_CLIENT[stats.maiorRank],
    }
  }),
})
