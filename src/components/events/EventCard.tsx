import { Hourglass } from "@phosphor-icons/react"
import { RarityBadge } from "@/components/rpg/RarityBadge"
import { SystemPanel } from "@/components/system/SystemPanel"
import type { GameEvent } from "@/data/types"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: GameEvent
}

export function EventCard({ event }: EventCardProps) {
  return (
    <SystemPanel accent={event.active ? "system" : "neutral"} className={cn("flex flex-col p-5", !event.active && "opacity-55")}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[10px] tracking-[0.2em] text-ink-tertiary uppercase">{event.category}</span>
        <RarityBadge rarity={event.rarity} />
      </div>
      <p className="mt-2 font-display text-base font-semibold text-ink-primary">{event.title}</p>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-secondary">{event.description}</p>
      {event.active && event.timeRemaining ? (
        <p className="mt-4 flex items-center gap-1.5 font-mono text-xs text-system">
          <Hourglass size={14} />
          {event.timeRemaining}
        </p>
      ) : (
        <p className="mt-4 font-mono text-xs text-ink-tertiary">Encerrado</p>
      )}
    </SystemPanel>
  )
}
