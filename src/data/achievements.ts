import type { Achievement } from "./types"

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "boss-hunter",
    name: "Boss Hunter",
    description: "Derrotou 10 Bosses distintos.",
    unlockedAt: "12 dias atrás",
    icon: "sword",
  },
  {
    id: "the-tireless",
    name: "The Tireless",
    description: "Manteve uma sequência ativa por 20 dias consecutivos.",
    unlockedAt: "8 dias atrás",
    icon: "flame",
  },
  {
    id: "survivor",
    name: "Survivor",
    description: "Sobreviveu a um combate com menos de 5% de HP restante.",
    unlockedAt: "5 dias atrás",
    icon: "heart",
  },
  {
    id: "destroyer",
    name: "Destroyer",
    description: "Completou 100 flexões em um único dia.",
    unlockedAt: "19 dias atrás",
    icon: "lightning",
  },
  {
    id: "first-blood",
    name: "First Blood",
    description: "Venceu seu primeiro X1.",
    unlockedAt: "31 dias atrás",
    icon: "trophy",
  },
  {
    id: "portador-de-fragmento",
    name: "Portador de Fragmento",
    description: "Obteve um item de raridade Ultra Rara.",
    unlockedAt: "3 dias atrás",
    icon: "gem",
  },
]
