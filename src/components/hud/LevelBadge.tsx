import { cn } from "@/lib/utils"

interface LevelBadgeProps {
  level: number
  className?: string
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-surface-border-strong bg-surface-2 px-3.5 py-1.5",
        className,
      )}
    >
      <span className="font-display text-[9px] font-semibold uppercase tracking-[0.3em] text-ink-tertiary">
        Nível
      </span>
      <span className="font-display text-2xl leading-none font-bold text-ink-primary">{level}</span>
    </div>
  )
}
