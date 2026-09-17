import { CheckCircle } from "@phosphor-icons/react"
import type { Mission } from "@/data/types"
import { percentage } from "@/lib/utils"

const TYPE_LABEL: Record<Mission["type"], string> = {
  diaria: "Diária",
  bonus: "Bônus",
  especial: "Especial",
}

const TYPE_COLOR: Record<Mission["type"], string> = {
  diaria: "var(--color-system)",
  bonus: "var(--color-gold)",
  especial: "var(--color-rarity-ultrararo)",
}

interface MissionCardProps {
  mission: Mission
  onToggle?: () => void
  /** When set, this mission's exercise has a real camera detector — show "Validar com Câmera" instead of an unvalidated "Concluir". */
  onValidateWithCamera?: () => void
  /** When set, this mission tracks distance via GPS — show "Validar com GPS" instead of an unvalidated "Concluir". */
  onValidateWithRun?: () => void
}

export function MissionCard({ mission, onToggle, onValidateWithCamera, onValidateWithRun }: MissionCardProps) {
  const color = TYPE_COLOR[mission.type]
  const pct = percentage(mission.progress, mission.target)

  return (
    <div className="flex flex-col gap-3 border border-surface-border bg-surface-1 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className="font-display text-[10px] font-bold tracking-[0.18em] uppercase"
            style={{ color }}
          >
            {TYPE_LABEL[mission.type]}
          </span>
          <p className="mt-1 font-display text-sm font-semibold text-ink-primary">{mission.title}</p>
        </div>
        {mission.completed ? <CheckCircle size={20} weight="fill" className="shrink-0 text-system" /> : null}
      </div>

      <p className="text-xs leading-relaxed text-ink-secondary">{mission.description}</p>
      <p className="text-xs text-ink-tertiary">{mission.objective}</p>

      <div>
        <div className="mb-1 flex items-center justify-between font-mono text-[11px] text-ink-tertiary">
          <span>
            {mission.progress} / {mission.target}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface-2">
          <div
            className="h-full transition-[width] duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-2">
        <p className="font-mono text-[11px] text-ink-secondary">{mission.reward}</p>
        {!mission.completed && onValidateWithCamera ? (
          <button
            type="button"
            onClick={onValidateWithCamera}
            className="shrink-0 font-display text-[10px] font-semibold tracking-[0.15em] text-system uppercase hover:text-system-strong"
          >
            Validar com Câmera
          </button>
        ) : !mission.completed && onValidateWithRun ? (
          <button
            type="button"
            onClick={onValidateWithRun}
            className="shrink-0 font-display text-[10px] font-semibold tracking-[0.15em] text-system uppercase hover:text-system-strong"
          >
            Validar com GPS
          </button>
        ) : onToggle && !mission.completed ? (
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 font-display text-[10px] font-semibold tracking-[0.15em] text-system uppercase hover:text-system-strong"
          >
            Concluir
          </button>
        ) : null}
      </div>
    </div>
  )
}
