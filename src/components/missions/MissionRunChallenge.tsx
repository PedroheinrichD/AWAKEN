import { useRunSession } from "@/hooks/useRunSession"
import { RunSessionShell } from "@/components/run/RunSessionShell"
import { cn } from "@/lib/utils"

interface MissionRunChallengeProps {
  target: number
  pending?: boolean
  onComplete: (distanceKm: number) => void
  onCancel: () => void
}

/**
 * GPS-validated mission flow: unlike a camera-counted exercise, distance only ever
 * goes up over the session, so there's no "form" to gate on — "Concluir Missão" just
 * unlocks once the tracked distance reaches `target` km, and the actual measured
 * distance (not the target) is what gets reported to the server for validation.
 */
export function MissionRunChallenge({ target, pending, onComplete, onCancel }: MissionRunChallengeProps) {
  const session = useRunSession()

  function cancel() {
    session.stop()
    onCancel()
  }

  return (
    <div className="space-y-3">
      <RunSessionShell session={session}>
        {({ distanceKm }) => {
          const reachedTarget = distanceKm >= target
          const pct = target > 0 ? Math.min(100, (distanceKm / target) * 100) : 0
          return (
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-2 border-system bg-system/10">
                <span className="font-display text-2xl font-black text-ink-primary">{distanceKm.toFixed(2)}</span>
                <span className="text-[10px] tracking-[0.15em] text-ink-tertiary uppercase">de {target}km</span>
              </div>

              <div className="h-1.5 w-56 bg-surface-2">
                <div className={cn("h-full bg-system transition-[width] duration-300", pct >= 100 && "bg-gold")} style={{ width: `${pct}%` }} />
              </div>

              <button
                type="button"
                disabled={!reachedTarget || pending}
                onClick={() => {
                  session.stop()
                  onComplete(distanceKm)
                }}
                className="border border-system bg-system/10 px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {reachedTarget ? "Concluir Missão" : `Faltam ${(target - distanceKm).toFixed(2)}km`}
              </button>
            </div>
          )
        }}
      </RunSessionShell>

      <button type="button" onClick={cancel} className="mx-auto block font-mono text-[10px] text-ink-tertiary underline-offset-2 hover:underline">
        Cancelar
      </button>
    </div>
  )
}
