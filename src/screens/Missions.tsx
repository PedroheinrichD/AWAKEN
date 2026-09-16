import { lazy, Suspense, useState } from "react"
import { MissionCard } from "@/components/missions/MissionCard"
import { Modal } from "@/components/system/Modal"
import { SystemPanel } from "@/components/system/SystemPanel"
import type { MissionType } from "@/data/types"
import { isRepCountedExercise } from "@/lib/pose/exerciseDetector"
import { trpc } from "@/lib/trpc"
import { useGameStore } from "@/store/useGameStore"

// Keeps the MediaPipe vision runtime out of the Missions screen's own chunk —
// only fetched once a camera validation is actually opened (§19).
const MissionCameraChallenge = lazy(() =>
  import("@/components/missions/MissionCameraChallenge").then((module) => ({ default: module.MissionCameraChallenge })),
)

const SECTIONS: { type: MissionType; label: string; hint: string }[] = [
  { type: "diaria", label: "Missões Diárias", hint: "Renovam a cada ciclo. Sustentam a progressão principal." },
  { type: "bonus", label: "Missões Bônus", hint: "Opcionais. Recompensas adicionais para quem busca mais." },
  { type: "especial", label: "Missões Especiais", hint: "Ligadas a eventos e objetivos fora do comum." },
]

export function MissionsScreen() {
  const utils = trpc.useUtils()
  const pushOverlay = useGameStore((state) => state.pushOverlay)
  const { data: missions } = trpc.missions.listToday.useQuery()

  const [cameraMissionId, setCameraMissionId] = useState<string | null>(null)

  const complete = trpc.missions.complete.useMutation({
    onSuccess: (result) => {
      utils.missions.listToday.invalidate()
      utils.character.getActive.invalidate()
      utils.stats.get.invalidate()
      utils.items.inventory.invalidate()
      utils.achievements.unlocked.invalidate()
      utils.titles.unlocked.invalidate()
      setCameraMissionId(null)

      if (result.leveledUp) pushOverlay({ type: "levelUp", from: result.fromLevel, to: result.toLevel })
      if (result.awakenedSkill) pushOverlay({ type: "awakening", skill: result.awakenedSkill })
    },
  })

  const cameraMission = (missions ?? []).find((mission) => mission.id === cameraMissionId)

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Registro de Missões</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Missões</h1>
      </div>

      {SECTIONS.map((section) => {
        const items = (missions ?? []).filter((mission) => mission.type === section.type)
        if (items.length === 0) return null
        return (
          <SystemPanel key={section.type} label={section.label} className="p-5">
            <p className="mb-4 -mt-1 text-xs text-ink-tertiary">{section.hint}</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onToggle={() => complete.mutate({ assignmentId: mission.id })}
                  onValidateWithCamera={
                    mission.exerciseId && isRepCountedExercise(mission.exerciseId) ? () => setCameraMissionId(mission.id) : undefined
                  }
                />
              ))}
            </div>
          </SystemPanel>
        )
      })}

      <Modal open={Boolean(cameraMission)} onClose={() => setCameraMissionId(null)} className="max-w-md">
        <SystemPanel label={cameraMission?.title ?? "Validação por Câmera"} className="p-5">
          {cameraMission && cameraMission.exerciseId && isRepCountedExercise(cameraMission.exerciseId) ? (
            <Suspense fallback={<p className="text-center font-mono text-xs text-ink-tertiary">Carregando módulo de câmera...</p>}>
              <MissionCameraChallenge
                key={cameraMission.id}
                exerciseId={cameraMission.exerciseId}
                target={cameraMission.target}
                pending={complete.isPending}
                onComplete={() => complete.mutate({ assignmentId: cameraMission.id })}
                onCancel={() => setCameraMissionId(null)}
              />
            </Suspense>
          ) : null}
        </SystemPanel>
      </Modal>
    </div>
  )
}
