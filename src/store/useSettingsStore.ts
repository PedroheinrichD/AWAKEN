import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SettingsState {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

/**
 * The only client-persisted preference so far — everything else about the player
 * lives on the server (see store/useGameStore.ts). Kept in its own store rather
 * than folded into useGameStore since that one is explicitly ephemeral UI state.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    }),
    { name: "awaken-settings" },
  ),
)
