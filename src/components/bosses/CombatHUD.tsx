import { Flask, Hourglass, Lightning, Target } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { HPBar } from "@/components/hud/HPBar"
import { RankBadge } from "@/components/hud/RankBadge"
import { SystemPanel } from "@/components/system/SystemPanel"
import type { Boss } from "@/data/types"
import { BossSigil } from "./BossSigil"

interface CombatHUDProps {
  boss: Boss
  bossHp: number
  playerName: string
  playerHp: number
  playerHpMax: number
  turn: number
  challenge: string
  timeLabel: string
  log: string[]
  resolving: boolean
  finished: boolean
  onComplete: () => void
  onUseSkill: () => void
  onUseItem: () => void
}

export function CombatHUD({
  boss,
  bossHp,
  playerName,
  playerHp,
  playerHpMax,
  turn,
  challenge,
  timeLabel,
  log,
  resolving,
  finished,
  onComplete,
  onUseSkill,
  onUseItem,
}: CombatHUDProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <SystemPanel accent="danger" className="p-5">
          <div className="flex items-center gap-4">
            <BossSigil boss={boss} size={64} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <RankBadge rank={boss.rank} size="sm" />
                <p className="truncate font-display text-lg font-bold text-ink-primary">{boss.name}</p>
              </div>
              <div className="mt-2">
                <HPBar current={bossHp} max={boss.hp} />
              </div>
            </div>
          </div>
        </SystemPanel>

        <motion.div
          key={turn}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <SystemPanel accent="system" className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-xs font-bold tracking-[0.24em] text-system uppercase">
                Turno {String(turn).padStart(2, "0")}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-ink-secondary">
                <Hourglass size={14} />
                {timeLabel}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-ink-primary sm:text-3xl">{challenge}</p>
          </SystemPanel>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onComplete}
            disabled={resolving || finished}
            className="flex items-center gap-2 border border-system bg-system/10 px-5 py-3 font-display text-sm font-semibold tracking-wide text-system uppercase transition-colors hover:bg-system/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Target size={16} weight="bold" />
            {resolving ? "Resolvendo..." : "Completar Desafio"}
          </button>
          <button
            type="button"
            onClick={onUseSkill}
            disabled={resolving || finished}
            className="flex items-center gap-2 border border-surface-border-strong bg-surface-1 px-5 py-3 font-display text-sm font-semibold tracking-wide text-ink-secondary uppercase transition-colors hover:text-ink-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Lightning size={16} />
            Habilidade
          </button>
          <button
            type="button"
            onClick={onUseItem}
            disabled={resolving || finished}
            className="flex items-center gap-2 border border-surface-border-strong bg-surface-1 px-5 py-3 font-display text-sm font-semibold tracking-wide text-ink-secondary uppercase transition-colors hover:text-ink-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Flask size={16} />
            Item
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SystemPanel accent="danger" label="Status do Caçador" className="p-4">
          <p className="mb-2 font-display text-sm font-semibold text-ink-primary">{playerName}</p>
          <HPBar current={playerHp} max={playerHpMax} />
        </SystemPanel>

        <SystemPanel label="Registro de Combate" className="flex max-h-72 flex-col p-4">
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {log.length === 0 ? (
              <p className="text-xs text-ink-tertiary">Nenhum evento registrado ainda.</p>
            ) : (
              log.map((entry, index) => (
                <p key={index} className="border-l border-surface-border-strong pl-2 text-xs text-ink-secondary">
                  {entry}
                </p>
              ))
            )}
          </div>
        </SystemPanel>
      </div>
    </div>
  )
}
