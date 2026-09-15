import { create } from "zustand"
import { persist } from "zustand/middleware"
import { INITIAL_CHARACTER } from "@/data/character"
import { HIDDEN_SKILL_POOL, DISCOVERED_SKILLS } from "@/data/skills"
import { RANK_ORDER } from "@/lib/rank"
import type { Rank } from "@/lib/rank"
import type { Character, CharacterAppearance, EquipmentSlotKey, Skill } from "@/data/types"

export type OverlayKind = "none" | "levelUp" | "rankUp" | "awakening" | "death"

interface LevelUpPayload {
  from: number
  to: number
}

interface RankUpPayload {
  from: Rank
  to: Rank
}

interface GameState {
  character: Character
  hasCharacter: boolean
  isDead: boolean
  currency: number
  discoveredSkillIds: string[]
  hiddenSkillCursor: number

  overlay: OverlayKind
  levelUpPayload: LevelUpPayload | null
  rankUpPayload: RankUpPayload | null
  awakenedSkill: Skill | null

  createCharacter: (name: string, appearance: CharacterAppearance) => void
  equipTitle: (id: string | null) => void
  equipItem: (slot: EquipmentSlotKey, itemId: string) => void
  purchaseListing: (price: number) => boolean

  triggerLevelUp: () => void
  triggerRankUp: () => void
  triggerAwakening: () => void
  triggerDeath: () => void
  closeOverlay: () => void
  reviveWithNewCharacter: (name: string, appearance: CharacterAppearance) => void
}

function nextRank(rank: Rank): Rank {
  const index = RANK_ORDER.indexOf(rank)
  return RANK_ORDER[Math.min(index + 1, RANK_ORDER.length - 1)]
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      character: INITIAL_CHARACTER,
      hasCharacter: false,
      isDead: false,
      currency: 1840,
      discoveredSkillIds: DISCOVERED_SKILLS.map((skill) => skill.id),
      hiddenSkillCursor: 0,

      overlay: "none",
      levelUpPayload: null,
      rankUpPayload: null,
      awakenedSkill: null,

      createCharacter: (name, appearance) => {
        set({
          character: { ...INITIAL_CHARACTER, name, appearance },
          hasCharacter: true,
          isDead: false,
        })
      },

      equipTitle: (id) => {
        set((state) => ({ character: { ...state.character, equippedTitle: id } }))
      },

      equipItem: (slot, itemId) => {
        set((state) => ({
          character: {
            ...state.character,
            equipment: { ...state.character.equipment, [slot]: itemId },
          },
        }))
      },

      purchaseListing: (price) => {
        const { currency } = get()
        if (currency < price) return false
        set({ currency: currency - price })
        return true
      },

      triggerLevelUp: () => {
        const { character } = get()
        set({
          overlay: "levelUp",
          levelUpPayload: { from: character.level, to: character.level + 1 },
          character: { ...character, level: character.level + 1, xp: 0 },
        })
      },

      triggerRankUp: () => {
        const { character } = get()
        const to = nextRank(character.rank)
        set({
          overlay: "rankUp",
          rankUpPayload: { from: character.rank, to },
          character: { ...character, rank: to },
        })
      },

      triggerAwakening: () => {
        const { hiddenSkillCursor, discoveredSkillIds } = get()
        const skill = HIDDEN_SKILL_POOL[hiddenSkillCursor % HIDDEN_SKILL_POOL.length]
        set({
          overlay: "awakening",
          awakenedSkill: skill,
          hiddenSkillCursor: hiddenSkillCursor + 1,
          discoveredSkillIds: discoveredSkillIds.includes(skill.id)
            ? discoveredSkillIds
            : [...discoveredSkillIds, skill.id],
        })
      },

      triggerDeath: () => {
        set({ overlay: "death", isDead: true })
      },

      closeOverlay: () => {
        set({ overlay: "none", levelUpPayload: null, rankUpPayload: null, awakenedSkill: null })
      },

      reviveWithNewCharacter: (name, appearance) => {
        set({
          character: { ...INITIAL_CHARACTER, name, appearance },
          hasCharacter: true,
          isDead: false,
          overlay: "none",
          discoveredSkillIds: DISCOVERED_SKILLS.map((skill) => skill.id),
          hiddenSkillCursor: 0,
        })
      },
    }),
    {
      name: "awaken-save",
      partialize: (state) => ({
        character: state.character,
        hasCharacter: state.hasCharacter,
        currency: state.currency,
        discoveredSkillIds: state.discoveredSkillIds,
        hiddenSkillCursor: state.hiddenSkillCursor,
      }),
    },
  ),
)
