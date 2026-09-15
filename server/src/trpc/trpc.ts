import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import type { Context } from "../context"

const t = initTRPC.context<Context>().create({ transformer: superjson })

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.player) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão inválida ou expirada." })
  }
  return next({ ctx: { ...ctx, player: ctx.player } })
})
