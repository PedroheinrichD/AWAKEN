import { achievementsRouter } from "./routers/achievements.router"
import { authRouter } from "./routers/auth.router"
import { battleRouter } from "./routers/battle.router"
import { bossesRouter } from "./routers/bosses.router"
import { characterRouter } from "./routers/character.router"
import { devRouter } from "./routers/dev.router"
import { duelRouter } from "./routers/duel.router"
import { eventsRouter } from "./routers/events.router"
import { itemsRouter } from "./routers/items.router"
import { missionsRouter } from "./routers/missions.router"
import { shopRouter } from "./routers/shop.router"
import { skillsRouter } from "./routers/skills.router"
import { statsRouter } from "./routers/stats.router"
import { titlesRouter } from "./routers/titles.router"
import { router } from "./trpc"

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
