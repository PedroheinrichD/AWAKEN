import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { unlockAchievements } from "../../services/achievement.service.js"
import { resolveTurn } from "../../game/battle.js"
import { BATTLE_CONFIG, BOSS_XP_REWARD, POTION_HEAL_FRACTION, RANK_ORDER, SKILL_EFFECT_IDS } from "../../game/config.js"
import { performanceFromChallenge } from "../../game/performance.js"
import { BATTLE_CHALLENGE_EXERCISES, challengeTargetFor } from "../../services/boss.service.js"
import { CHARACTER_INCLUDE, serializeCharacter } from "../../services/character.service.js"
import { killCharacter } from "../../services/death.service.js"
import { rollAndGrantBossLoot } from "../../services/loot.service.js"
import { incrementStats, recordExerciseCompletion } from "../../services/stats.service.js"
import { grantXp } from "../../services/xp.service.js"
import { tryDiscoverSkill } from "../../services/skill.service.js"
import { requireActiveCharacter } from "../helpers.js"
import { protectedProcedure, router } from "../trpc.js"

function serializeBattle(battle: { id: string; bossId: string; status: string; currentTurn: number; bossHpRemaining: number }, bossMaxHp: number) {
  return {
    id: battle.id,
    bossId: battle.bossId,
    status: battle.status,
    currentTurn: battle.currentTurn,
    bossHp: battle.bossHpRemaining,
    bossHpMax: bossMaxHp,
  }
}

