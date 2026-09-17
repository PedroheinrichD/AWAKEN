import "dotenv/config"
import { defineConfig } from "prisma/config"

// process.env is used directly (not the `env()` helper) because DIRECT_URL is only ever
// set locally for running migrations — `env()` throws on a missing var, which would break
// `prisma generate` in Vercel's postinstall, where only DATABASE_URL is configured.
export default defineConfig({
  schema: "server/prisma/schema.prisma",
  migrations: {
    path: "server/prisma/migrations",
    seed: "tsx server/prisma/seed/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
