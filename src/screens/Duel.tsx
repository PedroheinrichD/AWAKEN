import { useState } from "react"
import { RepCounter } from "@/components/combat/RepCounter"
import { HPBar } from "@/components/hud/HPBar"
import { RankBadge } from "@/components/hud/RankBadge"
import { EmptyState } from "@/components/system/EmptyState"
import { SystemPanel } from "@/components/system/SystemPanel"
import { trpc } from "@/lib/trpc"

const EXERCISE_OPTIONS: { id: string; label: string }[] = [
  { id: "flexao", label: "Flexões" },
  { id: "agachamento", label: "Agachamentos" },
  { id: "abdominal", label: "Abdominais" },
]

const ROUND_SECONDS = 45

export function DuelScreen() {
  const utils = trpc.useUtils()
  const { data: character } = trpc.character.getActive.useQuery()
  const { data: opponent } = trpc.duel.opponent.useQuery()
  const { data: pending } = trpc.duel.pending.useQuery()
  const { data: history } = trpc.duel.history.useQuery()
  const { data: stats } = trpc.stats.get.useQuery()

  const [pickerOpen, setPickerOpen] = useState(false)

  const invalidateDuels = () => {
    utils.duel.pending.invalidate()
    utils.duel.history.invalidate()
    utils.stats.get.invalidate()
  }

  const challenge = trpc.duel.challenge.useMutation({ onSuccess: () => { invalidateDuels(); setPickerOpen(false) } })
  const respond = trpc.duel.respond.useMutation({ onSuccess: invalidateDuels })
  const submitResult = trpc.duel.submitResult.useMutation({ onSuccess: invalidateDuels })

  if (!character) return null

  const acceptedDuel = [...(pending?.incoming ?? []), ...(pending?.outgoing ?? [])].find((duel) => duel.status === "ACEITO")
  const isChallengerInAccepted = acceptedDuel?.challengerId === character.id
  const myScoreSubmitted = acceptedDuel
    ? isChallengerInAccepted
      ? acceptedDuel.challengerScore !== null
      : acceptedDuel.opponentScore !== null
    : false

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-danger uppercase">Combate Direto</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">X1</h1>
        <p className="mt-2 max-w-lg text-sm text-ink-secondary">
          Desafios diretos entre caçadores, mesmo em cidades diferentes. Nenhuma derrota aqui é permanente.
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <SystemPanel accent="system" className="p-5">
          <p className="font-display text-[10px] font-bold tracking-[0.2em] text-system uppercase">Você</p>
          <div className="mt-2 flex items-center gap-3">
            <RankBadge rank={character.rank} size="sm" />
            <p className="font-display text-lg font-bold text-ink-primary">{character.name}</p>
          </div>
          <div className="mt-3">
            <HPBar current={character.hp} max={character.hpMax} compact />
          </div>
        </SystemPanel>

        <p className="hidden text-center font-display text-2xl font-black text-ink-tertiary lg:block">VS</p>

        <SystemPanel accent="danger" className="p-5">
          <p className="font-display text-[10px] font-bold tracking-[0.2em] text-danger uppercase">Oponente</p>
          {opponent ? (
            <>
              <div className="mt-2 flex items-center gap-3">
                <RankBadge rank={opponent.rank} size="sm" />
                <p className="font-display text-lg font-bold text-ink-primary">{opponent.name}</p>
              </div>
              <div className="mt-3">
                <HPBar current={opponent.hp} max={opponent.hpMax} compact />
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-ink-tertiary">Nenhum oponente encontrou personagem ainda.</p>
          )}
        </SystemPanel>
      </div>

      {acceptedDuel ? (
        <SystemPanel accent="system" label="Desafio em Andamento" className="p-5">
          {myScoreSubmitted ? (
            <p className="text-center text-sm text-ink-tertiary">Resultado enviado. Aguardando o oponente registrar o dele.</p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="font-display text-lg text-ink-primary">
                {EXERCISE_OPTIONS.find((option) => option.id === acceptedDuel.exerciseId)?.label ?? acceptedDuel.exerciseId}
              </p>
              <RepCounter
                target={999}
                showTarget={false}
                timeLimitSeconds={acceptedDuel.targetSeconds}
                disabled={submitResult.isPending}
                onSubmit={(reps) => submitResult.mutate({ duelId: acceptedDuel.id, score: reps })}
              />
            </div>
          )}
        </SystemPanel>
      ) : opponent ? (
        <SystemPanel label="Novo Desafio" className="p-5">
          {pickerOpen ? (
            <div className="flex flex-wrap gap-2">
              {EXERCISE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={challenge.isPending}
                  onClick={() => challenge.mutate({ exerciseId: option.id, targetSeconds: ROUND_SECONDS })}
                  className="border border-danger px-4 py-2 font-display text-xs font-semibold tracking-wide text-danger uppercase transition-colors hover:bg-danger/10"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="border border-danger bg-danger/10 px-6 py-3 font-display text-sm font-bold tracking-[0.2em] text-danger uppercase transition-colors hover:bg-danger/20"
            >
              Desafiar {opponent.name}
            </button>
          )}
        </SystemPanel>
      ) : null}

      {(pending?.incoming.length ?? 0) > 0 ? (
        <SystemPanel accent="gold" label="Desafios Recebidos" className="space-y-2 p-5">
          {pending?.incoming.map((duel) => (
            <div key={duel.id} className="flex items-center justify-between border border-surface-border px-3 py-2.5">
              <span className="text-sm text-ink-primary">
                {EXERCISE_OPTIONS.find((option) => option.id === duel.exerciseId)?.label ?? duel.exerciseId}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => respond.mutate({ duelId: duel.id, accept: true })}
                  className="border border-system px-3 py-1.5 font-display text-[10px] font-semibold tracking-wide text-system uppercase"
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  onClick={() => respond.mutate({ duelId: duel.id, accept: false })}
                  className="border border-surface-border-strong px-3 py-1.5 font-display text-[10px] font-semibold tracking-wide text-ink-tertiary uppercase"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </SystemPanel>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SystemPanel label="Placar Geral" className="p-5">
          <div className="flex justify-around text-center">
            <div>
              <p className="font-display text-3xl font-bold text-system">{stats?.vitoriasX1 ?? 0}</p>
              <p className="text-xs text-ink-tertiary">Vitórias</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-danger">{stats?.derrotasX1 ?? 0}</p>
              <p className="text-xs text-ink-tertiary">Derrotas</p>
            </div>
          </div>
        </SystemPanel>

        <SystemPanel label="Histórico Recente" className="max-h-56 overflow-y-auto p-5">
          {!history || history.length === 0 ? (
            <EmptyState title="Sem histórico" message="Nenhum X1 concluído ainda." />
          ) : (
            <div className="space-y-2">
              {history.map((match) => (
                <div key={match.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-ink-primary">{match.challenge}</p>
                    <p className="text-ink-tertiary">{new Date(match.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className={match.result === "vitoria" ? "font-semibold text-system uppercase" : "font-semibold text-danger uppercase"}>
                      {match.result === "vitoria" ? "Vitória" : "Derrota"}
                    </p>
                    <p className="font-mono text-ink-tertiary">{match.score}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SystemPanel>
      </div>
    </div>
  )
}