export const battleRouter = router({
  active: protectedProcedure.query(async ({ ctx }) => {
    const character = await requireActiveCharacter(ctx)
    const battle = await ctx.prisma.battle.findFirst({
      where: { characterId: character.id, status: "EM_ANDAMENTO" },
      include: { boss: true },
    })
    return battle ? serializeBattle(battle, battle.boss.hp) : null
  }),

  start: protectedProcedure.input(z.object({ bossId: z.string() })).mutation(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)

    const ongoing = await ctx.prisma.battle.findFirst({ where: { characterId: character.id, status: "EM_ANDAMENTO" } })
    if (ongoing) throw new TRPCError({ code: "CONFLICT", message: "Já existe um combate em andamento." })

    const boss = await ctx.prisma.boss.findUniqueOrThrow({ where: { id: input.bossId } })
    const battle = await ctx.prisma.battle.create({
      data: {
        characterId: character.id,
        bossId: boss.id,
        bossHpRemaining: boss.hp,
        isPromotionTrial: boss.isPromotionTrialFor !== null,
      },
    })

    return serializeBattle(battle, boss.hp)
  }),

  turns: protectedProcedure.input(z.object({ battleId: z.string() })).query(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)
    const battle = await ctx.prisma.battle.findUniqueOrThrow({ where: { id: input.battleId } })
    if (battle.characterId !== character.id) throw new TRPCError({ code: "FORBIDDEN" })

    const turns = await ctx.prisma.battleTurn.findMany({
      where: { battleId: input.battleId },
      orderBy: { turnNumber: "asc" },
    })
    return turns.map((turn) => turn.logText)
  }),

  currentChallenge: protectedProcedure.input(z.object({ battleId: z.string() })).query(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)
    const battle = await ctx.prisma.battle.findUniqueOrThrow({ where: { id: input.battleId }, include: { boss: true } })
    if (battle.characterId !== character.id) throw new TRPCError({ code: "FORBIDDEN" })

    const rankWeight = RANK_ORDER.indexOf(battle.boss.rank)
    const exerciseId = BATTLE_CHALLENGE_EXERCISES[(battle.currentTurn - 1) % BATTLE_CHALLENGE_EXERCISES.length]
    const target = challengeTargetFor(rankWeight, battle.currentTurn, battle.duplicateNextChallenge)

    return {
      exerciseId,
      target,
      timeLimitSeconds: BATTLE_CONFIG.turnTimeLimitSeconds,
      itemsSealed: battle.itemsSealed,
    }
  }),

  submitTurn: protectedProcedure
    .input(z.object({ battleId: z.string(), repsCompleted: z.number().int().min(0), timeRemainingSeconds: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const character = await requireActiveCharacter(ctx)

      const battle = await ctx.prisma.battle.findUnique({
        where: { id: input.battleId },
        include: { boss: { include: { abilities: true } } },
      })
      if (!battle || battle.characterId !== character.id) throw new TRPCError({ code: "NOT_FOUND" })
      if (battle.status !== "EM_ANDAMENTO") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este combate já terminou." })
      }

      const rankWeight = RANK_ORDER.indexOf(battle.boss.rank)
      const exerciseId = BATTLE_CHALLENGE_EXERCISES[(battle.currentTurn - 1) % BATTLE_CHALLENGE_EXERCISES.length]
      const target = challengeTargetFor(rankWeight, battle.currentTurn, battle.duplicateNextChallenge)
      const timeLimitSeconds = BATTLE_CONFIG.turnTimeLimitSeconds
      const timeRemainingSeconds = Math.min(input.timeRemainingSeconds, timeLimitSeconds)
      // Without camera validation the client self-reports reps; clamp to a generous
      // multiple of the target so a malformed/malicious value can't trivialize combat.
      const repsCompleted = Math.min(input.repsCompleted, target * 3)

      const performanceTier = performanceFromChallenge(repsCompleted, target, timeRemainingSeconds, timeLimitSeconds)

      const hasAgileCrit =
        battle.currentTurn <= 3 &&
        Boolean(
          await ctx.prisma.characterSkill.findUnique({
            where: { characterId_skillId: { characterId: character.id, skillId: SKILL_EFFECT_IDS.agileCritTurns } },
          }),
        )

      const result = resolveTurn({
        bossMaxHp: battle.boss.hp,
        bossHpRemaining: battle.bossHpRemaining,
        bossDano: battle.boss.dano,
        bossAbilities: battle.boss.abilities,
        turnNumber: battle.currentTurn,
        performanceTier,
        playerHp: character.hp,
        bonusPlayerDamageMultiplier: hasAgileCrit ? 1.18 : 1,
      })

      let finalPlayerHp = result.playerHpRemaining
      const survivedCritical = finalPlayerHp > 0 && finalPlayerHp < character.hpMax * 0.05

      // "Pulso de Sobrevivência" — real passive effect for a discovered skill, once per day.
      if (finalPlayerHp > 0 && finalPlayerHp < character.hpMax * 0.15) {
        const hasSurvivalPulse = await ctx.prisma.characterSkill.findUnique({
          where: { characterId_skillId: { characterId: character.id, skillId: SKILL_EFFECT_IDS.survivalPulse } },
        })
        if (hasSurvivalPulse) {
          const today = new Date()
          today.setUTCHours(0, 0, 0, 0)
          const usedToday = await ctx.prisma.battleTurn.findFirst({
            where: { logText: { contains: "Pulso de Sobrevivência" }, createdAt: { gte: today }, battle: { characterId: character.id } },
          })
          if (!usedToday) {
            finalPlayerHp = Math.min(character.hpMax, finalPlayerHp + Math.round(character.hpMax * 0.08))
            result.logLines.push("Pulso de Sobrevivência: algo no corpo se recusou a aceitar o fim.")
          }
        }
      }

      await ctx.prisma.exerciseLog.create({
        data: {
          characterId: character.id,
          exerciseId,
          reps: repsCompleted,
          xpAwarded: 0,
          source: "BOSS",
        },
      })
      await recordExerciseCompletion(ctx.prisma, character.id, exerciseId, { reps: repsCompleted })

      await ctx.prisma.battleTurn.create({
        data: {
          battleId: battle.id,
          turnNumber: battle.currentTurn,
          exerciseId,
          targetReps: target,
          repsCompleted,
          timeLimitSeconds,
          timeRemainingSeconds,
          performanceTier,
          playerDamageDealt: result.playerDamageDealt,
          bossDamageDealt: result.bossDamageDealt,
          bossAbilityUsed: result.bossAbilityUsed,
          logText: result.logLines.join(" "),
        },
      })

      await ctx.prisma.character.update({ where: { id: character.id }, data: { hp: finalPlayerHp } })

      let outcome: "vitoria" | "derrota" | "em_andamento" = "em_andamento"
      let loot = null as Awaited<ReturnType<typeof rollAndGrantBossLoot>> | null
      let xpGain = 0
      let unlockedAchievements: Awaited<ReturnType<typeof unlockAchievements>> = []
      let awakenedSkill: Awaited<ReturnType<typeof tryDiscoverSkill>> = null
      let died = false

      if (result.bossDefeated) {
        outcome = "vitoria"
        await ctx.prisma.battle.update({
          where: { id: battle.id },
          data: { status: "VITORIA", bossHpRemaining: 0, endedAt: new Date() },
        })
        await incrementStats(ctx.prisma, character.id, { bossesDerrotados: 1 })
        loot = await rollAndGrantBossLoot(ctx.prisma, character.id, battle.boss.rank)
        xpGain = BOSS_XP_REWARD[battle.boss.rank]

        // "Golpe Ágil" awakens on a flawless (no damage taken) Rank C clear, per its own seed data.
        if (battle.boss.rank === "C") {
          const tookDamage = await ctx.prisma.battleTurn.findFirst({
            where: { battleId: battle.id, bossDamageDealt: { gt: 0 } },
          })
          if (!tookDamage) awakenedSkill = await tryDiscoverSkill(ctx.prisma, character.id, SKILL_EFFECT_IDS.agileCritTurns)
        }
      } else if (result.playerDefeated || finalPlayerHp <= 0) {
        outcome = "derrota"
        died = true
        await ctx.prisma.battle.update({
          where: { id: battle.id },
          data: { status: "DERROTA", endedAt: new Date() },
        })
      } else {
        await ctx.prisma.battle.update({
          where: { id: battle.id },
          data: {
            bossHpRemaining: result.bossHpRemaining,
            currentTurn: battle.currentTurn + 1,
            itemsSealed: result.nextItemsSealed,
            duplicateNextChallenge: result.nextDuplicateNextChallenge,
          },
        })
      }

      let leveledUp = false
      let fromLevel = character.level
      let toLevel = character.level

      if (died) {
        const freshCharacter = await ctx.prisma.character.findUniqueOrThrow({ where: { id: character.id } })
        await killCharacter(ctx.prisma, freshCharacter, `boss:${battle.boss.id}`)
      } else {
        if (xpGain > 0) {
          const xpResult = await grantXp(ctx.prisma, { ...character, hp: finalPlayerHp }, xpGain)
          leveledUp = xpResult.levelsGained > 0
          fromLevel = xpResult.fromLevel
          toLevel = xpResult.toLevel
        }

        if (!awakenedSkill && survivedCritical) {
          awakenedSkill = await tryDiscoverSkill(ctx.prisma, character.id, SKILL_EFFECT_IDS.survivalPulse)
        }
        unlockedAchievements = await unlockAchievements(ctx.prisma, character.id, { survivedCriticalHp: survivedCritical })
      }

      const finalCharacter = await ctx.prisma.character.findUnique({ where: { id: character.id }, include: CHARACTER_INCLUDE })

      return {
        turn: {
          turnNumber: battle.currentTurn,
          exerciseId,
          target,
          performanceTier,
          logLines: result.logLines,
          bossDamageDealt: result.bossDamageDealt,
          playerDamageDealt: result.playerDamageDealt,
        },
        battle: { bossHp: result.bossHpRemaining, bossHpMax: battle.boss.hp, outcome },
        character: finalCharacter ? serializeCharacter(finalCharacter) : null,
        died,
        loot,
        xpGain,
        leveledUp,
        fromLevel,
        toLevel,
        unlockedAchievements,
        awakenedSkill,
      }
    }),

  useItem: protectedProcedure.input(z.object({ battleId: z.string(), itemId: z.string() })).mutation(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)
    const battle = await ctx.prisma.battle.findUniqueOrThrow({ where: { id: input.battleId } })
    if (battle.characterId !== character.id) throw new TRPCError({ code: "FORBIDDEN" })
    if (battle.status !== "EM_ANDAMENTO") throw new TRPCError({ code: "BAD_REQUEST", message: "Este combate já terminou." })
    if (battle.itemsSealed) throw new TRPCError({ code: "BAD_REQUEST", message: "Selo Arcano ativo: itens bloqueados neste turno." })

    const owned = await ctx.prisma.inventoryItem.findUnique({
      where: { characterId_itemId: { characterId: character.id, itemId: input.itemId } },
      include: { item: true },
    })
    if (!owned || owned.quantity < 1) throw new TRPCError({ code: "BAD_REQUEST", message: "Você não possui este item." })
    if (owned.item.category !== "POCAO") throw new TRPCError({ code: "BAD_REQUEST", message: "Apenas poções podem ser usadas em combate." })

    const healAmount = Math.round(character.hpMax * POTION_HEAL_FRACTION)
    const newHp = Math.min(character.hpMax, character.hp + healAmount)

    await ctx.prisma.$transaction([
      ctx.prisma.character.update({ where: { id: character.id }, data: { hp: newHp } }),
      ctx.prisma.inventoryItem.update({ where: { id: owned.id }, data: { quantity: { decrement: 1 } } }),
    ])

    return { healed: newHp - character.hp, hp: newHp, hpMax: character.hpMax }
  }),

  abandon: protectedProcedure.input(z.object({ battleId: z.string() })).mutation(async ({ ctx, input }) => {
    const character = await requireActiveCharacter(ctx)
    const battle = await ctx.prisma.battle.findUniqueOrThrow({ where: { id: input.battleId } })
    if (battle.characterId !== character.id) throw new TRPCError({ code: "FORBIDDEN" })
    if (battle.status === "EM_ANDAMENTO") {
      await ctx.prisma.battle.update({ where: { id: battle.id }, data: { status: "DERROTA", endedAt: new Date() } })
    }
    return { success: true }
  }),
})
