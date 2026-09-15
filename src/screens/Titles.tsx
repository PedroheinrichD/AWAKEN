import { TitleCard } from "@/components/rpg/TitleCard"
import { TITLES } from "@/data/titles"
import { useGameStore } from "@/store/useGameStore"

export function TitlesScreen() {
  const equippedTitle = useGameStore((state) => state.character.equippedTitle)
  const equipTitle = useGameStore((state) => state.equipTitle)

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Reconhecimento</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Títulos</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TITLES.map((title) => (
          <TitleCard
            key={title.id}
            title={title}
            equipped={equippedTitle === title.id}
            onEquip={() => equipTitle(title.id)}
          />
        ))}
      </div>
    </div>
  )
}
