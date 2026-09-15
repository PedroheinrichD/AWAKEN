import jwt from "jsonwebtoken"

const JWT_SECRET: string = (() => {
  const value = process.env.JWT_SECRET
  if (!value) throw new Error("JWT_SECRET is not set. Copy .env.example to .env and configure it.")
  return value
})()

const EXPIRES_IN = "30d"

export interface SessionPayload {
  playerId: string
  username: string
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN })
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (typeof decoded === "string" || !decoded.playerId || !decoded.username) return null
    return { playerId: decoded.playerId, username: decoded.username }
  } catch {
    return null
  }
}

export const SESSION_COOKIE_NAME = "awaken_session"
export const SESSION_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
