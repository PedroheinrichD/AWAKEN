import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BossEncounterIntro } from "@/components/cinematic/BossEncounterIntro"
import { RepCounter } from "@/components/combat/RepCounter"
import { CombatHUD } from "@/components/bosses/CombatHUD"
import { RarityBadge } from "@/components/rpg/RarityBadge"
import { Modal } from "@/components/system/Modal"
import { SystemPanel } from "@/components/system/SystemPanel"
import { trpc } from "@/lib/trpc"
import { useGameStore } from "@/store/useGameStore"

const EXERCISE_LABELS: Record<string, string> = {
  flexao: "Flexões",
  agachamento: "Agachamentos",
  abdominal: "Abdominais",
  burpee: "Burpees",
}

export function BossFightScreen() {
  const { bossId } = useParams()
  const navigate = useNavigate()
  const utils = trpc.useUtils()
  const pushOverlay = useGameStore((state) => state.pushOverlay)

  const [showingIntro, setShowingIntro] = useState(true)
  const [log, setLog] = useState<string[]>([])
  const [itemPickerOpen, setItemPickerOpen] = useState(false)
  const [outcome, setOutcome] = useState<{ result: "vitoria" | "derrota"; lootName?: string } | null>(null)

  const { data: boss } = trpc.bosses.getById.useQuery({ bossId: bossId ?? "" }, { enabled: Boolean(bossId) })
  const { data: character } = trpc.character.getActive.useQuery()
  const { data: activeBattle } = trpc.battle.active.useQuery()
  const { data: inventory } = trpc.items.inventory.useQuery()

  const startBattle = trpc.battle.start.useMutation({
    onSuccess: () => utils.battle.active.invalidate(),
  })

  const battle = activeBattle && activeBattle.bossId === bossId ? activeBattle : null

  const { data: pastTurns } = trpc.battle.turns.useQuery({ battleId: battle?.id ?? "" }, { enabled: Boolean(battle) })
  const { data: challenge } = trpc.battle.currentChallenge.useQuery(
    { battleId: battle?.id ?? "" },
    { enabled: Boolean(battle) && battle?.status === "EM_ANDAMENTO" },
  )

  useEffect(() => {
    if (pastTurns) setLog([...pastTurns].reverse())
  }, [pastTurns])

  useEffect(() => {
    if (!showingIntro && !activeBattle && bossId && !startBattle.isPending && !outcome) {
      startBattle.mutate({ bossId })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingIntro, activeBattle, bossId])

  const [lastTurnResult, setLastTurnResult] = useState<{ bossHp: number; turnNumber: number } | null>(null)

  const submitTurn = trpc.battle.submitTurn.useMutation({
    onSuccess: (result) => {
      setLog((prev) => [...result.turn.logLines, ...prev])
      setLastTurnResult({ bossHp: result.battle.bossHp, turnNumber: result.turn.turnNumber })
      utils.character.getActive.invalidate()
      utils.battle.active.invalidate()
      utils.items.inventory.invalidate()

      if (result.leveledUp) pushOverlay({ type: "levelUp", from: result.fromLevel, to: result.toLevel })
      if (result.awakenedSkill) pushOverlay({ type: "awakening", skill: result.awakenedSkill })

      if (result.battle.outcome !== "em_andamento") {
        setOutcome({ result: result.battle.outcome, lootName: result.loot?.name })
      }
    },
  })

  const useItem = trpc.battle.useItem.useMutation({
    onSuccess: (result) => {
      setLog((prev) => [`Você recuperou ${result.healed} de HP.`, ...prev])
      utils.character.getActive.invalidate()
      utils.items.inventory.invalidate()
      setItemPickerOpen(false)
    },
  })

  if (!boss || !character) {
    return (
      <SystemPanel accent="danger" className="p-8 text-center">
        <p className="font-display text-lg text-ink-primary">Carregando combate...</p>
      </SystemPanel>
    )
  }

  if (showingIntro) {
    return <BossEncounterIntro boss={boss} onComplete={() => setShowingIntro(false)} />
  }

  if (activeBattle && activeBattle.bossId !== bossId && activeBattle.status === "EM_ANDAMENTO") {
    return (
      <SystemPanel accent="danger" className="space-y-4 p-8 text-center">
        <p className="font-display text-lg text-ink-primary">Você já tem um combate em andamento.</p>
        <button
          type="button"
          onClick={() => navigate(`/bosses/${activeBattle.bossId}`)}
          className="border border-danger px-5 py-2 font-display text-xs font-semibold tracking-widest text-danger uppercase"
        >
          Retomar combate
        </button>
      </SystemPanel>
    )
  }

  const potions = (inventory ?? []).filter((item) => item.category === "pocao" && (item.quantity ?? 0) > 0)
  const bossHpDisplay = battle?.bossHp ?? lastTurnResult?.bossHp ?? boss.hp
  const turnDisplay = battle?.currentTurn ?? lastTurnResult?.turnNumber ?? 1

  return (
    <div className="space-y-6">
      {battle || lastTurnResult ? (
        <CombatHUD
          boss={boss}
          bossHp={bossHpDisplay}
          playerName={character.name}
          playerHp={character.hp}
          playerHpMax={character.hpMax}
          turn={turnDisplay}
          challengeTitle={challenge ? `${challenge.target} ${EXERCISE_LABELS[challenge.exerciseId] ?? challenge.exerciseId}` : "Aguardando..."}
          log={log}
        >
          {outcome ? (
            <p className="text-sm text-ink-tertiary">Combate encerrado.</p>
          ) : challenge && battle ? (
            <div className="space-y-4">
              {challenge.itemsSealed ? (
                <p className="font-mono text-xs text-danger uppercase">Selo Arcano ativo: itens bloqueados neste turno.</p>
              ) : (
                <button
                  type="button"
                  onClick={() => setItemPickerOpen(true)}
                  disabled={potions.length === 0}
                  className="font-mono text-xs text-system underline-offset-2 hover:underline disabled:text-ink-disabled disabled:no-underline"
                >
                  Usar poção
                </button>
              )}
              <RepCounter
                key={battle.currentTurn}
                exerciseId={challenge.exerciseId}
                target={challenge.target}
                timeLimitSeconds={challenge.timeLimitSeconds}
                disabled={submitTurn.isPending}
                onSubmit={(reps, timeRemaining) =>
                  submitTurn.mutate({ battleId: battle.id, repsCompleted: reps, timeRemainingSeconds: timeRemaining })
                }
              />
            </div>
          ) : (
            <p className="text-sm text-ink-tertiary">Preparando desafio...</p>
          )}
        </CombatHUD>
      ) : null}

      {outcome ? (
        <SystemPanel accent={outcome.result === "vitoria" ? "system" : "danger"} className="p-6 text-center">
          <p className={outcome.result === "vitoria" ? "font-display text-3xl font-bold text-system" : "font-display text-3xl font-bold text-danger"}>
            {outcome.result === "vitoria" ? "VITÓRIA" : "DERROTA"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
            {outcome.result === "vitoria"
              ? `${boss.name} foi subjugado.`
              : "O HP chegou a zero. Esta jornada chegou ao fim."}
          </p>
          {outcome.lootName ? (
            <p className="mt-4 font-mono text-xs text-gold">Recompensa: {outcome.lootName}</p>
          ) : null}
          <button
            type="button"
            onClick={() => navigate("/bosses")}
            className="mt-6 border border-surface-border-strong px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-ink-secondary uppercase transition-colors hover:text-ink-primary"
          >
            Voltar para Bosses
          </button>
        </SystemPanel>
      ) : null}

      <Modal open={itemPickerOpen} onClose={() => setItemPickerOpen(false)}>
        <SystemPanel label="Usar Poção" className="space-y-2 p-5">
          {potions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => battle && useItem.mutate({ battleId: battle.id, itemId: item.id })}
              className="flex w-full items-center justify-between border border-surface-border-strong px-3 py-2.5 text-left hover:border-system"
            >
              <span className="text-sm text-ink-primary">{item.name}</span>
              <span className="flex items-center gap-2">
                <RarityBadge rarity={item.rarity} />
                <span className="font-mono text-xs text-ink-tertiary">x{item.quantity}</span>
              </span>
            </button>
          ))}
        </SystemPanel>
      </Modal>
    </div>
  )
}
