import { POSE_DETECTION_CONFIG, POSE_LANDMARK, POSE_SMOOTHING_CONFIG, SQUAT_CONFIG } from "../poseConfig"
import type { ExerciseDetectionResult, ExerciseDetector, PoseFrame } from "../poseTypes"
import { angleBetweenPoints, averageVisibility, fractionVisible, HysteresisGate, SlidingAverage } from "../poseUtils"

const REQUIRED_LANDMARKS = [
  POSE_LANDMARK.leftHip,
  POSE_LANDMARK.rightHip,
  POSE_LANDMARK.leftKnee,
  POSE_LANDMARK.rightKnee,
  POSE_LANDMARK.leftAnkle,
  POSE_LANDMARK.rightAnkle,
]

type StableState = "STANDING" | "BOTTOM"

/**
 * Squat rep counter. Same 2-state-latch + hysteresis + "reached bottom" flag
 * design as the push-up detector (see pushupDetector.ts for the rationale),
 * driven by the hip–knee–ankle angle instead of the elbow angle
 * (claude.md §7: STANDING → DESCENDING → BOTTOM → ASCENDING → STANDING).
 */
export class SquatDetector implements ExerciseDetector {
  readonly exerciseId = "agachamento" as const

  private reps = 0
  private angleSmoother = new SlidingAverage(POSE_SMOOTHING_CONFIG.angleSmoothingWindow)
  private stateGate = new HysteresisGate<StableState>(
    "STANDING",
    POSE_SMOOTHING_CONFIG.minFramesPerPhase,
    POSE_SMOOTHING_CONFIG.minPhaseDurationMs,
  )
  private reachedBottom = false
  private lastAngle = 180
  private lastRepAtMs = 0

  reset(): void {
    this.reps = 0
    this.angleSmoother.reset()
    this.stateGate.reset("STANDING")
    this.reachedBottom = false
    this.lastAngle = 180
    this.lastRepAtMs = 0
  }

  update(frame: PoseFrame): ExerciseDetectionResult {
    const { landmarks, timestampMs } = frame

    const visibleFraction = fractionVisible(landmarks, REQUIRED_LANDMARKS, POSE_DETECTION_CONFIG.minLandmarkVisibility)
    if (visibleFraction < POSE_DETECTION_CONFIG.noPoseVisibleFraction) {
      return { reps: this.reps, phase: this.stateGate.value, quality: "SEM_POSE", formValid: false, message: "POSE NÃO DETECTADA" }
    }
    if (visibleFraction < POSE_DETECTION_CONFIG.readyVisibleFraction) {
      return { reps: this.reps, phase: this.stateGate.value, quality: "INSUFICIENTE", formValid: false, message: "DEIXE O CORPO COMPLETO VISÍVEL" }
    }

    const leftVisibility = averageVisibility(landmarks, [POSE_LANDMARK.leftHip, POSE_LANDMARK.leftKnee, POSE_LANDMARK.leftAnkle])
    const rightVisibility = averageVisibility(landmarks, [POSE_LANDMARK.rightHip, POSE_LANDMARK.rightKnee, POSE_LANDMARK.rightAnkle])
    const useLeft = leftVisibility >= rightVisibility

    const hip = landmarks[useLeft ? POSE_LANDMARK.leftHip : POSE_LANDMARK.rightHip]
    const knee = landmarks[useLeft ? POSE_LANDMARK.leftKnee : POSE_LANDMARK.rightKnee]
    const ankle = landmarks[useLeft ? POSE_LANDMARK.leftAnkle : POSE_LANDMARK.rightAnkle]

    const rawKneeAngle = angleBetweenPoints(hip, knee, ankle)
    const kneeAngle = this.angleSmoother.push(rawKneeAngle)
    const trend = kneeAngle - this.lastAngle
    this.lastAngle = kneeAngle

    const rawState: StableState =
      kneeAngle <= SQUAT_CONFIG.kneeAngleBottomMax ? "BOTTOM" : kneeAngle >= SQUAT_CONFIG.kneeAngleStandMin ? "STANDING" : this.stateGate.value
    const confirmedState = this.stateGate.update(rawState, timestampMs)

    if (confirmedState === "BOTTOM") this.reachedBottom = true

    if (confirmedState === "STANDING" && this.reachedBottom) {
      const sinceLastRep = timestampMs - this.lastRepAtMs
      if (sinceLastRep >= POSE_SMOOTHING_CONFIG.minRepIntervalMs) {
        this.reps += 1
        this.lastRepAtMs = timestampMs
      }
      this.reachedBottom = false
    }

    const phase = confirmedState === "STANDING" ? (trend < -0.5 ? "DESCENDING" : "STANDING") : trend > 0.5 ? "ASCENDING" : "BOTTOM"

    return { reps: this.reps, phase, quality: "PRONTA", formValid: true }
  }
}
