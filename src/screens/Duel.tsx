import { Camera, CheckCircle, Plus } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { HPBar } from "@/components/hud/HPBar"
import { RankBadge } from "@/components/hud/RankBadge"
import { SystemPanel } from "@/components/system/SystemPanel"
import { DUEL_HISTORY, OPPONENT } from "@/data/duel"
import { JOURNEY_STATS } from "@/data/stats"
import { cn } from "@/lib/utils"
import { useGameStore } from "@/store/useGameStore"

const ROUND_SECONDS = 45

export function DuelScreen() {
  const character = useGameStore((state) => state.character)

  const [cameraValidated, setCameraValidated] = useState(false)
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(ROUND_SECONDS)
  const [myScore, setMyScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)

  useEffect(() => {
    if (!running) return
    if (seconds <= 0) {
      setRunning(false)
      return
    }
    const timeout = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timeout)
  }, [running, seconds])

  function startRound() {
    setSeconds(ROUND_SECONDS)
    setMyScore(0)
    setOpponentScore(0)
    setRunning(true)
  }

  const roundOver = !running && seconds === 0
  const roundIdle = !running && seconds === ROUND_SECONDS

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-danger uppercase">Combate Direto</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">X1</h1>
        <p className="mt-2 max-w-lg text-sm text-ink-secondary">
          Desafios diretos entre caçadores. Nenhuma derrota aqui é permanente.
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
          <p className="mt-4 font-display text-4xl font-black text-ink-primary">{myScore}</p>
        </SystemPanel>

        <p className="hidden text-center font-display text-2xl font-black text-ink-tertiary lg:block">VS</p>

        <SystemPanel accent="danger" className="p-5">
          <p className="font-display text-[10px] font-bold tracking-[0.2em] text-danger uppercase">Oponente</p>
          <div className="mt-2 flex items-center gap-3">
            <RankBadge rank={OPPONENT.rank} size="sm" />
            <p className="font-display text-lg font-bold text-ink-primary">{OPPONENT.name}</p>
          </div>
          <div className="mt-3">
            <HPBar current={OPPONENT.hp} max={OPPONENT.hpMax} compact />
          </div>
          <p className="mt-4 font-display text-4xl font-black text-ink-primary">{opponentScore}</p>
        </SystemPanel>
      </div>

      <SystemPanel label="Rodada: Flexões em 45 segundos" className="p-5">
        <div className="flex flex-col items-center gap-4">
          <p className="font-mono text-5xl font-bold text-ink-primary">00:{String(seconds).padStart(2, "0")}</p>

          <button
            type="button"
            onClick={() => setCameraValidated((value) => !value)}
            className={cn(
              "flex items-center gap-2 border px-4 py-2 font-display text-xs font-semibold tracking-wide uppercase transition-colors",
              cameraValidated ? "border-system text-system" : "border-surface-border-strong text-ink-tertiary",
            )}
          >
            {cameraValidated ? <CheckCircle size={16} weight="fill" /> : <Camera size={16} />}
            {cameraValidated ? "Validado por câmera" : "Aguardando validação"}
          </button>

          {roundIdle ? (
            <button
              type="button"
              onClick={startRound}
              className="border border-danger bg-danger/10 px-6 py-3 font-display text-sm font-bold tracking-[0.2em] text-danger uppercase transition-colors hover:bg-danger/20"
            >
              Iniciar Rodada
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                type="button"
                disabled={!running}
                onClick={() => setMyScore((value) => value + 1)}
                className="flex items-center gap-2 border border-system bg-system/10 px-5 py-2.5 font-display text-sm font-semibold text-system uppercase disabled:opacity-40"
              >
                <Plus size={16} /> Você
              </button>
              <button
                type="button"
                disabled={!running}
                onClick={() => setOpponentScore((value) => value + 1)}
                className="flex items-center gap-2 border border-danger bg-danger/10 px-5 py-2.5 font-display text-sm font-semibold text-danger uppercase disabled:opacity-40"
              >
                <Plus size={16} /> {OPPONENT.name}
              </button>
            </div>
          )}

          {roundOver ? (
            <p className="font-display text-sm font-bold tracking-wide text-gold uppercase">
              {myScore === opponentScore ? "Empate" : myScore > opponentScore ? "Você venceu a rodada" : `${OPPONENT.name} venceu a rodada`}
            </p>
          ) : null}
        </div>
      </SystemPanel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SystemPanel label="Placar Geral" className="p-5">
          <div className="flex justify-around text-center">
            <div>
              <p className="font-display text-3xl font-bold text-system">{JOURNEY_STATS.vitoriasX1}</p>
              <p className="text-xs text-ink-tertiary">Vitórias</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-danger">{JOURNEY_STATS.derrotasX1}</p>
              <p className="text-xs text-ink-tertiary">Derrotas</p>
            </div>
          </div>
        </SystemPanel>

        <SystemPanel label="Histórico Recente" className="max-h-56 overflow-y-auto p-5">
          <div className="space-y-2">
            {DUEL_HISTORY.map((match) => (
              <div key={match.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-ink-primary">{match.challenge}</p>
                  <p className="text-ink-tertiary">{match.date}</p>
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
        </SystemPanel>
      </div>
    </div>
  )
}
