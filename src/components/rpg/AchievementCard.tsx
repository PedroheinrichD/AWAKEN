import type { Achievement } from "@/data/types"
import { ICON_MAP } from "@/lib/icons"

interface AchievementCardProps {
  achievement: Achievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = ICON_MAP[achievement.icon]

  return (
    <div className="flex items-start gap-3 border border-surface-border bg-surface-1 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/40 bg-surface-2">
        <Icon size={22} weight="fill" className="text-gold" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-ink-primary">{achievement.name}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{achievement.description}</p>
        <p className="mt-2 font-mono text-[10px] text-ink-tertiary">{achievement.unlockedAt}</p>
      </div>
    </div>
  )
}
