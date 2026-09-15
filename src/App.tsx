import { useState } from "react"
import { AppRoutes } from "@/app/AppRoutes"
import { BootSequence } from "@/components/cinematic/BootSequence"
import { DeathScreen } from "@/components/cinematic/DeathScreen"
import { GrainOverlay } from "@/components/system/GrainOverlay"
import { AuthScreen } from "@/screens/Auth"
import { CharacterCreateScreen } from "@/screens/CharacterCreate"
import { NoCharacterScreen } from "@/screens/NoCharacter"
import { trpc } from "@/lib/trpc"

export function App() {
  const [booted, setBooted] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  const me = trpc.auth.me.useQuery(undefined, { enabled: booted })
  const activeCharacter = trpc.character.getActive.useQuery(undefined, { enabled: booted && Boolean(me.data) })
  const lastDead = trpc.character.getLastDead.useQuery(undefined, {
    enabled: booted && Boolean(me.data) && activeCharacter.data === null,
  })

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

    if (me.isLoading) {
      return <div className="min-h-dvh bg-void" />
    }

    if (!me.data) {
      return <AuthScreen />
    }

    if (activeCharacter.isLoading || (activeCharacter.data === null && lastDead.isLoading)) {
      return <div className="min-h-dvh bg-void" />
    }

    if (activeCharacter.data) {
      return <AppRoutes />
    }

    if (wizardOpen) {
      return <CharacterCreateScreen />
    }

    if (lastDead.data) {
      return <DeathScreen character={lastDead.data} onCreateNew={() => setWizardOpen(true)} />
    }

    return <NoCharacterScreen onCreate={() => setWizardOpen(true)} />
  }
}
