import { RARITY_TO_CLIENT } from "../../mappers"
import { formatRemaining } from "../../utils/time"
import { protectedProcedure, router } from "../trpc"

export const eventsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.gameEvent.findMany({ orderBy: { startsAt: "desc" } })
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      description: event.description,
      rarity: RARITY_TO_CLIENT[event.rarity],
      timeRemaining: event.active && event.endsAt ? formatRemaining(event.endsAt) : undefined,
      active: event.active,
    }))
  }),
})
