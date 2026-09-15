import type { CreateExpressContextOptions } from "@trpc/server/adapters/express"
import { SESSION_COOKIE_NAME, verifySession } from "./auth/jwt"
import { prisma } from "./db"

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined
  const session = token ? verifySession(token) : null

  let player: { id: string; username: string } | null = null
  if (session) {
    player = await prisma.player.findUnique({
      where: { id: session.playerId },
      select: { id: true, username: true },
    })
  }

  return { prisma, player, res }
}

export type Context = Awaited<ReturnType<typeof createContext>>
