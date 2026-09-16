/**
 * Shared types for the pose-detection layer. Nothing here depends on React or
 * on MediaPipe's own types directly, so detectors stay testable in isolation
 * and the UI never has to reach past `ExerciseDetector` into MediaPipe internals.
 */

export interface PoseLandmarkPoint {
  x: number
  y: number
  z: number
  visibility: number
}

export interface PoseFrame {
  landmarks: PoseLandmarkPoint[]
  timestampMs: number
}

/** Exercises with a real camera-based detector in this phase (claude.md phase: flexão, agachamento, corrida). */
export type SupportedExerciseId = "flexao" | "agachamento" | "corrida"

/**
 * Coarse read on whether the current frame can be trusted at all, independent
 * of which exercise is being detected. Drives the "POSE NÃO DETECTADA" /
 * "POSICIONE-SE NOVAMENTE" messaging.
 */
export type PoseQuality = "SEM_POSE" | "INSUFICIENTE" | "PRONTA"

export interface ExerciseDetectionResult {
  /** Reps for flexão/agachamento; step count for corrida. Never decreases. */
  reps: number
  /** Human-readable phase label for the current exercise's state machine (e.g. "UP", "DESCENDO", "CORRENDO"). */
  phase: string
  quality: PoseQuality
  /** False when the pose is visible but the movement doesn't meet form requirements (e.g. hips sagging on a push-up). */
  formValid: boolean
  /** Optional short status message to surface in the HUD (e.g. "ALINHE O CORPO"). */
  message?: string
  /** Exercise-specific extra numbers (e.g. corrida's activeMs) that don't fit the generic `reps` field. */
  meta?: Record<string, number>
}

export interface ExerciseDetector {
  readonly exerciseId: SupportedExerciseId
  /** Clears all internal state (rep count, smoothing history, phase). Call before starting/resuming a session. */
  reset(): void
  /** Feed one frame of landmarks. Returns the updated detection state; never throws. */
  update(frame: PoseFrame): ExerciseDetectionResult
}
