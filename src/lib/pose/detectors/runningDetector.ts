import { POSE_DETECTION_CONFIG, POSE_LANDMARK, POSE_SMOOTHING_CONFIG, RUNNING_CONFIG } from "../poseConfig"
import type { ExerciseDetectionResult, ExerciseDetector, PoseFrame } from "../poseTypes"
import { fractionVisible, HysteresisGate, SlidingAverage } from "../poseUtils"

const REQUIRED_LANDMARKS = [
  POSE_LANDMARK.leftHip,
  POSE_LANDMARK.rightHip,
  POSE_LANDMARK.leftKnee,
  POSE_LANDMARK.rightKnee,
]

type ActivityState = "PARADO" | "CORRENDO"
type LiftedSide = "left" | "right" | null

/**
 * Running is fundamentally different from flexão/agachamento: there's no rep
 * amplitude to validate, and — per claude.md §8 — distance must keep coming
 * from GPS, never be invented from landmarks. What the camera *can* validate
 * is that the body is actually performing cyclical leg movement compatible
 * with running (in place, or on a treadmill): it tracks each knee's height
 * relative to the hips and counts a "step" whenever a knee lifts far enough
 * above the baseline and the lift alternates sides. `reps` here is the step
 * count, not a rep count; `meta.activeMs` is the accumulated time spent in the
 * CORRENDO state, both handed to the caller instead of a fabricated km value.
 */
export class RunningDetector implements ExerciseDetector {
  readonly exerciseId = "corrida" as const

  private steps = 0
  private activeMs = 0
  private leftLiftSmoother = new SlidingAverage(POSE_SMOOTHING_CONFIG.angleSmoothingWindow)
  private rightLiftSmoother = new SlidingAverage(POSE_SMOOTHING_CONFIG.angleSmoothingWindow)
  private activityGate = new HysteresisGate<ActivityState>(
    "PARADO",
    POSE_SMOOTHING_CONFIG.minFramesPerPhase,
    POSE_SMOOTHING_CONFIG.minPhaseDurationMs,
  )
  private lastLiftedSide: LiftedSide = null
  private lastStepAtMs = 0
  private lastFrameTimestampMs: number | null = null

  reset(): void {
    this.steps = 0
    this.activeMs = 0
    this.leftLiftSmoother.reset()
    this.rightLiftSmoother.reset()
    this.activityGate.reset("PARADO")
    this.lastLiftedSide = null
    this.lastStepAtMs = 0
    this.lastFrameTimestampMs = null
  }

  update(frame: PoseFrame): ExerciseDetectionResult {
    const { landmarks, timestampMs } = frame

    const visibleFraction = fractionVisible(landmarks, REQUIRED_LANDMARKS, POSE_DETECTION_CONFIG.minLandmarkVisibility)
    if (visibleFraction < POSE_DETECTION_CONFIG.noPoseVisibleFraction) {
      return { reps: this.steps, phase: this.activityGate.value, quality: "SEM_POSE", formValid: false, message: "POSE NÃO DETECTADA" }
    }
    if (visibleFraction < POSE_DETECTION_CONFIG.readyVisibleFraction) {
      return {
        reps: this.steps,
        phase: this.activityGate.value,
        quality: "INSUFICIENTE",
        formValid: false,
        message: "DEIXE PERNAS E QUADRIL VISÍVEIS",
      }
    }

    const dt = this.lastFrameTimestampMs !== null ? timestampMs - this.lastFrameTimestampMs : 0
    this.lastFrameTimestampMs = timestampMs

    // Smaller y = higher on screen, so (hipY - kneeY) grows as the knee lifts above the hips' resting height.
    const hipY = (landmarks[POSE_LANDMARK.leftHip].y + landmarks[POSE_LANDMARK.rightHip].y) / 2
    const leftLift = this.leftLiftSmoother.push(hipY - landmarks[POSE_LANDMARK.leftKnee].y)
    const rightLift = this.rightLiftSmoother.push(hipY - landmarks[POSE_LANDMARK.rightKnee].y)

    const dominantSide: LiftedSide = leftLift >= rightLift ? "left" : "right"
    const dominantLift = Math.max(leftLift, rightLift)

    if (dominantLift >= RUNNING_CONFIG.kneeLiftMinDelta && dominantSide !== this.lastLiftedSide) {
      const sinceLastStep = timestampMs - this.lastStepAtMs
      if (sinceLastStep >= RUNNING_CONFIG.minStepIntervalMs) {
        this.steps += 1
        this.lastStepAtMs = timestampMs
        this.lastLiftedSide = dominantSide
      }
    }

    const timeSinceLastStep = this.lastStepAtMs > 0 ? timestampMs - this.lastStepAtMs : Number.POSITIVE_INFINITY
    const rawActivity: ActivityState = timeSinceLastStep <= RUNNING_CONFIG.maxStepGapMs ? "CORRENDO" : "PARADO"
    const confirmedActivity = this.activityGate.update(rawActivity, timestampMs)

    if (confirmedActivity === "CORRENDO" && dt > 0) this.activeMs += dt

    return {
      reps: this.steps,
      phase: confirmedActivity,
      quality: "PRONTA",
      formValid: true,
      meta: { activeMs: this.activeMs },
    }
  }
}
