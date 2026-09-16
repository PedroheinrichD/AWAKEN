import { usePoseExerciseSession } from "@/hooks/usePoseExerciseSession"
import { POSE_EXERCISE_LABELS, POSE_PHASE_LABELS } from "@/lib/pose/poseConfig"
import type { SupportedExerciseId } from "@/lib/pose/poseTypes"
import { PoseSessionShell } from "@/components/pose/PoseSessionShell"
import { cn } from "@/lib/utils"

interface MissionCameraChallengeProps {
  exerciseId: SupportedExerciseId
  target: number
  pending?: boolean
  onComplete: () => void
  onCancel: () => void
}

/**
 * Camera-validated mission flow: unlike a Boss/Duel turn there's no countdown —
 * the player does reps at their own pace and "Concluir Missão" only unlocks
 * once the detector has actually counted `target` valid reps. The mission's
 * `complete` mutation itself takes no rep count (the server already knows the
 * mission's target — claude.md §14/§17), so this component's only job is to
 * gate *when* that button can be pressed with a real count, never to report a number.
 */
export function MissionCameraChallenge({ exerciseId, target, pending, onComplete, onCancel }: MissionCameraChallengeProps) {
  const session = usePoseExerciseSession(exerciseId)

  function cancel() {
    session.stop()
    onCancel()
  }

  return (
    <div className="space-y-3">
      <PoseSessionShell session={session} exerciseLabel={POSE_EXERCISE_LABELS[exerciseId]}>
        {({ reps, phase, isLost }) => {
          const reachedTarget = reps >= target
          const pct = target > 0 ? Math.min(100, (reps / target) * 100) : 0
          return (
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-2 border-system bg-system/10">
                <span className="font-display text-4xl font-black text-ink-primary">{reps}</span>
                <span className="text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">de {target}</span>
              </div>

              <p className={cn("font-mono text-[11px] tracking-[0.2em] uppercase", isLost ? "text-danger" : "text-ink-tertiary")}>
                Status: {isLost ? "Pose Perdida" : POSE_PHASE_LABELS[phase] || "Executando"}
              </p>

              <div className="h-1.5 w-56 bg-surface-2">
                <div className={cn("h-full bg-system transition-[width] duration-300", pct >= 100 && "bg-gold")} style={{ width: `${pct}%` }} />
              </div>

              <button
                type="button"
                disabled={!reachedTarget || pending}
                onClick={() => {
                  session.stop()
                  onComplete()
                }}
                className="border border-system bg-system/10 px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {reachedTarget ? "Concluir Missão" : `Faltam ${target - reps}`}
              </button>
            </div>
          )
        }}
      </PoseSessionShell>

      <button type="button" onClick={cancel} className="mx-auto block font-mono text-[10px] text-ink-tertiary underline-offset-2 hover:underline">
        Cancelar
      </button>
    </div>
  )
}
