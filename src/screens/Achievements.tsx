import { Trophy } from "@phosphor-icons/react"
import { AchievementCard } from "@/components/rpg/AchievementCard"
import { EmptyState } from "@/components/system/EmptyState"
import { trpc } from "@/lib/trpc"

export function AchievementsScreen() {
  const { data: achievements } = trpc.achievements.unlocked.useQuery()

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Feitos Registrados</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Conquistas</h1>
      </div>

      {!achievements || achievements.length === 0 ? (
        <EmptyState icon={Trophy} title="Nenhuma Conquista" message="Feitos notáveis na jornada aparecem aqui assim que forem registrados." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  )
}
