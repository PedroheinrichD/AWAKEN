export interface AchievementSeed {
  id: string
  name: string
  description: string
  icon: string
  conditionKey: string
}

export const ACHIEVEMENTS: AchievementSeed[] = [
  { id: "boss-hunter", name: "Boss Hunter", description: "Derrotou 10 Bosses distintos.", icon: "sword", conditionKey: "BOSSES_DEFEATED_10" },
  { id: "the-tireless", name: "The Tireless", description: "Manteve uma sequência ativa por 20 dias consecutivos.", icon: "flame", conditionKey: "STREAK_20" },
  { id: "survivor", name: "Survivor", description: "Sobreviveu a um combate com menos de 5% de HP restante.", icon: "heart", conditionKey: "SURVIVED_CRITICAL_HP" },
  { id: "destroyer", name: "Destroyer", description: "Completou 100 flexões em um único dia.", icon: "lightning", conditionKey: "SINGLE_DAY_FLEXOES_100" },
  { id: "first-blood", name: "First Blood", description: "Venceu seu primeiro X1.", icon: "trophy", conditionKey: "X1_FIRST_WIN" },
  { id: "portador-de-fragmento", name: "Portador de Fragmento", description: "Obteve um item de raridade Ultra Rara ou superior.", icon: "gem", conditionKey: "OWNS_ULTRA_RARO_ITEM" },
]
