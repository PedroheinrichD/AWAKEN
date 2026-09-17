import type { Rank } from "@/lib/rank"
import type { Rarity } from "@/lib/rarity"

export interface Attributes {
  forca: number
  resistencia: number
  agilidade: number
  vitalidade: number
  stamina: number
}

export type EquipmentSlotKey =
  | "cabeca"
  | "corpo"
  | "maos"
  | "pernas"
  | "pes"
  | "arma"
  | "acessorio1"
  | "acessorio2"

export type ItemCategory = "arma" | "armadura" | "roupa" | "acessorio" | "item" | "pocao" | "itemMagico"

export type IconKey =
  | "sword"
  | "shield"
  | "helmet"
  | "gloves"
  | "boots"
  | "ring"
  | "amulet"
  | "flask"
  | "scroll"
  | "gem"
  | "core"
  | "spear"
  | "dagger"
  | "lightning"
  | "wind"
  | "heart"
  | "eye"
  | "flame"
  | "trophy"
  | "crown"
  | "skull"
  | "compass"
  | "coin"

export interface ItemRequirements {
  level?: number
  rank?: Rank
  attributes?: Partial<Attributes>
}

export interface Item {
  id: string
  name: string
  category: ItemCategory
  slot?: EquipmentSlotKey
  rarity: Rarity
  icon: IconKey
  description: string
  passive?: string
  active?: string
  requirements?: ItemRequirements
  bonus?: Partial<Attributes>
  quantity?: number
}

export interface Skill {
  id: string
  name: string
  description: string
  effect: string
  cost: string
  cooldown: string
  duration?: string
  awakenedCondition: string
  icon: IconKey
}

export type BossEncounterType = "comum" | "errante" | "secreto"

export interface Boss {
  id: string
  name: string
  rank: Rank
  hp: number
  dano: number
  description: string
  abilities: string[]
  encounterType: BossEncounterType
  defeated: boolean
}

export type MissionType = "diaria" | "bonus" | "especial"

export interface Mission {
  id: string
  title: string
  description: string
  type: MissionType
  objective: string
  exerciseId: string | null
  progress: number
  target: number
  reward: string
  completed: boolean
}

export interface GameEvent {
  id: string
  title: string
  category: string
  description: string
  rarity: Rarity
  timeRemaining?: string
  active: boolean
}

export interface ShopListing {
  id: string
  name: string
  rarity: Rarity
  price: number
  exclusive: boolean
  description: string
  icon: IconKey
}

export interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt: string
  icon: IconKey
}

export interface TitleEntry {
  id: string
  name: string
  description: string
  equipped: boolean
}

export interface JourneyStats {
  flexoes: number
  agachamentos: number
  abdominais: number
  km: number
  exerciciosAvancados: number
  bossesDerrotados: number
  missoesConcluidas: number
  vitoriasX1: number
  derrotasX1: number
  maiorStreak: number
  eventosConcluidos: number
}

export interface CharacterAppearance {
  skinTone: string
  hairStyle: "curto" | "longo" | "raspado" | "preso" | "moicano" | "afro" | "trancas"
  hairColor: string
  eyeColor: string
  bodyType: "esguio" | "atletico" | "robusto"
}

export interface Character {
  name: string
  rank: Rank
  level: number
  xp: number
  xpToNext: number
  hp: number
  hpMax: number
  attributes: Attributes
  streak: number
  equippedTitle: string | null
  appearance: CharacterAppearance
  equipment: Partial<Record<EquipmentSlotKey, string>>
}
