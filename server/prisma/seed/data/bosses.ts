import type { Rank } from "@prisma/client"

export interface BossAbilitySeed {
  name: string
  description: string
  effectKey: string
  triggerChance: number
}

export interface BossSeed {
  id: string
  name: string
  rank: Rank
  hp: number
  dano: number
  description: string
  encounterType: "COMUM" | "ERRANTE" | "SECRETO"
  isPromotionTrialFor?: Rank
  abilities: BossAbilitySeed[]
}

const ABILITY_POOL: BossAbilitySeed[] = [
  { name: "Selo Arcano", description: "Bloqueia o uso de itens pelo jogador por um turno.", effectKey: "SELO_ARCANO", triggerChance: 0.18 },
  { name: "Maldição da Duplicação", description: "Duplica o desafio do próximo turno.", effectKey: "MALDICAO_DUPLICACAO", triggerChance: 0.16 },
  { name: "Barreira Sombria", description: "Reduz o dano recebido pelo Boss neste turno.", effectKey: "BARREIRA_SOMBRIA", triggerChance: 0.22 },
  { name: "Dreno", description: "Recupera parte do HP do Boss.", effectKey: "DRENO", triggerChance: 0.2 },
  { name: "Golpe Devastador", description: "Ataque de dano elevado quando o desempenho do jogador é fraco.", effectKey: "GOLPE_DEVASTADOR", triggerChance: 0.25 },
  { name: "Fúria Crescente", description: "O dano do Boss cresce a cada turno.", effectKey: "FURIA_CRESCENTE", triggerChance: 0.3 },
  { name: "Ecos do Abismo", description: "Um eco sombrio causa dano adicional.", effectKey: "ECOS_ABISMO", triggerChance: 0.18 },
  { name: "Couraça Rúnica", description: "Absorve parte de um golpe crítico do jogador.", effectKey: "COURACA_RUNICA", triggerChance: 0.2 },
  { name: "Sussurro Paralisante", description: "Reduz a precisão do jogador neste turno.", effectKey: "SUSSURRO_PARALISANTE", triggerChance: 0.18 },
  { name: "Renascimento Parcial", description: "Impede que o Boss caia abaixo de 10% de HP prematuramente.", effectKey: "RENASCIMENTO_PARCIAL", triggerChance: 1 },
]

interface RankTier {
  rank: Rank
  description: string
  hpBase: number
  danoBase: number
  abilityCount: number
  names: string[]
}

const TIERS: RankTier[] = [
  {
    rank: "E",
    description: "Uma ameaça menor, mas descuido também mata iniciantes.",
    hpBase: 90,
    danoBase: 8,
    abilityCount: 1,
    names: [
      "Rato Gigante", "Corvo Presságio", "Javali Selvagem", "Sombra Fraca", "Cão Feral",
      "Aranha Comum", "Slime Ácido", "Morcego Cavernoso", "Lobo Filhote", "Espectro Menor",
      "Golem de Barro", "Bandido Solitário",
    ],
  },
  {
    rank: "D",
    description: "Já exige preparo real. Muitos caçadores subestimam e pagam caro.",
    hpBase: 220,
    danoBase: 18,
    abilityCount: 2,
    names: [
      "Lobo Alfa", "Ogro do Pântano", "Esqueleto Guerreiro", "Sombra Errante", "Harpia Selvagem",
      "Troll de Pântano", "Cavaleiro Caído", "Serpente do Rio", "Golem de Pedra", "Bandido Chefe",
    ],
  },
  {
    rank: "C",
    description: "Um combate à altura de quem já provou o próprio sangue algumas vezes.",
    hpBase: 420,
    danoBase: 30,
    abilityCount: 2,
    names: [
      "Minotauro da Encruzilhada", "Necromante Menor", "Wyvern Jovem", "Cavaleiro Amaldiçoado", "Golem de Ferro",
      "Bruxa da Névoa", "Ciclope Solitário", "Sombra Guardiã", "Fera do Abismo Raso",
    ],
  },
  {
    rank: "B",
    description: "Poucos enfrentam este nível sem cicatrizes para mostrar depois.",
    hpBase: 700,
    danoBase: 46,
    abilityCount: 3,
    names: [
      "Dragão Jovem", "Arcanjo Caído", "Titã de Gelo", "Rei Esqueleto", "Demônio Menor",
      "Fera Ancestral", "Golem de Obsidiana", "Senhor das Sombras",
    ],
  },
  {
    rank: "A",
    description: "Histórias sobre esta ameaça geralmente terminam em silêncio.",
    hpBase: 1150,
    danoBase: 68,
    abilityCount: 3,
    names: ["Dragão Ancião", "General Infernal", "Titã de Ferro", "Arauto do Vazio", "Colosso de Cinzas", "Rainha Aracnídea"],
  },
  {
    rank: "S",
    description: "Aparece raramente. Quando aparece, cidades inteiras sentem.",
    hpBase: 1900,
    danoBase: 95,
    abilityCount: 4,
    names: ["Monarca das Sombras", "Devorador de Mundos (Fragmento)", "Wyrm do Abismo", "Arauto do Juízo Final"],
  },
  {
    rank: "SPLUS",
    description: "Não deveria existir um registro deste combate. E ainda assim, existe.",
    hpBase: 3200,
    danoBase: 140,
    abilityCount: 5,
    names: ["O Rei que Não Deveria Acordar"],
  },
]

function buildAbilities(offset: number, count: number): BossAbilitySeed[] {
  return Array.from({ length: count }, (_, i) => ABILITY_POOL[(offset + i) % ABILITY_POOL.length])
}

function buildBosses(): BossSeed[] {
  const bosses: BossSeed[] = []
  let globalIndex = 0

  for (const tier of TIERS) {
    tier.names.forEach((name, i) => {
      const isFirstOfTier = i === 0
      const isPromotionTrialFor = isFirstOfTier && tier.rank !== "E" ? tier.rank : undefined

      let encounterType: BossSeed["encounterType"] = "COMUM"
      if (tier.rank === "SPLUS") encounterType = "SECRETO"
      else if (globalIndex % 7 === 0) encounterType = "ERRANTE"

      bosses.push({
        id: `boss-${tier.rank.toLowerCase()}-${String(i + 1).padStart(2, "0")}`,
        name,
        rank: tier.rank,
        hp: tier.hpBase + (i % 5) * Math.round(tier.hpBase * 0.08),
        dano: tier.danoBase + (i % 5) * 2,
        description: tier.description,
        encounterType,
        isPromotionTrialFor,
        abilities: buildAbilities(globalIndex, tier.abilityCount),
      })
      globalIndex += 1
    })
  }

  return bosses
}

export const BOSSES: BossSeed[] = buildBosses()
