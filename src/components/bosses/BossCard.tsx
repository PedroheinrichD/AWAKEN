import { CheckCircle } from "@phosphor-icons/react"
import { RankBadge } from "@/components/hud/RankBadge"
import type { Boss } from "@/data/types"
import { cn } from "@/lib/utils"
import { BossSigil } from "./BossSigil"

interface BossCardProps {
  boss: Boss
  onClick?: () => void
  highlight?: boolean
}

export function BossCard({ boss, onClick, highlight = false }: BossCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 border bg-surface-1 p-4 text-left transition-colors",
        highlight ? "border-danger" : "border-surface-border hover:border-surface-border-strong",
      )}
    >
      <BossSigil boss={boss} size={56} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <RankBadge rank={boss.rank} size="sm" />
          <p className="truncate font-display text-sm font-semibold text-ink-primary">{boss.name}</p>
        </div>
        <p className="mt-1 truncate text-xs text-ink-secondary">{boss.description}</p>
        <div className="mt-2 flex gap-4 font-mono text-[11px] text-ink-tertiary">
          <span>HP {boss.hp}</span>
          <span>DANO {boss.dano}</span>
          {boss.encounterType === "errante" ? <span className="text-gold">ERRANTE</span> : null}
          {boss.encounterType === "secreto" ? <span className="text-danger">SECRETO</span> : null}
        </div>
      </div>
      {boss.defeated ? <CheckCircle size={20} weight="fill" className="shrink-0 text-system" /> : null}
    </button>
  )
}
