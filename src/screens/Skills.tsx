import { Sparkle } from "@phosphor-icons/react"
import { SkillCard } from "@/components/rpg/SkillCard"
import { EmptyState } from "@/components/system/EmptyState"
import { trpc } from "@/lib/trpc"

export function SkillsScreen() {
  const { data: skills } = trpc.skills.discovered.useQuery()

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Poder Interior</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Habilidades</h1>
      </div>

      {!skills || skills.length === 0 ? (
        <EmptyState
          icon={Sparkle}
          title="Nenhuma Habilidade Despertada"
          message="Habilidades surgem através de condições específicas cumpridas na jornada. Elas não podem ser previstas."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  )
}
