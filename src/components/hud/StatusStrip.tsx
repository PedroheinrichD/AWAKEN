import type { Icon as PhosphorIcon } from "@phosphor-icons/react"

export interface StatusChip {
  icon: PhosphorIcon
  label: string
  value: string
  tone?: "system" | "gold" | "danger"
}

const TONE_TEXT: Record<NonNullable<StatusChip["tone"]>, string> = {
  system: "text-system",
  gold: "text-gold",
  danger: "text-danger",
}

interface StatusStripProps {
  chips: StatusChip[]
}

export function StatusStrip({ chips }: StatusStripProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {chips.map((chip) => (
        <div key={chip.label} className="flex items-center gap-2">
          <chip.icon size={16} weight="regular" className={TONE_TEXT[chip.tone ?? "system"]} />
          <span className="text-xs text-ink-tertiary">{chip.label}</span>
          <span className="font-mono text-xs text-ink-primary">{chip.value}</span>
        </div>
      ))}
    </div>
  )
}
