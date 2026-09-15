import { TRPCError } from "@trpc/server"
import type { Context } from "../context"
import { requireActiveCharacter as requireActiveCharacterRaw } from "../services/character.service"

type AuthedContext = Context & { player: NonNullable<Context["player"]> }

export async function requireActiveCharacter(ctx: AuthedContext) {
  try {
    return await requireActiveCharacterRaw(ctx.prisma, ctx.player.id)
  } catch {
    throw new TRPCError({ code: "NOT_FOUND", message: "Nenhum personagem vivo encontrado." })
  }
}
