import {
  CalendarStar,
  ClipboardText,
  Crown,
  Diamond,
  Fire,
  Flame,
  Heart,
  Lightning,
  Skull,
  Sparkle,
  Trophy,
  Wind,
  XCircle,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { SystemPanel } from "@/components/system/SystemPanel"
import { trpc } from "@/lib/trpc"
import { formatNumber } from "@/lib/utils"

interface StatTile {
  icon: PhosphorIcon
  label: string
  value: string
}

export function StatsScreen() {
  const { data: stats } = trpc.stats.get.useQuery()

  if (!stats) return null

  const tiles: StatTile[] = [
    { icon: Lightning, label: "Flexões", value: formatNumber(stats.flexoes) },
    { icon: Wind, label: "Agachamentos", value: formatNumber(stats.agachamentos) },
    { icon: Fire, label: "Abdominais", value: formatNumber(stats.abdominais) },
    { icon: Skull, label: "Bosses Derrotados", value: formatNumber(stats.bossesDerrotados) },
    { icon: ClipboardText, label: "Missões Concluídas", value: formatNumber(stats.missoesConcluidas) },
    { icon: Trophy, label: "Vitórias em X1", value: formatNumber(stats.vitoriasX1) },
    { icon: XCircle, label: "Derrotas em X1", value: formatNumber(stats.derrotasX1) },
    { icon: Flame, label: "Maior Streak", value: `${stats.maiorStreak} dias` },
    { icon: CalendarStar, label: "Eventos Concluídos", value: formatNumber(stats.eventosConcluidos) },
    { icon: XCircle, label: "Mortes", value: formatNumber(stats.mortes) },
    { icon: Heart, label: "Ressurreições", value: formatNumber(stats.ressurreicoes) },
    { icon: Crown, label: "Itens Lendários", value: formatNumber(stats.itensLendarios) },
    { icon: Sparkle, label: "Itens DEUS", value: formatNumber(stats.itensDeus) },
    { icon: Trophy, label: "Maior Level", value: formatNumber(stats.maiorLevel) },
    { icon: Diamond, label: "Maior Rank", value: stats.maiorRank },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Histórico da Jornada Atual</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Estatísticas</h1>
      </div>

      <SystemPanel className="p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-surface-border pb-4">
          <p className="font-display text-4xl font-black text-system">{stats.km.toFixed(1)}</p>
          <p className="text-sm text-ink-tertiary">km percorridos nesta jornada</p>
          <p className="ml-auto font-mono text-xs text-ink-tertiary">
            +{stats.exerciciosAvancados} exercícios avançados registrados
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((tile) => (
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
