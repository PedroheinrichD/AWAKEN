import { useState } from "react"
import { AppRoutes } from "@/app/AppRoutes"
import { BootSequence } from "@/components/cinematic/BootSequence"
import { DeathScreen } from "@/components/cinematic/DeathScreen"
import { GrainOverlay } from "@/components/system/GrainOverlay"
import { CharacterCreateScreen } from "@/screens/CharacterCreate"
import { NoCharacterScreen } from "@/screens/NoCharacter"
import { useGameStore } from "@/store/useGameStore"

export function App() {
  const [booted, setBooted] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  const hasCharacter = useGameStore((state) => state.hasCharacter)
  const isDead = useGameStore((state) => state.isDead)
  const character = useGameStore((state) => state.character)

  return (
    <>
      <GrainOverlay />
      {renderContent()}
    </>
  )

  function renderContent() {
    if (!booted) {
      return <BootSequence onComplete={() => setBooted(true)} />
    }

    if (!hasCharacter || isDead) {
      if (wizardOpen) return <CharacterCreateScreen />
      if (isDead) return <DeathScreen character={character} onCreateNew={() => setWizardOpen(true)} />
      return <NoCharacterScreen onCreate={() => setWizardOpen(true)} />
    }

    return <AppRoutes />
  }
}
