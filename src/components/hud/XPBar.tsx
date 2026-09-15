import { motion } from "motion/react"
import { formatNumber, percentage } from "@/lib/utils"

interface XPBarProps {
  current: number
  max: number
  compact?: boolean
}

export function XPBar({ current, max, compact = false }: XPBarProps) {
  const pct = percentage(current, max)

  return (
    <div className="w-full">
      {!compact ? (
        <div className="mb-1 flex items-baseline justify-between">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink-tertiary">XP</span>
          <span className="font-mono text-xs text-ink-secondary">
            {formatNumber(current)} <span className="text-ink-tertiary">/ {formatNumber(max)}</span>
          </span>
        </div>
      ) : null}
      <div className="relative h-1.5 w-full overflow-hidden border border-surface-border bg-surface-2">
        <motion.div
          className="h-full bg-system"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ boxShadow: "0 0 8px rgba(76,201,240,0.45)" }}
        />
      </div>
    </div>
  )
}
