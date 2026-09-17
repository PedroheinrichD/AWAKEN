import type { ReactNode } from "react"
import type { useRunSession } from "@/hooks/useRunSession"
import { RunMap } from "./RunMap"

type RunSession = ReturnType<typeof useRunSession>

interface RunSessionShellProps {
  session: RunSession
  children: (running: { distanceKm: number }) => ReactNode
}

/** Shared GPS-run UI: "LOCALIZAÇÃO NECESSÁRIA" prompt → requesting → error + retry →
 * live map with the run trail. Mirrors PoseSessionShell's phase states/layout so both
 * validation flows feel like the same system, just backed by GPS instead of the camera. */
export function RunSessionShell({ session, children }: RunSessionShellProps) {
  const { phase } = session

  if (phase === "IDLE") {
    return (
      <div className="flex flex-col items-center gap-4 border border-surface-border-strong bg-surface-1 p-6 text-center">
        <p className="font-display text-sm font-bold tracking-[0.2em] text-system uppercase">Localização Necessária</p>
        <p className="max-w-xs text-xs leading-relaxed text-ink-secondary">
          O sistema precisa da sua localização para registrar a distância percorrida durante a corrida.
        </p>
        <button
          type="button"
          onClick={() => session.start()}
          className="border border-system bg-system/10 px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20"
        >
          Iniciar Corrida
        </button>
      </div>
    )
  }

  if (phase === "LOCATION_DENIED" || phase === "LOCATION_UNAVAILABLE" || phase === "LOCATION_ERROR") {
    return (
      <div className="flex flex-col items-center gap-3 border border-danger/50 bg-danger/5 p-6 text-center">
        <p className="font-display text-sm font-bold tracking-[0.2em] text-danger uppercase">
          {phase === "LOCATION_DENIED" ? "Permissão de Localização Negada" : "Localização Não Disponível"}
        </p>
        {session.errorMessage ? <p className="max-w-xs text-xs text-ink-secondary">{session.errorMessage}</p> : null}
        <button
          type="button"
          onClick={() => session.start()}
          className="border border-danger px-5 py-2 font-display text-xs font-semibold tracking-widest text-danger uppercase"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (!session.currentPosition) {
    return (
      <div className="flex flex-col items-center gap-2 border border-surface-border-strong bg-surface-1 p-6 text-center">
        <p className="animate-pulse-slow font-display text-sm font-bold tracking-[0.2em] text-system uppercase">Obtendo Sinal GPS...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <RunMap currentPosition={session.currentPosition} path={session.path} />
      {children({ distanceKm: session.distanceKm })}
    </div>
  )
}
