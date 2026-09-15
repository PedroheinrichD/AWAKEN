import { AchievementCard } from "@/components/rpg/AchievementCard"
import { ACHIEVEMENTS } from "@/data/achievements"

export function AchievementsScreen() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Feitos Registrados</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Conquistas</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  )
}
