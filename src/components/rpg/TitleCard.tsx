import type { TitleEntry } from "@/data/types"
import { cn } from "@/lib/utils"

interface TitleCardProps {
  title: TitleEntry
  equipped: boolean
  onEquip?: () => void
}

export function TitleCard({ title, equipped, onEquip }: TitleCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border p-4",
        equipped ? "border-system bg-surface-2" : "border-surface-border bg-surface-1",
      )}
    >
      <p className="font-display text-sm font-semibold text-ink-primary">{title.name}</p>
      <p className="flex-1 text-xs leading-relaxed text-ink-secondary">{title.description}</p>
      {onEquip ? (
        <button
          type="button"
          onClick={onEquip}
          disabled={equipped}
          className={cn(
            "mt-1 self-start font-display text-[10px] font-semibold tracking-[0.2em] uppercase",
            equipped ? "text-system" : "text-ink-tertiary hover:text-ink-primary",
          )}
        >
          {equipped ? "Equipado" : "Equipar"}
        </button>
      ) : null}
    </div>
  )
}
