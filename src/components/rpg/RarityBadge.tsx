import { RARITY_CONFIG } from "@/lib/rarity"
import type { Rarity } from "@/lib/rarity"
import { cn } from "@/lib/utils"

interface RarityBadgeProps {
  rarity: Rarity
  className?: string
}

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity]
  const colorVar = `var(--color-${config.slug})`
  const isShimmer = Boolean(config.shimmer)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-display text-[10px] font-bold tracking-[0.18em] uppercase",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "clip-gem h-2.5 w-2.5 shrink-0",
          config.shimmer === "deus" ? "bg-shimmer-deus" : config.shimmer === "gold" ? "bg-shimmer-gold" : undefined,
        )}
        style={isShimmer ? undefined : { backgroundColor: colorVar }}
      />
      <span className={config.shimmer === "deus" ? "text-shimmer-deus" : undefined} style={config.shimmer === "deus" ? undefined : { color: colorVar }}>
        {config.label}
      </span>
    </span>
  )
}
