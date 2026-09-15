import type { Item } from "@/data/types"
import { ATTRIBUTE_LABELS } from "@/lib/attributes"
import { ICON_MAP } from "@/lib/icons"
import { RARITY_CONFIG } from "@/lib/rarity"
import { cn } from "@/lib/utils"
import { RarityBadge } from "./RarityBadge"

interface ItemCardProps {
  item: Item
  locked?: boolean
  equipped?: boolean
  onClick?: () => void
}

export function ItemCard({ item, locked = false, equipped = false, onClick }: ItemCardProps) {
  const Icon = ICON_MAP[item.icon]
  const colorVar = `var(--color-${RARITY_CONFIG[item.rarity].slug})`
  const interactive = Boolean(onClick) && !locked

  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      className={cn(
        "relative flex h-full flex-col gap-3 border border-surface-border bg-surface-1 p-4 text-left transition-colors",
        interactive && "cursor-pointer hover:border-surface-border-strong",
        !interactive && "cursor-default",
        locked && "opacity-55",
      )}
    >
      {equipped ? (
        <span className="absolute top-3 right-3 font-display text-[9px] font-semibold tracking-[0.15em] text-system uppercase">
          Equipado
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center border"
          style={{ borderColor: colorVar, boxShadow: `0 0 14px color-mix(in srgb, ${colorVar} 30%, transparent)` }}
        >
          <Icon size={22} weight="regular" style={{ color: colorVar }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-ink-primary">{item.name}</p>
          <RarityBadge rarity={item.rarity} />
        </div>
        {item.quantity !== undefined ? (
          <span className="shrink-0 font-mono text-xs text-ink-tertiary">x{item.quantity}</span>
        ) : null}
      </div>

      <p className="flex-1 text-xs leading-relaxed text-ink-secondary">{item.description}</p>

      {item.passive ? <p className="text-[11px] text-system">{item.passive}</p> : null}

      {item.requirements ? (
        <div className="space-y-0.5 border-t border-surface-border pt-2 font-mono text-[11px] text-ink-tertiary">
          {item.requirements.level ? (
            <p>
              Nível mínimo: <span className={locked ? "text-danger" : "text-ink-secondary"}>{item.requirements.level}</span>
            </p>
          ) : null}
          {item.requirements.rank ? (
            <p>
              Rank mínimo: <span className={locked ? "text-danger" : "text-ink-secondary"}>{item.requirements.rank}</span>
            </p>
          ) : null}
          {item.requirements.attributes
            ? Object.entries(item.requirements.attributes).map(([key, min]) => (
                <p key={key}>
                  {ATTRIBUTE_LABELS[key as keyof typeof ATTRIBUTE_LABELS]} mínima:{" "}
                  <span className={locked ? "text-danger" : "text-ink-secondary"}>{min}</span>
                </p>
              ))
            : null}
        </div>
      ) : null}

      {locked ? (
        <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-danger uppercase">
          Requisitos não atendidos
        </p>
      ) : null}
    </button>
  )
}
