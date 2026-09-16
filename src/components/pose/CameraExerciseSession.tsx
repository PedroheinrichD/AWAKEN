import { useEffect, useRef, useState } from "react"
import { usePoseExerciseSession } from "@/hooks/usePoseExerciseSession"
import { POSE_EXERCISE_LABELS, POSE_PHASE_LABELS } from "@/lib/pose/poseConfig"
import type { SupportedExerciseId } from "@/lib/pose/poseTypes"
import { cn } from "@/lib/utils"
import { PoseSessionShell } from "./PoseSessionShell"

interface CameraExerciseSessionProps {
  exerciseId: SupportedExerciseId
  target: number
  timeLimitSeconds: number
  disabled?: boolean
  showTarget?: boolean
  onSubmit: (repsCompleted: number, timeRemainingSeconds: number) => void
}

/**
 * Full camera-validated exercise flow for a single challenge/turn: request
 * camera → calibrate → count reps live → submit. This is the only place that
 * turns raw detector output into the (repsCompleted, timeRemainingSeconds)
 * pair the existing battle/duel APIs already expect (claude.md §14) — nothing
 * downstream of `onSubmit` changes.
 */
export function CameraExerciseSession({ exerciseId, target, timeLimitSeconds, disabled, showTarget = true, onSubmit }: CameraExerciseSessionProps) {
  const session = usePoseExerciseSession(exerciseId)
  const [seconds, setSeconds] = useState(timeLimitSeconds)
  const [submitted, setSubmitted] = useState(false)
  const repsRef = useRef(0)
  const hasStartedCounting = useRef(false)

  useEffect(() => {
    if (session.detection) repsRef.current = session.detection.reps
  }, [session.detection])

  useEffect(() => {
    setSeconds(timeLimitSeconds)
    setSubmitted(false)
    hasStartedCounting.current = false
    repsRef.current = 0
  }, [timeLimitSeconds, target, exerciseId])

  useEffect(() => {
    if (session.phase === "RUNNING" || session.phase === "POSE_LOST") hasStartedCounting.current = true
  }, [session.phase])

  useEffect(() => {
    if (!hasStartedCounting.current || disabled || submitted || seconds <= 0) return
    const interval = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(interval)
  }, [disabled, submitted, seconds, session.phase])

  useEffect(() => {
    if (seconds === 0 && hasStartedCounting.current && !submitted && !disabled) {
      setSubmitted(true)
      session.stop()
      onSubmit(repsRef.current, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds])

  function finishNow() {
    if (submitted || disabled) return
    setSubmitted(true)
    session.stop()
    onSubmit(repsRef.current, seconds)
  }

  if (submitted) {
    return <p className="text-center text-sm text-ink-tertiary">Resultado enviado.</p>
  }

  return (
    <PoseSessionShell session={session} exerciseLabel={POSE_EXERCISE_LABELS[exerciseId]}>
      {({ reps, phase, isLost }) => {
        const pct = target > 0 ? Math.min(100, (reps / target) * 100) : 0
        return (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="font-mono text-4xl font-bold text-ink-primary">00:{String(seconds).padStart(2, "0")}</p>

            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-2 border-system bg-system/10">
                <span className="font-display text-4xl font-black text-ink-primary">{reps}</span>
                {showTarget ? <span className="text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">de {target}</span> : null}
              </div>
            </div>

            <p className={cn("font-mono text-[11px] tracking-[0.2em] uppercase", isLost ? "text-danger" : "text-ink-tertiary")}>
              Status: {isLost ? "Pose Perdida" : POSE_PHASE_LABELS[phase] || "Executando"}
            </p>

            {showTarget ? (
              <div className="h-1.5 w-56 bg-surface-2">
                <div className={cn("h-full bg-system transition-[width] duration-300", pct >= 100 && "bg-gold")} style={{ width: `${pct}%` }} />
              </div>
            ) : null}

            <button
              type="button"
              disabled={disabled}
              onClick={finishNow}
              className="border border-system bg-system/10 px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Concluir Agora
            </button>
          </div>
        )
      }}
    </PoseSessionShell>
  )
}
