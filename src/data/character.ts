import type { Character } from "./types"

export const INITIAL_CHARACTER: Character = {
  name: "Pedro",
  rank: "B",
  level: 47,
  xp: 6200,
  xpToNext: 9800,
  hp: 340,
  hpMax: 420,
  attributes: {
    forca: 34,
    resistencia: 29,
    agilidade: 26,
    vitalidade: 31,
    stamina: 38,
  },
  streak: 27,
  equippedTitle: "the-tireless",
  appearance: {
    skinTone: "#c68a5e",
    hairStyle: "curto",
    hairColor: "#1c1a19",
    eyeColor: "#4cc9f0",
    bodyType: "atletico",
  },
  equipment: {
    cabeca: "elmo-do-cacador",
    corpo: "armadura-de-couro",
    maos: "luvas-reforcadas",
    pernas: "calca-de-couro",
    pes: "botas-de-viajante",
    arma: "lamina-do-iniciante",
    acessorio1: "anel-de-foco",
    acessorio2: "amuleto-da-resistencia",
  },
}
