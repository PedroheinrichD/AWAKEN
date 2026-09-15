import { motion } from "motion/react"
import type { ReactNode } from "react"
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
  challengeTitle: string
  log: string[]
  children: ReactNode
}

export function CombatHUD({ boss, bossHp, playerName, playerHp, playerHpMax, turn, challengeTitle, log, children }: CombatHUDProps) {
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
            </div>
            <p className="mb-5 font-display text-2xl font-bold text-ink-primary sm:text-3xl">{challengeTitle}</p>
            {children}
          </SystemPanel>
        </motion.div>
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
