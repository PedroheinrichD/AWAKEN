import type { PerformanceTier } from "@prisma/client"
import { BATTLE_CONFIG, PERFORMANCE_MODIFIERS } from "./config"

export interface BattleAbility {
  effectKey: string
  triggerChance: number
  name: string
}

export interface ResolveTurnInput {
  bossMaxHp: number
  bossHpRemaining: number
  bossDano: number
  bossAbilities: BattleAbility[]
  turnNumber: number
  performanceTier: PerformanceTier
  playerHp: number
  /** e.g. the "Golpe Ágil" discovered-skill passive. Defaults to 1 (no bonus). */
  bonusPlayerDamageMultiplier?: number
}

export interface ResolveTurnResult {
  playerDamageDealt: number
  bossDamageDealt: number
  bossHpRemaining: number
  playerHpRemaining: number
  bossAbilityUsed: string | null
  logLines: string[]
  nextItemsSealed: boolean
  nextDuplicateNextChallenge: boolean
  bossDefeated: boolean
  playerDefeated: boolean
}

/**
 * Resolves one boss-battle turn. Pure function (no I/O, no Prisma) so it can
 * be reasoned about and unit-tested independently of the tRPC layer.
 * Ability timing is deliberately same-turn wherever the flavor text in
 * claude.md allows it — only "Selo Arcano" and "Maldição da Duplicação"
 * carry state into the next turn, via the two flags returned here.
 */
export function resolveTurn(input: ResolveTurnInput): ResolveTurnResult {
  const logLines: string[] = []
  const modifiers = PERFORMANCE_MODIFIERS[input.performanceTier]

  let playerDamage = Math.round(
    input.bossMaxHp *
      BATTLE_CONFIG.baseDamageFractionOfBossHp *
      modifiers.playerDamageMultiplier *
      (input.bonusPlayerDamageMultiplier ?? 1),
  )

  let abilityUsed: string | null = null
  let abilityEffectKey: string | null = null
  let nextItemsSealed = false
  let nextDuplicateNextChallenge = false
  let bossHealAmount = 0
  let bossBonusDamage = 0
  let damageReductionFraction = 0

  const shuffledAbilities = [...input.bossAbilities].sort(() => Math.random() - 0.5)

  for (const ability of shuffledAbilities) {
    if (Math.random() > ability.triggerChance) continue

    let fizzled = false
    switch (ability.effectKey) {
      case "SELO_ARCANO":
        nextItemsSealed = true
        logLines.push(`${ability.name}: seus itens ficam bloqueados no próximo turno.`)
        break
      case "MALDICAO_DUPLICACAO":
        nextDuplicateNextChallenge = true
        logLines.push(`${ability.name}: o próximo desafio será duplicado.`)
        break
      case "BARREIRA_SOMBRIA":
        damageReductionFraction = 0.5
        logLines.push(`${ability.name}: o dano recebido pelo Boss foi reduzido.`)
        break
      case "DRENO":
        bossHealAmount = Math.round(input.bossMaxHp * 0.08)
        logLines.push(`${ability.name}: o Boss drenou HP do combate.`)
        break
      case "GOLPE_DEVASTADOR":
        if (input.performanceTier === "RUIM") {
          bossBonusDamage += Math.round(input.bossDano * 1.2)
          logLines.push(`${ability.name}: um golpe devastador acerta em cheio.`)
        } else {
          fizzled = true
        }
        break
      case "FURIA_CRESCENTE":
        bossBonusDamage += Math.round(input.bossDano * 0.05 * input.turnNumber)
        logLines.push(`${ability.name}: a fúria do Boss cresce a cada turno.`)
        break
      case "ECOS_ABISMO":
        bossBonusDamage += Math.round(input.bossDano * 0.3)
        logLines.push(`${ability.name}: um eco sombrio atinge você.`)
        break
      case "COURACA_RUNICA":
        if (input.performanceTier === "EXCEPCIONAL") {
          playerDamage = Math.round(playerDamage * 0.6)
          logLines.push(`${ability.name}: a couraça absorveu parte do seu golpe crítico.`)
        } else {
          fizzled = true
        }
        break
      case "SUSSURRO_PARALISANTE":
        logLines.push(`${ability.name}: um sussurro paralisante reduz sua precisão neste turno.`)
        break
      case "RENASCIMENTO_PARCIAL":
        fizzled = true // resolved reactively after damage, below
        break
      default:
        fizzled = true
    }

    if (!fizzled) {
      abilityUsed = ability.name
      abilityEffectKey = ability.effectKey
      break
    }
  }

  if (damageReductionFraction > 0) {
    playerDamage = Math.round(playerDamage * (1 - damageReductionFraction))
  }

  let bossHpRemaining = input.bossHpRemaining - playerDamage + bossHealAmount
  bossHpRemaining = Math.max(0, Math.min(bossHpRemaining, input.bossMaxHp))

  const hasRenascimento = input.bossAbilities.some((ability) => ability.effectKey === "RENASCIMENTO_PARCIAL")
  if (hasRenascimento && bossHpRemaining > 0 && bossHpRemaining < input.bossMaxHp * 0.1) {
    bossHpRemaining = Math.round(input.bossMaxHp * 0.1)
    logLines.push("Renascimento Parcial: o Boss se recusa a cair tão facilmente.")
  }

  const bossDefeated = bossHpRemaining <= 0

  let bossDamageDealt = 0
  let playerHpRemaining = input.playerHp

  if (!bossDefeated) {
    let hitChance: number = modifiers.bossHitChance
    if (abilityEffectKey === "SUSSURRO_PARALISANTE") hitChance = Math.min(0.95, hitChance + 0.2)

    if (Math.random() < hitChance) {
      const variance =
        BATTLE_CONFIG.bossDamageVarianceMin +
        Math.random() * (BATTLE_CONFIG.bossDamageVarianceMax - BATTLE_CONFIG.bossDamageVarianceMin)
      let damage = Math.round(input.bossDano * variance)

      const isCrit = Math.random() < BATTLE_CONFIG.bossCritChance + modifiers.bossCritBonus
      if (isCrit) {
        damage = Math.round(damage * BATTLE_CONFIG.bossCritMultiplier)
        logLines.push("Ataque crítico do Boss!")
      }

      damage += bossBonusDamage
      bossDamageDealt = damage
      playerHpRemaining = Math.max(0, input.playerHp - damage)
      logLines.push(`O Boss causou ${damage} de dano.`)
    } else {
      logLines.push("Você evitou o ataque do Boss neste turno.")
    }
  }

  logLines.unshift(`Você causou ${playerDamage} de dano ao Boss.`)

  return {
    playerDamageDealt: playerDamage,
    bossDamageDealt,
    bossHpRemaining,
    playerHpRemaining,
    bossAbilityUsed: abilityUsed,
    logLines,
    nextItemsSealed,
    nextDuplicateNextChallenge,
    bossDefeated,
    playerDefeated: playerHpRemaining <= 0,
  }
}
