import { RANK_CONFIG } from "@/lib/rank"
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

export function RankBadge({ rank, size = "md", className }: RankBadgeProps) {
  const config = RANK_CONFIG[rank]
  const isUltimate = rank === "S++"
  const colorVar = `var(--color-${config.slug})`

  return (
    <div
      className={cn(
        "clip-hex flex shrink-0 items-center justify-center border font-display font-bold",
        SIZE_MAP[size],
        isUltimate ? "bg-shimmer-splus border-transparent text-void" : "border-surface-border-strong bg-surface-2",
        className,
      )}
      style={
        isUltimate
          ? undefined
          : {
              color: colorVar,
              boxShadow: `0 0 18px color-mix(in srgb, ${colorVar} 45%, transparent)`,
            }
      }
    >
      {rank}
    </div>
  )
}
