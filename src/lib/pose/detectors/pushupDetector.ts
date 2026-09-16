import { POSE_DETECTION_CONFIG, POSE_LANDMARK, POSE_SMOOTHING_CONFIG, PUSHUP_CONFIG } from "../poseConfig"
import type { ExerciseDetectionResult, ExerciseDetector, PoseFrame } from "../poseTypes"
import {
  angleBetweenPoints,
  angleFromHorizontal,
  averageVisibility,
  fractionVisible,
  HysteresisGate,
  landmarkVisibility,
  SlidingAverage,
} from "../poseUtils"

const REQUIRED_LANDMARKS = [
  POSE_LANDMARK.leftShoulder,
  POSE_LANDMARK.rightShoulder,
  POSE_LANDMARK.leftElbow,
  POSE_LANDMARK.rightElbow,
  POSE_LANDMARK.leftWrist,
  POSE_LANDMARK.rightWrist,
  POSE_LANDMARK.leftHip,
  POSE_LANDMARK.rightHip,
]

type StableState = "UP" | "DOWN"

/**
 * Push-up rep counter. Core state machine is a 2-state latch (UP/DOWN) with
 * hysteresis on each threshold crossing plus a "reached DOWN" flag that must be
 * set before a return to UP counts as a rep — this is what enforces a full
 * amplitude cycle (claude.md §6: UP → DESCENDO → DOWN → SUBINDO → UP) without
 * letting small bounces near a single threshold register as multiple reps.
 * The DESCENDO/SUBINDO labels shown to the player are derived from the angle's
 * trend direction and are purely cosmetic — they don't affect counting.
 *
 * Before any of that runs, the torso-horizontal check below is a hard gate:
 * elbow angle alone can't tell a push-up from someone sitting upright and
 * bending an arm (typing, adjusting the camera), so nothing is fed into the
 * state machine at all unless the shoulder–hip line actually looks horizontal.
 */
export class PushupDetector implements ExerciseDetector {
  readonly exerciseId = "flexao" as const

  private reps = 0
  private angleSmoother = new SlidingAverage(POSE_SMOOTHING_CONFIG.angleSmoothingWindow)
  private stateGate = new HysteresisGate<StableState>("UP", POSE_SMOOTHING_CONFIG.minFramesPerPhase, POSE_SMOOTHING_CONFIG.minPhaseDurationMs)
  private reachedDown = false
  private lastAngle = 180
  private lastRepAtMs = 0

  reset(): void {
    this.reps = 0
    this.angleSmoother.reset()
    this.stateGate.reset("UP")
    this.reachedDown = false
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
      return { reps: this.reps, phase: this.stateGate.value, quality: "INSUFICIENTE", formValid: false, message: "POSICIONE-SE NOVAMENTE" }
    }

    // Push-ups are usually filmed from the side, so only one arm/hip may be
    // clearly visible — use whichever side the camera currently sees better.
    const leftVisibility = averageVisibility(landmarks, [POSE_LANDMARK.leftShoulder, POSE_LANDMARK.leftElbow, POSE_LANDMARK.leftWrist])
    const rightVisibility = averageVisibility(landmarks, [POSE_LANDMARK.rightShoulder, POSE_LANDMARK.rightElbow, POSE_LANDMARK.rightWrist])
    const useLeft = leftVisibility >= rightVisibility

    const shoulder = landmarks[useLeft ? POSE_LANDMARK.leftShoulder : POSE_LANDMARK.rightShoulder]
    const elbow = landmarks[useLeft ? POSE_LANDMARK.leftElbow : POSE_LANDMARK.rightElbow]
    const wrist = landmarks[useLeft ? POSE_LANDMARK.leftWrist : POSE_LANDMARK.rightWrist]
    const hip = landmarks[useLeft ? POSE_LANDMARK.leftHip : POSE_LANDMARK.rightHip]
    const ankle = landmarks[useLeft ? POSE_LANDMARK.leftAnkle : POSE_LANDMARK.rightAnkle]

    const torsoAngle = angleFromHorizontal(shoulder, hip)
    if (torsoAngle > PUSHUP_CONFIG.maxTorsoAngleFromHorizontal) {
      // Not lying down at all — freeze the state machine instead of feeding it, so
      // standing/sitting movement can never be misread as a push-up rep.
      return {
        reps: this.reps,
        phase: this.stateGate.value,
        quality: "PRONTA",
        formValid: false,
        message: "DEITE-SE NA POSIÇÃO DE FLEXÃO",
      }
    }

    const rawElbowAngle = angleBetweenPoints(shoulder, elbow, wrist)
    const elbowAngle = this.angleSmoother.push(rawElbowAngle)
    const trend = elbowAngle - this.lastAngle
    this.lastAngle = elbowAngle

    // Ankle is frequently out of frame or low-confidence even in a real push-up shot,
    // so a sagging-hips warning only applies when it's actually visible — it's a soft
    // form correction, not a counting gate (the torso-angle check above is the gate).
    const ankleVisible = landmarkVisibility(ankle) >= POSE_DETECTION_CONFIG.minLandmarkVisibility
    const hipsAligned = !ankleVisible || angleBetweenPoints(shoulder, hip, ankle) >= PUSHUP_CONFIG.bodyAlignmentMinAngle

    const rawState: StableState =
      elbowAngle <= PUSHUP_CONFIG.elbowAngleDownMax ? "DOWN" : elbowAngle >= PUSHUP_CONFIG.elbowAngleUpMin ? "UP" : this.stateGate.value
    const confirmedState = this.stateGate.update(rawState, timestampMs)

    if (confirmedState === "DOWN") this.reachedDown = true

    if (confirmedState === "UP" && this.reachedDown) {
      const sinceLastRep = timestampMs - this.lastRepAtMs
      if (sinceLastRep >= POSE_SMOOTHING_CONFIG.minRepIntervalMs) {
        this.reps += 1
        this.lastRepAtMs = timestampMs
      }
      this.reachedDown = false
    }

    const phase = confirmedState === "UP" ? (trend < -0.5 ? "DESCENDO" : "UP") : trend > 0.5 ? "SUBINDO" : "DOWN"

    return {
      reps: this.reps,
      phase,
      quality: "PRONTA",
      formValid: hipsAligned,
      message: hipsAligned ? undefined : "ALINHE O CORPO (QUADRIL CAINDO)",
    }
  }
}
