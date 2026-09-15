export interface TitleSeed {
  id: string
  name: string
  description: string
}

/** ids intentionally match the corresponding Achievement id — unlocking one unlocks the other (see achievement.service.ts). */
export const TITLES: TitleSeed[] = [
  { id: "the-tireless", name: "The Tireless", description: "Para quem trata sequência de dias como um contrato inquebrável." },
  { id: "boss-hunter", name: "Boss Hunter", description: "Dez quedas confirmadas. A décima primeira já está sendo procurada." },
  { id: "survivor", name: "Survivor", description: "Esteve perto o suficiente do fim para reconhecer o cheiro dele." },
  { id: "first-blood", name: "First Blood", description: "A primeira vitória em X1 nunca sai da memória." },
]
