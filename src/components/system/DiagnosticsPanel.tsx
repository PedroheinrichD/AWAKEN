import { GearSix } from "@phosphor-icons/react"
import { useState } from "react"
import type { Skill } from "@/data/types"
import { trpc } from "@/lib/trpc"
import { useGameStore } from "@/store/useGameStore"
import { Modal } from "./Modal"
import { SystemPanel } from "./SystemPanel"

export function DiagnosticsPanel() {
  const [open, setOpen] = useState(false)
  const pushOverlay = useGameStore((state) => state.pushOverlay)
  const utils = trpc.useUtils()

  const invalidateCharacter = () => {
    utils.character.getActive.invalidate()
    utils.character.getLastDead.invalidate()
    utils.stats.get.invalidate()
  }

  const grantXp = trpc.dev.grantXp.useMutation({
    onSuccess: (result) => {
      invalidateCharacter()
      if (result.leveledUp) pushOverlay({ type: "levelUp", from: result.fromLevel, to: result.toLevel })
    },
  })

  const awaken = trpc.dev.awaken.useMutation({
    onSuccess: (skill) => {
      utils.skills.discovered.invalidate()
      pushOverlay({ type: "awakening", skill: skill as Skill })
    },
  })

  const simulateDeath = trpc.dev.simulateDeath.useMutation({ onSuccess: invalidateCharacter })

  function run(action: () => void) {
    action()
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Diagnóstico do Sistema"
        className="fixed right-4 bottom-4 z-40 flex h-10 w-10 items-center justify-center border border-surface-border-strong bg-surface-1/90 text-ink-tertiary backdrop-blur transition-colors hover:text-system"
      >
        <GearSix size={18} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <SystemPanel label="Diagnóstico do Sistema" className="p-5">
          <p className="mb-4 text-xs leading-relaxed text-ink-tertiary">
            Painel de demonstração. As ações abaixo são reais e persistidas: concedem XP de verdade, despertam uma
            habilidade real ou encerram o personagem de verdade.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <DiagButton label="Conceder 500 XP" onClick={() => run(() => grantXp.mutate({ amount: 500 }))} />
            <DiagButton label="Despertar Próxima Habilidade" onClick={() => run(() => awaken.mutate())} />
            <DiagButton label="Simular Morte" onClick={() => run(() => simulateDeath.mutate())} tone="danger" />
          </div>
        </SystemPanel>
      </Modal>
    </>
  )
}

function DiagButton({ label, onClick, tone = "system" }: { label: string; onClick: () => void; tone?: "system" | "danger" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        tone === "danger"
          ? "border border-danger/50 bg-danger/10 px-4 py-2.5 font-display text-xs font-semibold tracking-wide text-danger uppercase transition-colors hover:bg-danger/20"
          : "border border-surface-border-strong bg-surface-2 px-4 py-2.5 font-display text-xs font-semibold tracking-wide text-ink-secondary uppercase transition-colors hover:text-ink-primary"
      }
    >
      {label}
    </button>
  )
}
