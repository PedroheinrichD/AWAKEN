import { ArrowsClockwise } from "@phosphor-icons/react"
import type { RefObject } from "react"
import { cn } from "@/lib/utils"

export type FrameAccent = "neutral" | "warning" | "good" | "bad"

const ACCENT_BORDER: Record<FrameAccent, string> = {
  neutral: "border-surface-border-strong",
  warning: "border-gold",
  good: "border-system",
  bad: "border-danger",
}

const ACCENT_TEXT: Record<FrameAccent, string> = {
  neutral: "text-ink-tertiary",
  warning: "text-gold",
  good: "text-system",
  bad: "text-danger",
}

interface CameraFrameProps {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  accent: FrameAccent
  guideLabel: string
  /** Mirror the preview horizontally — only correct for the front/selfie camera, never the rear one. */
  mirrored?: boolean
  canSwitchCamera?: boolean
  onSwitchCamera?: () => void
}

/** Camera feed + skeleton overlay + the framing guide box (claude.md §5/§10). */
export function CameraFrame({ videoRef, canvasRef, accent, guideLabel, mirrored, canSwitchCamera, onSwitchCamera }: CameraFrameProps) {
  return (
    <div className="relative aspect-3/4 w-full max-w-sm overflow-hidden border border-surface-border-strong bg-surface-0 sm:aspect-video sm:max-w-none">
      <video ref={videoRef} className={cn("absolute inset-0 h-full w-full object-cover", mirrored && "scale-x-[-1]")} muted playsInline />
      <canvas ref={canvasRef} className={cn("absolute inset-0 h-full w-full object-cover", mirrored && "scale-x-[-1]")} />

      <div
        className={cn(
          "pointer-events-none absolute inset-4 border-2 border-dashed transition-colors duration-300 sm:inset-8",
          ACCENT_BORDER[accent],
        )}
      >
        <span
          className={cn(
            "absolute -top-3 left-3 bg-surface-0 px-1.5 font-display text-[9px] font-bold tracking-[0.2em] uppercase",
            ACCENT_TEXT[accent],
          )}
        >
          Área da Pose
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-void/90 to-transparent p-3">
        <p className={cn("font-mono text-xs font-semibold tracking-[0.15em] uppercase", ACCENT_TEXT[accent])}>{guideLabel}</p>
        {canSwitchCamera && onSwitchCamera ? (
          <button
            type="button"
            onClick={onSwitchCamera}
            aria-label="Alternar câmera"
            className="flex h-8 w-8 items-center justify-center border border-surface-border-strong bg-surface-1/80 text-ink-secondary transition-colors hover:text-system"
          >
            <ArrowsClockwise size={16} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
