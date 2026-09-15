export interface MissionSeed {
  id: string
  title: string
  description: string
  objective: string
  type: "DIARIA" | "BONUS" | "ESPECIAL"
  exerciseId?: string
  targetReps?: number
  targetKm?: number
  targetSeconds?: number
  xpReward: number
  currencyReward?: number
  itemRewardId?: string
}

export const MISSIONS: MissionSeed[] = [
  {
    id: "diaria-flexoes",
    title: "50 Flexões ao Amanhecer",
    description: "O sistema registra apenas o esforço feito antes do meio-dia.",
    objective: "Complete 50 flexões",
    type: "DIARIA",
    exerciseId: "flexao",
    targetReps: 50,
    xpReward: 120,
  },
  {
    id: "diaria-corrida",
    title: "Corrida de 3km",
    description: "Distância mínima para manter o corpo alerta.",
    objective: "Corra 3km",
    type: "DIARIA",
    exerciseId: "corrida",
    targetKm: 3,
    xpReward: 90,
    itemRewardId: "fragmento-de-boss-e",
  },
  {
    id: "diaria-abdominais",
    title: "40 Abdominais",
    description: "O core sustenta tudo o que vem depois.",
    objective: "Complete 40 abdominais",
    type: "DIARIA",
    exerciseId: "abdominal",
    targetReps: 40,
    xpReward: 100,
  },
  {
    id: "diaria-agachamentos",
    title: "80 Agachamentos",
    description: "As pernas sustentam tudo o que vem depois.",
    objective: "Complete 80 agachamentos",
    type: "DIARIA",
    exerciseId: "agachamento",
    targetReps: 80,
    xpReward: 120,
  },
  {
    id: "bonus-handstand",
    title: "Parada de Mãos",
    description: "Inverter o corpo. Inverter o medo.",
    objective: "Sustente uma parada de mãos por 20 segundos",
    type: "BONUS",
    exerciseId: "handstand",
    targetSeconds: 20,
    xpReward: 200,
  },
  {
    id: "bonus-lsit",
    title: "L-Sit Prolongado",
    description: "Poucos sustentam. Menos ainda sustentam sorrindo.",
    objective: "Sustente um L-sit por 15 segundos",
    type: "BONUS",
    exerciseId: "lsit",
    targetSeconds: 15,
    xpReward: 180,
  },
  {
    id: "bonus-diamante",
    title: "Flexão Diamante x15",
    description: "A variação que separa curiosos de praticantes.",
    objective: "Complete 15 flexões diamante",
    type: "BONUS",
    exerciseId: "flexao",
    targetReps: 15,
    xpReward: 150,
  },
  {
    id: "especial-portal",
    title: "Desafio do Portal Instável",
    description: "Enquanto o portal permanecer aberto, ele exige tributo.",
    objective: "Complete o desafio ligado ao evento ativo",
    type: "ESPECIAL",
    xpReward: 250,
    currencyReward: 100,
  },
  {
    id: "especial-cacador-solitario",
    title: "Prova do Caçador Solitário",
    description: "Um teste que não anuncia suas próprias regras com antecedência.",
    objective: "Condição oculta",
    type: "ESPECIAL",
    xpReward: 50,
  },
]
