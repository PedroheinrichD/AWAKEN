import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { effectiveAttributes } from "../../game/attributes.js"
import { checkItemRequirements, checkRankPromotion } from "../../game/requirements.js"
import { BODY_TYPE_FROM_CLIENT, HAIR_STYLE_FROM_CLIENT, RANK_TO_CLIENT, SLOT_FROM_CLIENT } from "../../mappers.js"
import {
  CHARACTER_INCLUDE,
  createCharacterForPlayer,
  getAliveCharacter,
  getEquippedBonuses,
  serializeCharacter,
} from "../../services/character.service.js"
import type { Context } from "../../context.js"
import { requireActiveCharacter } from "../helpers.js"
import { protectedProcedure, router } from "../trpc.js"

const appearanceSchema = z.object({
  skinTone: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  hairStyle: z.enum(["raspado", "curto", "longo", "preso", "moicano", "afro", "trancas"]),
  hairColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  eyeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  bodyType: z.enum(["esguio", "atletico", "robusto"]),
})

async function defeatedTrialBossIds(ctx: Context, characterId: string) {
  const wins = await ctx.prisma.battle.findMany({
    where: { characterId, status: "VITORIA" },
    select: { bossId: true },
  })
  return new Set(wins.map((w) => w.bossId))
}

export const characterRouter = router({
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const character = await getAliveCharacter(ctx.prisma, ctx.player.id)
    return character ? serializeCharacter(character) : null
  }),

  getLastDead: protectedProcedure.query(async ({ ctx }) => {
    const character = await ctx.prisma.character.findFirst({
      where: { playerId: ctx.player.id, isAlive: false },
      orderBy: { diedAt: "desc" },
      include: CHARACTER_INCLUDE,
    })
    return character ? serializeCharacter(character) : null
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().trim().min(1).max(24), appearance: appearanceSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getAliveCharacter(ctx.prisma, ctx.player.id)
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Você já possui um personagem vivo." })

      const character = await createCharacterForPlayer(ctx.prisma, ctx.player.id, input.name, {
        skinTone: input.appearance.skinTone,
        hairColor: input.appearance.hairColor,
        eyeColor: input.appearance.eyeColor,
        hairStyle: HAIR_STYLE_FROM_CLIENT[input.appearance.hairStyle],
        bodyType: BODY_TYPE_FROM_CLIENT[input.appearance.bodyType],
      })

      return serializeCharacter(character)
    }),

  equipItem: protectedProcedure.input(z.object({ itemId: z.string() })).mutation(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)

    const owned = await ctx.prisma.inventoryItem.findUnique({
      where: { characterId_itemId: { characterId: character.id, itemId: input.itemId } },
    })
    if (!owned) throw new TRPCError({ code: "BAD_REQUEST", message: "Você não possui este item." })

    const item = await ctx.prisma.item.findUniqueOrThrow({ where: { id: input.itemId } })
    if (!item.slot) throw new TRPCError({ code: "BAD_REQUEST", message: "Este item não pode ser equipado." })

    const bonuses = getEquippedBonuses(character, item.slot)
    const base = {
      forca: character.forca,
      resistencia: character.resistencia,
      agilidade: character.agilidade,
      vitalidade: character.vitalidade,
      stamina: character.stamina,
    }
    const effective = effectiveAttributes(base, bonuses)

    const check = checkItemRequirements(item, character, effective)
    if (!check.met) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Requisitos não atendidos: ${check.missing.join(", ")}` })
    }

    await ctx.prisma.characterEquipment.upsert({
      where: { characterId_slot: { characterId: character.id, slot: item.slot } },
      update: { itemId: item.id },
      create: { characterId: character.id, slot: item.slot, itemId: item.id },
    })

    const updated = await ctx.prisma.character.findUniqueOrThrow({ where: { id: character.id }, include: CHARACTER_INCLUDE })
    return serializeCharacter(updated)
  }),

  unequipItem: protectedProcedure
    .input(z.object({ slot: z.enum(["cabeca", "corpo", "maos", "pernas", "pes", "arma", "acessorio1", "acessorio2"]) }))
    .mutation(async ({ ctx, input }) => {
      const character = await requireActiveCharacter(ctx)
      await ctx.prisma.characterEquipment.deleteMany({
        where: { characterId: character.id, slot: SLOT_FROM_CLIENT[input.slot] },
      })
      const updated = await ctx.prisma.character.findUniqueOrThrow({ where: { id: character.id }, include: CHARACTER_INCLUDE })
      return serializeCharacter(updated)
    }),

  equipTitle: protectedProcedure.input(z.object({ titleId: z.string().nullable() })).mutation(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)

    if (input.titleId) {
      const owned = await ctx.prisma.characterTitle.findUnique({
        where: { characterId_titleId: { characterId: character.id, titleId: input.titleId } },
      })
      if (!owned) throw new TRPCError({ code: "BAD_REQUEST", message: "Título ainda não desbloqueado." })
    }

    await ctx.prisma.character.update({ where: { id: character.id }, data: { equippedTitleId: input.titleId } })
    const updated = await ctx.prisma.character.findUniqueOrThrow({ where: { id: character.id }, include: CHARACTER_INCLUDE })
    return serializeCharacter(updated)
  }),

  rankPromotionStatus: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const defeated = await defeatedTrialBossIds(ctx, character.id)
    const status = checkRankPromotion(character.rank, character.level, (bossId) => defeated.has(bossId))
    return { ...status, nextRank: status.nextRank ? RANK_TO_CLIENT[status.nextRank] : null }
  }),

  attemptRankPromotion: protectedProcedure.mutation(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const defeated = await defeatedTrialBossIds(ctx, character.id)
    const eligibility = checkRankPromotion(character.rank, character.level, (bossId) => defeated.has(bossId))

    if (!eligibility.eligible || !eligibility.nextRank) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Requisitos de promoção ainda não atendidos." })
    }

    const updated = await ctx.prisma.character.update({
      where: { id: character.id },
      data: { rank: eligibility.nextRank },
      include: CHARACTER_INCLUDE,
    })

    return {
      character: serializeCharacter(updated),
      from: RANK_TO_CLIENT[character.rank],
      to: RANK_TO_CLIENT[eligibility.nextRank],
    }
  }),
})
