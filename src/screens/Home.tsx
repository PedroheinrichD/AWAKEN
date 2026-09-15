import { ClipboardText, Flame, Skull } from "@phosphor-icons/react"
import { CharacterCanvas } from "@/components/character/CharacterCanvas"
import { AttributePanel } from "@/components/hud/AttributePanel"
import { HPBar } from "@/components/hud/HPBar"
import { LevelBadge } from "@/components/hud/LevelBadge"
import { RankBadge } from "@/components/hud/RankBadge"
import { StatusStrip } from "@/components/hud/StatusStrip"
import { XPBar } from "@/components/hud/XPBar"
import { EventCard } from "@/components/events/EventCard"
import { EmptyState } from "@/components/system/EmptyState"
import { SystemNotification } from "@/components/system/SystemNotification"
import { SystemPanel } from "@/components/system/SystemPanel"
import { getTodaysBoss } from "@/data/bosses"
import { EVENTS } from "@/data/events"
import { MISSIONS } from "@/data/missions"
import { JOURNEY_STATS } from "@/data/stats"
import { TITLES } from "@/data/titles"
import { useGameStore } from "@/store/useGameStore"

export function HomeScreen() {
  const character = useGameStore((state) => state.character)
  const equippedTitle = TITLES.find((title) => title.id === character.equippedTitle)
  const activeEvents = EVENTS.filter((event) => event.active)
  const todaysBoss = getTodaysBoss()
  const dailyMissions = MISSIONS.filter((mission) => mission.type === "diaria")
  const completedToday = dailyMissions.filter((mission) => mission.completed).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]">
        <SystemPanel accent="system" className="flex flex-col items-center p-6 text-center">
          <CharacterCanvas appearance={character.appearance} equipment={character.equipment} className="h-72 w-full" />
          <p className="mt-2 font-display text-2xl font-bold text-ink-primary">{character.name}</p>
          <p className="text-sm text-system">{equippedTitle ? equippedTitle.name : "Sem título equipado"}</p>
          <div className="mt-4 flex items-center gap-4">
            <RankBadge rank={character.rank} />
            <LevelBadge level={character.level} />
          </div>
        </SystemPanel>

        <div className="space-y-6">
          <SystemPanel label="Vitalidade" className="space-y-4 p-5">
            <HPBar current={character.hp} max={character.hpMax} />
            <XPBar current={character.xp} max={character.xpToNext} />
          </SystemPanel>

          <SystemPanel label="Atributos" className="p-5">
            <AttributePanel attributes={character.attributes} />
          </SystemPanel>

          <SystemPanel label="Status" className="p-5">
            <StatusStrip
              chips={[
                { icon: Flame, label: "Streak", value: `${character.streak} dias`, tone: "gold" },
                { icon: Skull, label: "Bosses Derrotados", value: String(JOURNEY_STATS.bossesDerrotados) },
                {
                  icon: ClipboardText,
                  label: "Missões Hoje",
                  value: `${completedToday}/${dailyMissions.length}`,
                },
              ]}
            />
          </SystemPanel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SystemPanel label="Notificações do Sistema" className="p-5">
          <div className="divide-y divide-surface-border/60">
            <SystemNotification
              icon="skull"
              title="Boss detectado"
              message={`${todaysBoss.name} foi localizado nas proximidades.`}
              tone="danger"
              meta={todaysBoss.rank}
            />
            <SystemNotification
              icon="flame"
              title="Sequência mantida"
              message={`${character.streak} dias consecutivos de atividade registrada.`}
              tone="gold"
            />
            <SystemNotification
              icon="scroll"
              title="Missão concluída"
              message="Corrida de 3km registrada com sucesso."
              tone="system"
            />
          </div>
        </SystemPanel>

        <SystemPanel label="Eventos Ativos" className="p-5">
          {activeEvents.length === 0 ? (
            <EmptyState title="Nenhum evento ativo" message="O Sistema não detectou nenhuma anomalia no momento." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </SystemPanel>
      </div>
    </div>
  )
}
