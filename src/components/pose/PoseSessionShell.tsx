import type { ReactNode } from "react"
import type { usePoseExerciseSession } from "@/hooks/usePoseExerciseSession"
import { CameraFrame, type FrameAccent } from "./CameraFrame"

type PoseSession = ReturnType<typeof usePoseExerciseSession>

interface RunningContext {
  reps: number
  phase: string
  isLost: boolean
}

interface PoseSessionShellProps {
  session: PoseSession
  exerciseLabel: string
  children: (running: RunningContext) => ReactNode
}

/**
 * Shared camera-session UI: "CÂMERA NECESSÁRIA" prompt → requesting/loading →
 * error + retry → calibration countdown → live CameraFrame. Every
 * camera-validated flow (Boss/Duel turns, mission goals) goes through the same
 * states, so this is the one place that renders them — callers only supply
 * what happens once a rep is actually being counted, via `children`.
 */
export function PoseSessionShell({ session, exerciseLabel, children }: PoseSessionShellProps) {
  if (session.phase === "IDLE") {
    return (
      <div className="flex flex-col items-center gap-4 border border-surface-border-strong bg-surface-1 p-6 text-center">
        <p className="font-display text-sm font-bold tracking-[0.2em] text-system uppercase">Câmera Necessária</p>
        <p className="max-w-xs text-xs leading-relaxed text-ink-secondary">
          Posicione seu corpo dentro da área indicada para que o sistema valide {exerciseLabel.toLowerCase()} automaticamente.
        </p>
        <button
          type="button"
          onClick={() => session.start()}
          className="border border-system bg-system/10 px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20"
        >
          Iniciar Câmera
        </button>
      </div>
    )
  }

  if (session.phase === "REQUESTING_CAMERA" || session.phase === "LOADING_MODEL") {
    return (
      <div className="flex flex-col items-center gap-2 border border-surface-border-strong bg-surface-1 p-6 text-center">
        <p className="animate-pulse-slow font-display text-sm font-bold tracking-[0.2em] text-system uppercase">
          {session.phase === "REQUESTING_CAMERA" ? "Solicitando Câmera..." : "Carregando Modelo de Pose..."}
        </p>
      </div>
    )
  }

  if (
    session.phase === "CAMERA_DENIED" ||
    session.phase === "CAMERA_UNAVAILABLE" ||
    session.phase === "CAMERA_ERROR" ||
    session.phase === "MODEL_ERROR"
  ) {
    return (
      <div className="flex flex-col items-center gap-3 border border-danger/50 bg-danger/5 p-6 text-center">
        <p className="font-display text-sm font-bold tracking-[0.2em] text-danger uppercase">
          {session.phase === "CAMERA_DENIED"
            ? "Permissão da Câmera Negada"
            : session.phase === "MODEL_ERROR"
              ? "Modelo Indisponível"
              : "Câmera Não Disponível"}
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

  const quality = session.detection?.quality
  const formValid = session.detection?.formValid ?? true
  const isCalibrating = session.phase === "CALIBRATING"
  const isLost = session.phase === "POSE_LOST"

  let accent: FrameAccent = "neutral"
  let guideLabel = "POSE NÃO DETECTADA"
  if (isCalibrating) {
    accent = session.landmarks ? "warning" : "neutral"
    guideLabel = session.calibrationSecondsLeft > 0 ? `CALIBRANDO POSE... ${session.calibrationSecondsLeft}` : session.landmarks ? "GO" : "POSICIONE-SE"
  } else if (isLost || quality === "SEM_POSE") {
    accent = "neutral"
    guideLabel = "POSE NÃO DETECTADA"
  } else if (quality === "INSUFICIENTE") {
    accent = "warning"
    guideLabel = session.detection?.message ?? "POSICIONE-SE NOVAMENTE"
  } else if (!formValid) {
    accent = "bad"
    guideLabel = session.detection?.message ?? "AJUSTE A EXECUÇÃO"
  } else {
    accent = "good"
    guideLabel = "POSE DETECTADA"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <CameraFrame
        videoRef={session.videoRef}
        canvasRef={session.canvasRef}
        accent={accent}
        guideLabel={guideLabel}
        mirrored={session.facingMode === "user"}
        canSwitchCamera={session.canSwitchCamera}
        onSwitchCamera={session.switchCamera}
      />
      {!isCalibrating ? children({ reps: session.detection?.reps ?? 0, phase: session.detection?.phase ?? "", isLost }) : null}
    </div>
  )
}
