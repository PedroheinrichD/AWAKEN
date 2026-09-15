import { motion } from "motion/react"
import { formatNumber, percentage } from "@/lib/utils"

interface HPBarProps {
  current: number
  max: number
  compact?: boolean
}

export function HPBar({ current, max, compact = false }: HPBarProps) {
  const pct = percentage(current, max)
  const critical = pct <= 25

  return (
    <div className="w-full">
      {!compact ? (
        <div className="mb-1 flex items-baseline justify-between">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink-tertiary">HP</span>
          <span className="font-mono text-xs text-ink-secondary">
            {formatNumber(current)} <span className="text-ink-tertiary">/ {formatNumber(max)}</span>
          </span>
        </div>
      ) : null}
      <div className="relative h-2.5 w-full overflow-hidden border border-surface-border bg-surface-2">
        <motion.div
          className={critical ? "h-full bg-danger animate-pulse-slow" : "h-full bg-danger"}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ boxShadow: critical ? "0 0 12px var(--color-danger)" : "0 0 8px rgba(255,59,78,0.35)" }}
        />
      </div>
    </div>
  )
}
