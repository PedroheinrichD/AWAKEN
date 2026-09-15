import { CalendarStar, Compass, MapPin as MapPinIcon, Skull, Sparkle } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { SystemPanel } from "@/components/system/SystemPanel"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

type PinType = "boss" | "portal" | "evento" | "local"

interface MapPin {
  id: string
  type: PinType
  label: string
  x: number
  y: number
  detail: string
}

const PIN_ICON: Record<PinType, PhosphorIcon> = {
  boss: Skull,
  portal: Sparkle,
  evento: CalendarStar,
  local: Compass,
}

const PIN_COLOR: Record<PinType, string> = {
  boss: "var(--color-danger)",
  portal: "var(--color-system)",
  evento: "var(--color-gold)",
  local: "var(--color-rarity-ultrararo)",
}

export function MapScreen() {
  const { data: todaysBoss } = trpc.bosses.today.useQuery()
  const [selected, setSelected] = useState<string | null>(null)

  const pins: MapPin[] = [
    ...(todaysBoss
      ? [{ id: "p1", type: "boss" as const, label: todaysBoss.name, x: 62, y: 36, detail: `Boss Rank ${todaysBoss.rank} avistado nesta região.` }]
      : []),
    { id: "p2", type: "portal", label: "Portal Instável", x: 26, y: 54, detail: "Uma fenda instável foi detectada nas proximidades." },
    { id: "p3", type: "evento", label: "Caça ao Tesouro", x: 76, y: 68, detail: "Pistas espalhadas pela região sob luz cheia." },
    { id: "p4", type: "local", label: "Santuário Abandonado", x: 45, y: 20, detail: "Um local especial. Ninguém sabe o que há dentro." },
    { id: "p5", type: "boss", label: "Boss Errante", x: 16, y: 78, detail: "Presença errante de rank desconhecido." },
  ]

  const activePin = pins.find((pin) => pin.id === selected)

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Reconhecimento</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Mapa</h1>
        <p className="mt-2 max-w-lg text-sm text-ink-secondary">
          Preparado para integração com geolocalização real. Por enquanto, uma projeção do Sistema sobre a região.
        </p>
      </div>

      <SystemPanel accent="system" className="relative aspect-[16/10] w-full overflow-hidden p-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(76,201,240,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,0.09) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(3,4,5,0.7) 100%)" }} />

        {pins.map((pin) => {
          const Icon = PIN_ICON[pin.type]
          const color = PIN_COLOR[pin.type]
          return (
            <button
              key={pin.id}
              type="button"
              onClick={() => setSelected(pin.id === selected ? null : pin.id)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <span
                className={cn("flex h-9 w-9 items-center justify-center rounded-full border", pin.id === selected && "animate-pulse-slow")}
                style={{ borderColor: color, backgroundColor: "rgba(7,8,10,0.85)", boxShadow: `0 0 16px color-mix(in srgb, ${color} 45%, transparent)` }}
              >
                <Icon size={16} weight="fill" style={{ color }} />
              </span>
            </button>
          )
        })}
      </SystemPanel>

      {activePin ? (
        <SystemPanel accent="system" className="flex items-start gap-3 p-5">
          <MapPinIcon size={18} className="mt-0.5 shrink-0 text-system" />
          <div>
            <p className="font-display text-sm font-semibold text-ink-primary">{activePin.label}</p>
            <p className="mt-1 text-xs text-ink-secondary">{activePin.detail}</p>
          </div>
        </SystemPanel>
      ) : (
        <p className="text-xs text-ink-tertiary">Toque em um ponto do mapa para ver detalhes.</p>
      )}
    </div>
  )
}
