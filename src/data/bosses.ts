import type { Rank } from "@/lib/rank"
import type { Boss, BossEncounterType } from "./types"

const ABILITY_POOL = [
  "Selo Arcano",
  "Maldição da Duplicação",
  "Barreira Sombria",
  "Dreno",
  "Golpe Devastador",
  "Fúria Crescente",
  "Ecos do Abismo",
  "Couraça Rúnica",
  "Sussurro Paralisante",
  "Renascimento Parcial",
]

interface RankTier {
  rank: Rank
  names: string[]
  description: string
  hpBase: number
  danoBase: number
  abilityCount: number
}

const TIERS: RankTier[] = [
  {
    rank: "E",
    description: "Uma ameaça menor, mas descuido também mata iniciantes.",
    hpBase: 90,
    danoBase: 8,
    abilityCount: 1,
    names: [
      "Rato Gigante",
      "Corvo Presságio",
      "Javali Selvagem",
      "Sombra Fraca",
      "Cão Feral",
      "Aranha Comum",
      "Slime Ácido",
      "Morcego Cavernoso",
      "Lobo Filhote",
      "Espectro Menor",
      "Golem de Barro",
      "Bandido Solitário",
    ],
  },
  {
    rank: "D",
    description: "Já exige preparo real. Muitos caçadores subestimam e pagam caro.",
    hpBase: 220,
    danoBase: 18,
    abilityCount: 2,
    names: [
      "Lobo Alfa",
      "Ogro do Pântano",
      "Esqueleto Guerreiro",
      "Sombra Errante",
      "Harpia Selvagem",
      "Troll de Pântano",
      "Cavaleiro Caído",
      "Serpente do Rio",
      "Golem de Pedra",
      "Bandido Chefe",
    ],
  },
  {
    rank: "C",
    description: "Um combate à altura de quem já provou o próprio sangue algumas vezes.",
    hpBase: 420,
    danoBase: 30,
    abilityCount: 2,
    names: [
      "Minotauro da Encruzilhada",
      "Necromante Menor",
      "Wyvern Jovem",
      "Cavaleiro Amaldiçoado",
      "Golem de Ferro",
      "Bruxa da Névoa",
      "Ciclope Solitário",
      "Sombra Guardiã",
      "Fera do Abismo Raso",
    ],
  },
  {
    rank: "B",
    description: "Poucos enfrentam este nível sem cicatrizes para mostrar depois.",
    hpBase: 700,
    danoBase: 46,
    abilityCount: 3,
    names: [
      "Dragão Jovem",
      "Arcanjo Caído",
      "Titã de Gelo",
      "Rei Esqueleto",
      "Demônio Menor",
      "Fera Ancestral",
      "Golem de Obsidiana",
      "Senhor das Sombras",
    ],
  },
  {
    rank: "A",
    description: "Histórias sobre esta ameaça geralmente terminam em silêncio.",
    hpBase: 1150,
    danoBase: 68,
    abilityCount: 3,
    names: [
      "Dragão Ancião",
      "General Infernal",
      "Titã de Ferro",
      "Arauto do Vazio",
      "Colosso de Cinzas",
      "Rainha Aracnídea",
    ],
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
    rank: "S++",
    description: "Não deveria existir um registro deste combate. E ainda assim, existe.",
    hpBase: 3200,
    danoBase: 140,
    abilityCount: 5,
    names: ["O Rei que Não Deveria Acordar"],
  },
]

function buildAbilities(offset: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => ABILITY_POOL[(offset + i) % ABILITY_POOL.length])
}

function buildBosses(): Boss[] {
  const bosses: Boss[] = []
  let globalIndex = 0

  for (const tier of TIERS) {
    tier.names.forEach((name, i) => {
      const variance = i % 5
      let encounterType: BossEncounterType = "comum"
      if (tier.rank === "S++") encounterType = "secreto"
      else if (globalIndex % 7 === 0) encounterType = "errante"

      bosses.push({
        id: `boss-${tier.rank.toLowerCase().replace("+", "p")}-${i + 1}`,
        name,
        rank: tier.rank,
        hp: tier.hpBase + variance * Math.round(tier.hpBase * 0.08),
        dano: tier.danoBase + variance * 2,
        description: tier.description,
        abilities: buildAbilities(globalIndex, tier.abilityCount),
        encounterType,
        defeated: globalIndex < 2 || (tier.rank === "D" && i === 0),
      })
      globalIndex += 1
    })
  }

  return bosses
}

export const BOSSES: Boss[] = buildBosses()

export function getTodaysBoss(): Boss {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const candidates = BOSSES.filter((boss) => !boss.defeated)
  const pool = candidates.length > 0 ? candidates : BOSSES
  return pool[dayIndex % pool.length]
}
