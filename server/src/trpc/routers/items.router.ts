import { serializeItem } from "../../services/item.service.js"
import { requireActiveCharacter } from "../helpers.js"
import { protectedProcedure, router } from "../trpc.js"

export const itemsRouter = router({
  inventory: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const rows = await ctx.prisma.inventoryItem.findMany({
      where: { characterId: character.id, quantity: { gt: 0 } },
      include: { item: true },
      orderBy: { acquiredAt: "asc" },
    })
    return rows.map((row) => serializeItem(row.item, row.quantity))
  }),
})
