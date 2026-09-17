import { BodyType, BossEncounterType, EquipmentSlot, HairStyle, ItemCategory, MissionType, Rank, Rarity } from "@prisma/client"

/**
 * Enum names differ between the Prisma schema (SQL-friendly, upper snake case)
 * and the existing frontend (already-shipped UI, its own casing per domain).
 * These tables are the single place that bridges the two so every router
 * returns data the untouched frontend types already expect.
 *
 * The `Client*` unions below are intentionally duplicated (not imported) from
 * src/lib/rank.ts, src/lib/rarity.ts and src/data/types.ts: the client project
 * uses its own `@/*` path alias and a separate tsconfig rootDir, so importing
 * across that boundary isn't practical. These are stable, spec-mandated
 * vocabularies (claude.md's rank/rarity ladders) — if the frontend ever
 * renames one, mirror the change here.
 */
type ClientRank = "E" | "D" | "C" | "B" | "A" | "S" | "S++"
type ClientRarity = "comum" | "incomum" | "raro" | "ultraRaro" | "lendario" | "deus"
type ClientItemCategory = "arma" | "armadura" | "roupa" | "acessorio" | "item" | "pocao" | "itemMagico"
type ClientEquipmentSlot = "cabeca" | "corpo" | "maos" | "pernas" | "pes" | "arma" | "acessorio1" | "acessorio2"
type ClientBossEncounterType = "comum" | "errante" | "secreto"
type ClientMissionType = "diaria" | "bonus" | "especial"
type ClientHairStyle = "curto" | "longo" | "raspado" | "preso" | "moicano" | "afro" | "trancas"
type ClientBodyType = "esguio" | "atletico" | "robusto"

export type ClientIconKey =
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

/** DB `icon` columns are plain strings (see items.ts seed comment); this just re-asserts the
 * value is one of the frontend's known icon keys, which seed data guarantees. */
export function asIconKey(icon: string): ClientIconKey {
  return icon as ClientIconKey
}

export const RANK_TO_CLIENT: Record<Rank, ClientRank> = {
  E: "E",
  D: "D",
  C: "C",
  B: "B",
  A: "A",
  S: "S",
  SPLUS: "S++",
}

export const RANK_FROM_CLIENT: Record<ClientRank, Rank> = {
  E: Rank.E,
  D: Rank.D,
  C: Rank.C,
  B: Rank.B,
  A: Rank.A,
  S: Rank.S,
  "S++": Rank.SPLUS,
}

export const RARITY_TO_CLIENT: Record<Rarity, ClientRarity> = {
  COMUM: "comum",
  INCOMUM: "incomum",
  RARO: "raro",
  ULTRA_RARO: "ultraRaro",
  LENDARIO: "lendario",
  DEUS: "deus",
}

export const RARITY_FROM_CLIENT: Record<ClientRarity, Rarity> = {
  comum: Rarity.COMUM,
  incomum: Rarity.INCOMUM,
  raro: Rarity.RARO,
  ultraRaro: Rarity.ULTRA_RARO,
  lendario: Rarity.LENDARIO,
  deus: Rarity.DEUS,
}

export const CATEGORY_TO_CLIENT: Record<ItemCategory, ClientItemCategory> = {
  ARMA: "arma",
  ARMADURA: "armadura",
  ROUPA: "roupa",
  ACESSORIO: "acessorio",
  ITEM: "item",
  POCAO: "pocao",
  ITEM_MAGICO: "itemMagico",
}

export const SLOT_TO_CLIENT: Record<EquipmentSlot, ClientEquipmentSlot> = {
  CABECA: "cabeca",
  CORPO: "corpo",
  MAOS: "maos",
  PERNAS: "pernas",
  PES: "pes",
  ARMA: "arma",
  ACESSORIO1: "acessorio1",
  ACESSORIO2: "acessorio2",
}

export const SLOT_FROM_CLIENT: Record<ClientEquipmentSlot, EquipmentSlot> = {
  cabeca: EquipmentSlot.CABECA,
  corpo: EquipmentSlot.CORPO,
  maos: EquipmentSlot.MAOS,
  pernas: EquipmentSlot.PERNAS,
  pes: EquipmentSlot.PES,
  arma: EquipmentSlot.ARMA,
  acessorio1: EquipmentSlot.ACESSORIO1,
  acessorio2: EquipmentSlot.ACESSORIO2,
}

export const BOSS_ENCOUNTER_TO_CLIENT: Record<BossEncounterType, ClientBossEncounterType> = {
  COMUM: "comum",
  ERRANTE: "errante",
  SECRETO: "secreto",
}

export const HAIR_STYLE_TO_CLIENT: Record<HairStyle, ClientHairStyle> = {
  RASPADO: "raspado",
  CURTO: "curto",
  LONGO: "longo",
  PRESO: "preso",
  MOICANO: "moicano",
  AFRO: "afro",
  TRANCAS: "trancas",
}

export const HAIR_STYLE_FROM_CLIENT: Record<ClientHairStyle, HairStyle> = {
  raspado: HairStyle.RASPADO,
  curto: HairStyle.CURTO,
  longo: HairStyle.LONGO,
  preso: HairStyle.PRESO,
  moicano: HairStyle.MOICANO,
  afro: HairStyle.AFRO,
  trancas: HairStyle.TRANCAS,
}

export const BODY_TYPE_TO_CLIENT: Record<BodyType, ClientBodyType> = {
  ESGUIO: "esguio",
  ATLETICO: "atletico",
  ROBUSTO: "robusto",
}

export const BODY_TYPE_FROM_CLIENT: Record<ClientBodyType, BodyType> = {
  esguio: BodyType.ESGUIO,
  atletico: BodyType.ATLETICO,
  robusto: BodyType.ROBUSTO,
}

export const MISSION_TYPE_TO_CLIENT: Record<MissionType, ClientMissionType> = {
  DIARIA: "diaria",
  BONUS: "bonus",
  ESPECIAL: "especial",
}
