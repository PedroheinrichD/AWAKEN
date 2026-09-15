import { TRPCError } from "@trpc/server"
import type { Response } from "express"
import { z } from "zod"
import { hashPassword, verifyPassword } from "../../auth/password"
import { SESSION_COOKIE_MAX_AGE_MS, SESSION_COOKIE_NAME, signSession } from "../../auth/jwt"
import { publicProcedure, router } from "../trpc"

const credentialsSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e _"),
  password: z.string().min(6).max(100),
})

function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_COOKIE_MAX_AGE_MS,
  })
}

export const authRouter = router({
  register: publicProcedure.input(credentialsSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.player.findUnique({ where: { username: input.username } })
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "Este nome de usuário já existe." })

    const passwordHash = await hashPassword(input.password)
    const player = await ctx.prisma.player.create({
      data: { username: input.username, passwordHash },
    })

    setSessionCookie(ctx.res, signSession({ playerId: player.id, username: player.username }))
    return { id: player.id, username: player.username }
  }),

  login: publicProcedure.input(credentialsSchema).mutation(async ({ ctx, input }) => {
    const player = await ctx.prisma.player.findUnique({ where: { username: input.username } })
    if (!player) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos." })

    const valid = await verifyPassword(input.password, player.passwordHash)
    if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos." })

    setSessionCookie(ctx.res, signSession({ playerId: player.id, username: player.username }))
    return { id: player.id, username: player.username }
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(SESSION_COOKIE_NAME)
    return { success: true }
  }),

  me: publicProcedure.query(({ ctx }) => ctx.player),
})
