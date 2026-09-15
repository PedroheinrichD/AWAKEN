import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BossCard } from "@/components/bosses/BossCard"
import { SystemPanel } from "@/components/system/SystemPanel"
import { trpc } from "@/lib/trpc"
import { RANK_ORDER } from "@/lib/rank"
import type { Rank } from "@/lib/rank"
import { cn } from "@/lib/utils"

export function BossesScreen() {
  const [filter, setFilter] = useState<"todos" | Rank>("todos")
  const navigate = useNavigate()
  const { data: bosses } = trpc.bosses.list.useQuery()
  const { data: todaysBoss } = trpc.bosses.today.useQuery()

  const visibleBosses = (bosses ?? []).filter((boss) => filter === "todos" || boss.rank === filter)

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-danger uppercase">Registro de Ameaças</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Bosses</h1>
      </div>

      {todaysBoss ? (
        <SystemPanel accent="danger" label="Boss do Dia" className="p-5">
          <BossCard boss={todaysBoss} highlight onClick={() => navigate(`/bosses/${todaysBoss.id}`)} />
        </SystemPanel>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(["todos", ...RANK_ORDER] as const).map((rank) => (
          <button
            key={rank}
            type="button"
            onClick={() => setFilter(rank)}
            className={cn(
              "border px-3.5 py-1.5 font-display text-xs font-semibold tracking-wide uppercase transition-colors",
              filter === rank
                ? "border-danger bg-danger/10 text-danger"
                : "border-surface-border text-ink-tertiary hover:text-ink-secondary",
            )}
          >
            {rank === "todos" ? "Todos" : `Rank ${rank}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleBosses.map((boss) => (
          <BossCard key={boss.id} boss={boss} onClick={() => navigate(`/bosses/${boss.id}`)} />
        ))}
      </div>
    </div>
  )
}
