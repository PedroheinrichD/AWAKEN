import type { Boss } from "@/data/types"
import { RANK_CONFIG, RANK_EFFECTS } from "@/lib/rank"
import { cn } from "@/lib/utils"

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

interface BossSigilProps {
  boss: Boss
  size?: number
}

export function BossSigil({ boss, size = 72 }: BossSigilProps) {
  const config = RANK_CONFIG[boss.rank]
  const effect = RANK_EFFECTS[boss.rank]
  const colorVar = `var(--color-${config.slug})`
  const sides = 5 + config.weight
  const rotationOffsetRad = ((hashString(boss.id) % 360) * Math.PI) / 180

  const points = Array.from({ length: sides }, (_, i) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2 + rotationOffsetRad
    const r = size / 2 - 4
    const x = size / 2 + r * Math.cos(angle)
    const y = size / 2 + r * Math.sin(angle)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("animate-[spin_22s_linear_infinite]", effect.pulse && "animate-pulse-slow")}
      >
        <polygon points={points} fill={colorVar} fillOpacity={0.14} stroke={colorVar} strokeWidth={1.4} />
      </svg>
      <div
        className="absolute h-2 w-2 rounded-full"
        style={{
          backgroundColor: colorVar,
          boxShadow: `0 0 ${Math.max(16, effect.glowPx)}px ${colorVar}`,
        }}
      />
    </div>
  )
}
