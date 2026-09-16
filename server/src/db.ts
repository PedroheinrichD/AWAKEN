import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.")
}

const url = new URL(databaseUrl)

// Managed Postgres providers (Supabase, Neon, ...) require TLS but present a certificate
// the driver can't chain to a public CA, so an explicit ssl object (with rejectUnauthorized
// disabled) is needed. Any non-local host is assumed to require it; local dev (localhost/
// 127.0.0.1) is unaffected — ssl stays undefined.
const requiresTls = url.hostname !== "localhost" && url.hostname !== "127.0.0.1"

const adapter = new PrismaPg({
  host: url.hostname,
  port: url.port ? Number(url.port) : undefined,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  ssl: requiresTls ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 15000,
})

export const prisma = new PrismaClient({ adapter })
