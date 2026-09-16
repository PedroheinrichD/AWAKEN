import { achievementsRouter } from "./routers/achievements.router.js"
import { authRouter } from "./routers/auth.router.js"
import { battleRouter } from "./routers/battle.router.js"
import { bossesRouter } from "./routers/bosses.router.js"
import { characterRouter } from "./routers/character.router.js"
import { devRouter } from "./routers/dev.router.js"
import { duelRouter } from "./routers/duel.router.js"
import { eventsRouter } from "./routers/events.router.js"
import { itemsRouter } from "./routers/items.router.js"
import { missionsRouter } from "./routers/missions.router.js"
import { shopRouter } from "./routers/shop.router.js"
import { skillsRouter } from "./routers/skills.router.js"
import { statsRouter } from "./routers/stats.router.js"
import { titlesRouter } from "./routers/titles.router.js"
import { router } from "./trpc.js"

export const appRouter = router({
  auth: authRouter,
  character: characterRouter,
  missions: missionsRouter,
  bosses: bossesRouter,
  battle: battleRouter,
  items: itemsRouter,
  skills: skillsRouter,
  achievements: achievementsRouter,
  titles: titlesRouter,
  stats: statsRouter,
  events: eventsRouter,
  shop: shopRouter,
  duel: duelRouter,
  dev: devRouter,
})

export type AppRouter = typeof appRouter
