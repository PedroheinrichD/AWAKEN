import {
  CalendarStar,
  ClipboardText,
  Fire,
  Flame,
  Lightning,
  Skull,
  Trophy,
  Wind,
  XCircle,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { SystemPanel } from "@/components/system/SystemPanel"
import { JOURNEY_STATS } from "@/data/stats"
import { formatNumber } from "@/lib/utils"

interface StatTile {
  icon: PhosphorIcon
  label: string
  value: string
}

const TILES: StatTile[] = [
  { icon: Lightning, label: "Flexões", value: formatNumber(JOURNEY_STATS.flexoes) },
  { icon: Wind, label: "Agachamentos", value: formatNumber(JOURNEY_STATS.agachamentos) },
  { icon: Fire, label: "Abdominais", value: formatNumber(JOURNEY_STATS.abdominais) },
  { icon: Skull, label: "Bosses Derrotados", value: formatNumber(JOURNEY_STATS.bossesDerrotados) },
  { icon: ClipboardText, label: "Missões Concluídas", value: formatNumber(JOURNEY_STATS.missoesConcluidas) },
  { icon: Trophy, label: "Vitórias em X1", value: formatNumber(JOURNEY_STATS.vitoriasX1) },
  { icon: XCircle, label: "Derrotas em X1", value: formatNumber(JOURNEY_STATS.derrotasX1) },
  { icon: Flame, label: "Maior Streak", value: `${JOURNEY_STATS.maiorStreak} dias` },
  { icon: CalendarStar, label: "Eventos Concluídos", value: formatNumber(JOURNEY_STATS.eventosConcluidos) },
]

export function StatsScreen() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Histórico da Jornada Atual</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Estatísticas</h1>
      </div>

      <SystemPanel className="p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-surface-border pb-4">
          <p className="font-display text-4xl font-black text-system">{JOURNEY_STATS.km.toFixed(1)}</p>
          <p className="text-sm text-ink-tertiary">km percorridos nesta jornada</p>
          <p className="ml-auto font-mono text-xs text-ink-tertiary">
            +{JOURNEY_STATS.exerciciosAvancados} exercícios avançados registrados
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {TILES.map((tile) => (
            <div key={tile.label} className="flex items-start gap-2.5">
              <tile.icon size={16} weight="regular" className="mt-0.5 shrink-0 text-system" />
              <div>
                <p className="font-mono text-xl font-bold text-ink-primary">{tile.value}</p>
                <p className="text-[11px] text-ink-tertiary">{tile.label}</p>
              </div>
            </div>
          ))}
        </div>
      </SystemPanel>
    </div>
  )
}
