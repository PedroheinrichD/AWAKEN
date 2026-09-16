import { Minus, Plus } from "@phosphor-icons/react"
import { lazy, Suspense, useEffect, useState } from "react"
import { isCameraSupportedExercise } from "@/lib/pose/exerciseDetector"
import { cn } from "@/lib/utils"

// The MediaPipe vision runtime is a large dependency (§19: don't bloat every
// screen with it) — only fetch this chunk once a camera-validated exercise is
// actually rendered, not on every page that happens to import RepCounter.
const CameraExerciseSession = lazy(() =>
  import("@/components/pose/CameraExerciseSession").then((module) => ({ default: module.CameraExerciseSession })),
)

interface RepCounterProps {
  target: number
  timeLimitSeconds: number
  /** Which exercise this challenge/turn is for. Only flexão/agachamento/corrida have a camera detector today (claude.md §1); anything else falls back to manual. */
  exerciseId: string
  disabled?: boolean
  showTarget?: boolean
  onSubmit: (repsCompleted: number, timeRemainingSeconds: number) => void
}

/**
 * Camera-validated by default whenever a detector exists for this exercise
 * (claude.md §14: CAMERA_VALIDATED is the standard path, MANUAL is a debug
 * fallback). Either mode only ever calls `onSubmit(repsCompleted,
 * timeRemainingSeconds)` — the battle/duel APIs downstream never know which
 * mode produced the numbers. Keyed by exerciseId so a new challenge/turn always
 * starts back on the camera-validated default instead of carrying over a
 * previous manual-mode toggle.
 */
export function RepCounter(props: RepCounterProps) {
  return <RepCounterModeSwitcher key={props.exerciseId} {...props} />
}

function RepCounterModeSwitcher({ target, timeLimitSeconds, exerciseId, disabled, showTarget = true, onSubmit }: RepCounterProps) {
  const cameraSupported = isCameraSupportedExercise(exerciseId)
  const [manualOverride, setManualOverride] = useState(false)
  const mode: "camera" | "manual" = cameraSupported && !manualOverride ? "camera" : "manual"

  if (mode === "camera" && isCameraSupportedExercise(exerciseId)) {
    return (
      <div className="space-y-3">
        <Suspense fallback={<p className="text-center font-mono text-xs text-ink-tertiary">Carregando módulo de câmera...</p>}>
          <CameraExerciseSession
            exerciseId={exerciseId}
            target={target}
            timeLimitSeconds={timeLimitSeconds}
            disabled={disabled}
            showTarget={showTarget}
            onSubmit={onSubmit}
          />
        </Suspense>
        <button
          type="button"
          onClick={() => setManualOverride(true)}
          className="mx-auto block font-mono text-[10px] text-ink-tertiary underline-offset-2 hover:underline"
        >
          Usar contagem manual (modo debug)
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <ManualRepCounter target={target} timeLimitSeconds={timeLimitSeconds} disabled={disabled} showTarget={showTarget} onSubmit={onSubmit} />
      {cameraSupported ? (
        <button
          type="button"
          onClick={() => setManualOverride(false)}
          className="mx-auto block font-mono text-[10px] text-system underline-offset-2 hover:underline"
        >
          Usar câmera
        </button>
      ) : null}
    </div>
  )
}

interface ManualRepCounterProps {
  target: number
  timeLimitSeconds: number
  disabled?: boolean
  showTarget?: boolean
  onSubmit: (repsCompleted: number, timeRemainingSeconds: number) => void
}

/** Manual tap-to-count input — fallback for exercises without a camera detector yet, or debug mode. */
function ManualRepCounter({ target, timeLimitSeconds, disabled, showTarget = true, onSubmit }: ManualRepCounterProps) {
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
