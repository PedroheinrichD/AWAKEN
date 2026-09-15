import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { asIconKey, RARITY_TO_CLIENT } from "../../mappers"
import { CHARACTER_INCLUDE, serializeCharacter } from "../../services/character.service"
import { requireActiveCharacter } from "../helpers"
import { protectedProcedure, router } from "../trpc"

export const shopRouter = router({
  listings: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const [listings, purchases] = await Promise.all([
      ctx.prisma.shopListing.findMany({ where: { active: true } }),
      ctx.prisma.shopPurchase.findMany({ where: { characterId: character.id }, select: { listingId: true } }),
    ])
    const purchasedIds = new Set(purchases.map((purchase) => purchase.listingId))

    return listings.map((listing) => ({
      id: listing.id,
      name: listing.name,
      rarity: RARITY_TO_CLIENT[listing.rarity],
      price: listing.price,
      exclusive: listing.exclusive,
      description: listing.description,
      icon: asIconKey(listing.icon),
      owned: listing.oneTimePerCharacter && purchasedIds.has(listing.id),
    }))
  }),

  purchase: protectedProcedure.input(z.object({ listingId: z.string() })).mutation(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)
    const listing = await ctx.prisma.shopListing.findUniqueOrThrow({ where: { id: input.listingId } })
    if (!listing.active) throw new TRPCError({ code: "BAD_REQUEST", message: "Este item não está mais disponível." })

    if (listing.oneTimePerCharacter) {
      const already = await ctx.prisma.shopPurchase.findFirst({
        where: { characterId: character.id, listingId: listing.id },
      })
      if (already) throw new TRPCError({ code: "BAD_REQUEST", message: "Você já adquiriu este item." })
    }

    if (character.eventCurrency < listing.price) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Fragmentos de Evento insuficientes." })
    }

    await ctx.prisma.$transaction(async (tx) => {
      await tx.character.update({ where: { id: character.id }, data: { eventCurrency: { decrement: listing.price } } })
      await tx.shopPurchase.create({ data: { characterId: character.id, listingId: listing.id, priceSnapshot: listing.price } })

      if (listing.itemId) {
        const item = await tx.item.findUniqueOrThrow({ where: { id: listing.itemId } })
        if (item.survivesDeath) {
          await tx.playerVaultItem.upsert({
            where: { playerId_itemId: { playerId: ctx.player.id, itemId: item.id } },
            update: { quantity: { increment: 1 } },
            create: { playerId: ctx.player.id, itemId: item.id, quantity: 1 },
          })
        } else {
          await tx.inventoryItem.upsert({
            where: { characterId_itemId: { characterId: character.id, itemId: item.id } },
            update: { quantity: { increment: 1 } },
            create: { characterId: character.id, itemId: item.id, quantity: 1, source: "shop" },
          })
        }
      }
    })

    const updated = await ctx.prisma.character.findUniqueOrThrow({ where: { id: character.id }, include: CHARACTER_INCLUDE })
    return { success: true, character: serializeCharacter(updated) }
  }),
})
