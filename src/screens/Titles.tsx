import { Medal } from "@phosphor-icons/react"
import { TitleCard } from "@/components/rpg/TitleCard"
import { EmptyState } from "@/components/system/EmptyState"
import { trpc } from "@/lib/trpc"

export function TitlesScreen() {
  const utils = trpc.useUtils()
  const { data: titles } = trpc.titles.unlocked.useQuery()
  const equipTitle = trpc.character.equipTitle.useMutation({
    onSuccess: () => {
      utils.titles.unlocked.invalidate()
      utils.character.getActive.invalidate()
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Reconhecimento</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Títulos</h1>
      </div>

      {!titles || titles.length === 0 ? (
        <EmptyState icon={Medal} title="Nenhum Título Conquistado" message="Títulos são concedidos por feitos registrados na jornada." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {titles.map((title) => (
            <TitleCard
              key={title.id}
              title={title}
              equipped={title.equipped}
              onEquip={() => equipTitle.mutate({ titleId: title.id })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
