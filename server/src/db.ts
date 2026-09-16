import "dotenv/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@prisma/client"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.")
}

const url = new URL(databaseUrl.replace(/^mysql:/, "mariadb:"))

// Managed MySQL providers (Aiven, PlanetScale, Railway, ...) require TLS but present a
// certificate the driver can't chain to a public CA. The `mariadb` package only accepts a
// plain true/false for `ssl` when it's parsed out of a connection string, so an object
// config (with rejectUnauthorized disabled) has to be built by hand instead of just
// forwarding the URL. Local dev (no ssl/sslaccept param) is unaffected — ssl stays undefined.
const requiresTls =
  url.searchParams.has("ssl") || url.searchParams.has("sslaccept") || url.searchParams.has("ssl-mode")

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : undefined,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  ssl: requiresTls ? { rejectUnauthorized: false } : undefined,
  // The driver's default connectTimeout (~1s) is too aggressive for a remote managed
  // database over the public internet. acquireTimeout must be raised too: the pool
  // silently clamps connectTimeout down to acquireTimeout (default 10s) otherwise,
  // which defeats connectTimeout entirely.
  connectTimeout: 15000,
  acquireTimeout: 20000,
})

export const prisma = new PrismaClient({ adapter })
