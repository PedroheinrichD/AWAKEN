import type { Rarity } from "@prisma/client"

export interface EventSeed {
  id: string
  title: string
  category: string
  description: string
  rarity: Rarity
  active: boolean
  startedHoursAgo: number
  endsInHours?: number
}

export const EVENTS: EventSeed[] = [
  {
    id: "boss-errante",
    title: "Boss Errante Avistado",
    category: "Boss Errante",
    description: "Uma presença de Rank C foi detectada nas proximidades. Ela não vai esperar.",
    rarity: "RARO",
    active: true,
    startedHoursAgo: 1,
    endsInHours: 4.2,
  },
  {
    id: "portal-instavel",
    title: "Portal Instável",
    category: "Portal",
    description: "Uma fenda se abriu. O que sai dela raramente é o que se espera.",
    rarity: "ULTRA_RARO",
    active: true,
    startedHoursAgo: 2,
    endsInHours: 11.67,
  },
  {
    id: "cacada-lua-cheia",
    title: "Caça ao Tesouro da Lua Cheia",
    category: "Caça ao Tesouro",
    description: "Pistas espalhadas aparecem apenas sob luz cheia. Amanhã pode ser tarde.",
    rarity: "INCOMUM",
    active: true,
    startedHoursAgo: 3,
    endsInHours: 30,
  },
  {
    id: "chuva-fragmentos",
    title: "Chuva de Fragmentos",
    category: "Recompensa Surpresa",
    description: "Evento encerrado. Fragmentos extras foram distribuídos a quem participou a tempo.",
    rarity: "COMUM",
    active: false,
    startedHoursAgo: 72,
    endsInHours: -24,
  },
]
