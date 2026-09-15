import { create } from "zustand"
import type { Skill } from "@/data/types"
import type { Rank } from "@/lib/rank"

export interface LevelUpEvent {
  type: "levelUp"
  from: number
  to: number
}

export interface RankUpEvent {
  type: "rankUp"
  from: Rank
  to: Rank
}

export interface AwakeningEvent {
  type: "awakening"
  skill: Skill
}

export type OverlayEvent = LevelUpEvent | RankUpEvent | AwakeningEvent

interface UiState {
  overlayQueue: OverlayEvent[]
  pushOverlay: (event: OverlayEvent) => void
  dismissOverlay: () => void
}

/**
 * Everything persisted (character, items, missions, etc.) now lives on the
 * server and is read through tRPC/React Query hooks. This store only holds
 * ephemeral client-only UI state: the queue of ceremonial overlays waiting
 * to be shown (a mission or battle result can trigger more than one —
 * level up AND an awakening — so they queue rather than overwrite).
 */
export const useGameStore = create<UiState>()((set, get) => ({
  overlayQueue: [],
  pushOverlay: (event) => set({ overlayQueue: [...get().overlayQueue, event] }),
  dismissOverlay: () => set({ overlayQueue: get().overlayQueue.slice(1) }),
}))
