import { Awakening } from "@/components/cinematic/Awakening"
import { LevelUp } from "@/components/cinematic/LevelUp"
import { RankUp } from "@/components/cinematic/RankUp"
import { useGameStore } from "@/store/useGameStore"

export function OverlayLayer() {
  const overlay = useGameStore((state) => state.overlayQueue[0])
  const dismissOverlay = useGameStore((state) => state.dismissOverlay)

  if (!overlay) return null

  if (overlay.type === "levelUp") {
    return <LevelUp from={overlay.from} to={overlay.to} onDismiss={dismissOverlay} />
  }
  if (overlay.type === "rankUp") {
    return <RankUp from={overlay.from} to={overlay.to} onDismiss={dismissOverlay} />
  }
  if (overlay.type === "awakening") {
    return <Awakening skill={overlay.skill} onDismiss={dismissOverlay} />
  }
  return null
}
