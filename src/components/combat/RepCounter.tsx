import { Minus, Plus } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface RepCounterProps {
  target: number
  timeLimitSeconds: number
  disabled?: boolean
  showTarget?: boolean
  onSubmit: (repsCompleted: number, timeRemainingSeconds: number) => void
}

/**
 * Manual tap-to-count input, standing in for camera-based rep detection
 * (claude.md §20 / prompt §20 explicitly allow deferring the real computer-vision
 * validation). The rules engine only ever sees {repsCompleted, timeRemainingSeconds},
 * so swapping this for a camera feed later doesn't touch any battle/duel logic.
 */
export function RepCounter({ target, timeLimitSeconds, disabled, showTarget = true, onSubmit }: RepCounterProps) {
  const [reps, setReps] = useState(0)
  const [seconds, setSeconds] = useState(timeLimitSeconds)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setReps(0)
    setSeconds(timeLimitSeconds)
    setSubmitted(false)
  }, [timeLimitSeconds, target])

  useEffect(() => {
    if (disabled || submitted || seconds <= 0) return
    const interval = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(interval)
  }, [disabled, submitted, seconds])

  useEffect(() => {
    if (seconds === 0 && !submitted && !disabled) {
      setSubmitted(true)
      onSubmit(reps, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds])

  function handleSubmit() {
    if (submitted || disabled) return
    setSubmitted(true)
    onSubmit(reps, seconds)
  }

  const pct = Math.min(100, (reps / Math.max(1, target)) * 100)

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-mono text-4xl font-bold text-ink-primary">00:{String(seconds).padStart(2, "0")}</p>

      <div className="flex items-center gap-6">
        <button
          type="button"
          disabled={disabled || submitted || reps <= 0}
          onClick={() => setReps((value) => Math.max(0, value - 1))}
          className="flex h-10 w-10 items-center justify-center border border-surface-border-strong text-ink-tertiary disabled:opacity-30"
        >
          <Minus size={16} />
        </button>

        <button
          type="button"
          disabled={disabled || submitted}
          onClick={() => setReps((value) => value + 1)}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-2 border-system bg-system/10 transition-transform active:scale-95 disabled:opacity-40"
        >
          <span className="font-display text-4xl font-black text-ink-primary">{reps}</span>
          {showTarget ? <span className="text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">de {target}</span> : null}
        </button>

        <button
          type="button"
          disabled={disabled || submitted}
          onClick={() => setReps((value) => value + 1)}
          className="flex h-10 w-10 items-center justify-center border border-system text-system disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>

      {showTarget ? (
        <div className="h-1.5 w-56 bg-surface-2">
          <div className={cn("h-full bg-system transition-[width] duration-300", pct >= 100 && "bg-gold")} style={{ width: `${pct}%` }} />
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled || submitted}
        onClick={handleSubmit}
        className="border border-system bg-system/10 px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitted ? "Enviado" : "Concluir Agora"}
      </button>
    </div>
  )
}
