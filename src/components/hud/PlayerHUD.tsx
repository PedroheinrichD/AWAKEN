import { Flame } from "@phosphor-icons/react"
import { trpc } from "@/lib/trpc"
import { HPBar } from "./HPBar"
import { LevelBadge } from "./LevelBadge"
import { RankBadge } from "./RankBadge"
import { XPBar } from "./XPBar"

export function PlayerHUD() {
  const { data: character } = trpc.character.getActive.useQuery()
  const { data: titles } = trpc.titles.unlocked.useQuery()
  const equippedTitle = titles?.find((title) => title.equipped)

  if (!character) return null

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-surface-border bg-surface-0/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <RankBadge rank={character.rank} size="sm" />
        <LevelBadge level={character.level} />
      </div>

      <div className="min-w-[120px]">
        <p className="font-display text-sm leading-tight font-semibold text-ink-primary">{character.name}</p>
        <p className="truncate text-[11px] leading-tight text-system">{equippedTitle ? equippedTitle.name : "Sem título"}</p>
      </div>

      <div className="hidden items-center gap-1.5 text-xs text-gold sm:flex">
        <Flame size={14} weight="fill" />
        <span className="font-mono">{character.streak}</span>
      </div>

      <div className="min-w-[140px] flex-1 max-w-[220px]">
        <HPBar current={character.hp} max={character.hpMax} compact />
      </div>
      <div className="min-w-[140px] flex-1 max-w-[220px]">
        <XPBar current={character.xp} max={character.xpToNext} compact />
      </div>
    </div>
  )
}
