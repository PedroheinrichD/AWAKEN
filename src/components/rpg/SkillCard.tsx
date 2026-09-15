import type { Skill } from "@/data/types"
import { ICON_MAP } from "@/lib/icons"

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  const Icon = ICON_MAP[skill.icon]

  return (
    <div className="flex flex-col gap-3 border border-system/30 bg-surface-1 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-system/40 bg-surface-2">
          <Icon size={22} weight="regular" className="text-system" />
        </div>
        <p className="font-display text-sm font-semibold text-ink-primary">{skill.name}</p>
      </div>

      <p className="text-xs leading-relaxed text-ink-secondary italic">{skill.description}</p>
      <p className="text-xs leading-relaxed text-ink-primary">{skill.effect}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-surface-border pt-2 font-mono text-[11px] text-ink-tertiary">
        <span>
          Custo: <span className="text-ink-secondary">{skill.cost}</span>
        </span>
        <span>
          Cooldown: <span className="text-ink-secondary">{skill.cooldown}</span>
        </span>
        {skill.duration ? (
          <span>
            Duração: <span className="text-ink-secondary">{skill.duration}</span>
          </span>
        ) : null}
      </div>

      <p className="text-[10px] tracking-[0.1em] text-gold uppercase">{skill.awakenedCondition}</p>
    </div>
  )
}
