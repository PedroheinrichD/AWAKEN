import { EventCard } from "@/components/events/EventCard"
import { EVENTS } from "@/data/events"

export function EventsScreen() {
  const sorted = [...EVENTS].sort((a, b) => Number(b.active) - Number(a.active))

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Central de Eventos</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Eventos</h1>
        <p className="mt-2 max-w-lg text-sm text-ink-secondary">
          O mundo muda sem aviso. Nem todo evento se repete, e nem todos retornam.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
