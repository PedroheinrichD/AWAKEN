import { RANK_CONFIG, RANK_EFFECTS } from "@/lib/rank"
import type { Rank } from "@/lib/rank"
import { cn } from "@/lib/utils"

interface RankBadgeProps {
  rank: Rank
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE_MAP: Record<NonNullable<RankBadgeProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-lg",
  lg: "h-20 w-20 text-3xl",
}

/** Rank badge whose glow/pulse/ring/shimmer scale with rank difficulty — see
 * lib/rank.ts's RANK_EFFECTS for the exact ramp (E plain, S++ full shimmer). */
export function RankBadge({ rank, size = "md", className }: RankBadgeProps) {
  const config = RANK_CONFIG[rank]
  const effect = RANK_EFFECTS[rank]
  const colorVar = `var(--color-${config.slug})`

  return (
    <div className={cn("relative flex shrink-0 items-center justify-center", SIZE_MAP[size], className)}>
      {effect.ring ? (
        <span
          aria-hidden
          className="clip-hex absolute inset-[-18%] animate-[spin_22s_linear_infinite] border"
          style={{ borderColor: colorVar, opacity: 0.55 }}
        />
      ) : null}
      <div
        className={cn(
          "clip-hex flex h-full w-full items-center justify-center border font-display font-bold",
          effect.pulse && "animate-pulse-slow",
          effect.shimmer ? "bg-shimmer-splus border-transparent text-void" : "border-surface-border-strong bg-surface-2",
        )}
        style={
          effect.shimmer
            ? undefined
            : {
                color: colorVar,
                boxShadow: effect.glowPx > 0 ? `0 0 ${effect.glowPx}px color-mix(in srgb, ${colorVar} 45%, transparent)` : undefined,
              }
        }
      >
        {rank}
      </div>
    </div>
  )
}
