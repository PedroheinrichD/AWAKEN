import { useState } from "react"
import { MissionCard } from "@/components/missions/MissionCard"
import { SystemPanel } from "@/components/system/SystemPanel"
import { MISSIONS } from "@/data/missions"
import type { Mission, MissionType } from "@/data/types"

const SECTIONS: { type: MissionType; label: string; hint: string }[] = [
  { type: "diaria", label: "Missões Diárias", hint: "Renovam a cada ciclo. Sustentam a progressão principal." },
  { type: "bonus", label: "Missões Bônus", hint: "Opcionais. Recompensas adicionais para quem busca mais." },
  { type: "especial", label: "Missões Especiais", hint: "Ligadas a eventos e objetivos fora do comum." },
]

export function MissionsScreen() {
  const [missions, setMissions] = useState<Mission[]>(MISSIONS)

  function toggle(id: string) {
    setMissions((prev) =>
      prev.map((mission) => (mission.id === id ? { ...mission, completed: true, progress: mission.target } : mission)),
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Registro de Missões</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Missões</h1>
      </div>

      {SECTIONS.map((section) => {
        const items = missions.filter((mission) => mission.type === section.type)
        return (
          <SystemPanel key={section.type} label={section.label} className="p-5">
            <p className="mb-4 -mt-1 text-xs text-ink-tertiary">{section.hint}</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((mission) => (
                <MissionCard key={mission.id} mission={mission} onToggle={() => toggle(mission.id)} />
              ))}
            </div>
          </SystemPanel>
        )
      })}
    </div>
  )
}
