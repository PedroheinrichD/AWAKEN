import type { GameEvent } from "./types"

export const EVENTS: GameEvent[] = [
  {
    id: "boss-errante",
    title: "Boss Errante Avistado",
    category: "Boss Errante",
    description: "Uma presença de Rank C foi detectada nas proximidades. Ela não vai esperar.",
    rarity: "raro",
    timeRemaining: "04:12:00",
    active: true,
  },
  {
    id: "portal-instavel",
    title: "Portal Instável",
    category: "Portal",
    description: "Uma fenda se abriu. O que sai dela raramente é o que se espera.",
    rarity: "ultraRaro",
    timeRemaining: "11:40:00",
    active: true,
  },
  {
    id: "cacada-lua-cheia",
    title: "Caça ao Tesouro da Lua Cheia",
    category: "Caça ao Tesouro",
    description: "Pistas espalhadas aparecem apenas sob luz cheia. Amanhã pode ser tarde.",
    rarity: "incomum",
    timeRemaining: "1d 06:00:00",
    active: true,
  },
  {
    id: "chuva-fragmentos",
    title: "Chuva de Fragmentos",
    category: "Recompensa Surpresa",
    description: "Evento encerrado. Fragmentos extras foram distribuídos a quem participou a tempo.",
    rarity: "comum",
    active: false,
  },
]
