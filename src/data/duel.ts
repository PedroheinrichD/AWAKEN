import type { Rank } from "@/lib/rank"

export interface DuelOpponent {
  name: string
  rank: Rank
  level: number
  hp: number
  hpMax: number
}

export const OPPONENT: DuelOpponent = {
  name: "Marina",
  rank: "C",
  level: 39,
  hp: 260,
  hpMax: 300,
}

export interface DuelMatch {
  id: string
  challenge: string
  result: "vitoria" | "derrota"
  score: string
  date: string
}

export const DUEL_HISTORY: DuelMatch[] = [
  { id: "duel-1", challenge: "Flexões em 60s", result: "vitoria", score: "34 x 29", date: "2 dias atrás" },
  { id: "duel-2", challenge: "Agachamentos em 90s", result: "derrota", score: "41 x 47", date: "5 dias atrás" },
  { id: "duel-3", challenge: "Prancha (tempo)", result: "vitoria", score: "1:42 x 1:31", date: "9 dias atrás" },
  { id: "duel-4", challenge: "Flexões em 60s", result: "vitoria", score: "38 x 33", date: "14 dias atrás" },
  { id: "duel-5", challenge: "Abdominais em 60s", result: "derrota", score: "40 x 44", date: "20 dias atrás" },
]
