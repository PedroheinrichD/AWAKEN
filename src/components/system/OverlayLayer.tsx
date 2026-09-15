import { Awakening } from "@/components/cinematic/Awakening"
import { LevelUp } from "@/components/cinematic/LevelUp"
import { RankUp } from "@/components/cinematic/RankUp"
import { useGameStore } from "@/store/useGameStore"

export function OverlayLayer() {
  const overlay = useGameStore((state) => state.overlay)
  const levelUpPayload = useGameStore((state) => state.levelUpPayload)
  const rankUpPayload = useGameStore((state) => state.rankUpPayload)
  const awakenedSkill = useGameStore((state) => state.awakenedSkill)
  const closeOverlay = useGameStore((state) => state.closeOverlay)

  if (overlay === "levelUp" && levelUpPayload) {
    return <LevelUp from={levelUpPayload.from} to={levelUpPayload.to} onDismiss={closeOverlay} />
  }
  if (overlay === "rankUp" && rankUpPayload) {
    return <RankUp from={rankUpPayload.from} to={rankUpPayload.to} onDismiss={closeOverlay} />
  }
  if (overlay === "awakening" && awakenedSkill) {
    return <Awakening skill={awakenedSkill} onDismiss={closeOverlay} />
  }
  return null
}
