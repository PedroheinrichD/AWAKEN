import type { NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision"
import { useCallback, useEffect, useRef, useState } from "react"
import { useCamera } from "@/hooks/useCamera"
import { createExerciseDetector } from "@/lib/pose/exerciseDetector"
import { detectForVideoFrame, getPoseLandmarker } from "@/lib/pose/poseLandmarker"
import { drawPoseOverlay } from "@/lib/pose/poseOverlay"
import { CALIBRATION_CONFIG } from "@/lib/pose/poseConfig"
import type { ExerciseDetectionResult, SupportedExerciseId } from "@/lib/pose/poseTypes"

export type SessionPhase =
  | "IDLE"
  | "REQUESTING_CAMERA"
  | "CAMERA_DENIED"
  | "CAMERA_UNAVAILABLE"
  | "CAMERA_ERROR"
  | "LOADING_MODEL"
  | "MODEL_ERROR"
  | "CALIBRATING"
  | "RUNNING"
  | "POSE_LOST"

/**
 * Orchestrates the full pipeline described in claude.md §3:
 * camera → Pose Landmarker → landmarks → exercise detector → valid reps.
 * Nothing here knows about Boss/Duel/RepCounter — it just exposes live
 * detection state and a start/stop lifecycle so any UI can consume it.
 */
export function usePoseExerciseSession(exerciseId: SupportedExerciseId) {
  const camera = useCamera()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [phase, setPhase] = useState<SessionPhase>("IDLE")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [calibrationSecondsLeft, setCalibrationSecondsLeft] = useState(CALIBRATION_CONFIG.durationSeconds)
  const [detection, setDetection] = useState<ExerciseDetectionResult | null>(null)
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null)

  const detectorRef = useRef(createExerciseDetector(exerciseId))
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const rafRef = useRef<number | null>(null)
  const runningRef = useRef(false)
  const calibratingRef = useRef(false)
  const stableFramesRef = useRef(0)
  const calibrationStartMsRef = useRef(0)

  useEffect(() => {
    detectorRef.current = createExerciseDetector(exerciseId)
  }, [exerciseId])

  const cameraStop = camera.stop

  // Depends only on the stable camera.stop function, never on `camera` itself: that object
  // is a fresh literal on every useCamera() render, so a dependency on the whole object gave
  // this callback a new identity on every re-render — which, combined with the cleanup effect
  // below, tore the session down (cancelled the frame loop, stopped the camera, reset to
  // IDLE) on the very first state update after start(), on every device.
  const stop = useCallback(() => {
    runningRef.current = false
    calibratingRef.current = false
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    cameraStop()
    setPhase("IDLE")
    setLandmarks(null)
    setDetection(null)
  }, [cameraStop])

  const loop = useCallback(() => {
    if (!runningRef.current) return
    const video = camera.videoRef.current
    const landmarker = landmarkerRef.current

    if (video && landmarker && video.readyState >= 2) {
      const timestampMs = performance.now()
      const result = detectForVideoFrame(landmarker, video, timestampMs)
      const poseLandmarks = result.landmarks[0] ?? null
      setLandmarks(poseLandmarks)
      stableFramesRef.current = poseLandmarks ? stableFramesRef.current + 1 : 0

      let overlayColor = "#5c6472" // no pose: dim gray
      if (calibratingRef.current) {
        overlayColor = "#f5a623" // calibrating: gold
        const elapsed = timestampMs - calibrationStartMsRef.current
        setCalibrationSecondsLeft(Math.max(0, Math.ceil((CALIBRATION_CONFIG.durationSeconds * 1000 - elapsed) / 1000)))

        // Both gates matter: the ceremonial countdown always runs its full course
        // (so "3 2 1 GO" is real, not skippable), and it only actually hands off
        // to RUNNING once the pose has genuinely held stable for long enough —
        // if the player is still out of frame when the countdown hits zero, it
        // just keeps waiting instead of starting a session with no valid pose.
        const countdownDone = elapsed >= CALIBRATION_CONFIG.durationSeconds * 1000
        const poseStable = stableFramesRef.current >= CALIBRATION_CONFIG.requiredStableFrames
        if (countdownDone && poseStable) {
          calibratingRef.current = false
          detectorRef.current.reset()
          setPhase("RUNNING")
        }
      } else if (poseLandmarks) {
        const detectionResult = detectorRef.current.update({
          landmarks: poseLandmarks.map((point) => ({ x: point.x, y: point.y, z: point.z, visibility: point.visibility ?? 0 })),
          timestampMs,
        })
        setDetection(detectionResult)
        setPhase(detectionResult.quality === "SEM_POSE" ? "POSE_LOST" : "RUNNING")
        overlayColor = detectionResult.quality === "PRONTA" ? (detectionResult.formValid ? "#4cc9f0" : "#ff3b4e") : "#f5a623"
      } else {
        setPhase("POSE_LOST")
      }

      if (canvasRef.current) drawPoseOverlay(canvasRef.current, video, poseLandmarks, overlayColor)
    }

    rafRef.current = requestAnimationFrame(loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.videoRef])

  const cameraStart = camera.start

  const start = useCallback(async () => {
    setErrorMessage(null)
    setPhase("REQUESTING_CAMERA")

    const cameraResult = await cameraStart()
    if (cameraResult.status !== "ready") {
      setPhase(
        cameraResult.status === "denied" ? "CAMERA_DENIED" : cameraResult.status === "unavailable" ? "CAMERA_UNAVAILABLE" : "CAMERA_ERROR",
      )
      setErrorMessage(cameraResult.errorMessage)
      return
    }

    setPhase("LOADING_MODEL")
    try {
      landmarkerRef.current = await getPoseLandmarker()
    } catch {
      setPhase("MODEL_ERROR")
      setErrorMessage("Não foi possível carregar o modelo de detecção de pose.")
      cameraStop()
      return
    }

    detectorRef.current.reset()
    stableFramesRef.current = 0
    calibrationStartMsRef.current = performance.now()
    setCalibrationSecondsLeft(CALIBRATION_CONFIG.durationSeconds)
    calibratingRef.current = true
    runningRef.current = true
    setPhase("CALIBRATING")
    rafRef.current = requestAnimationFrame(loop)
  }, [cameraStart, cameraStop, loop])

  useEffect(() => stop, [stop])

  return {
    videoRef: camera.videoRef,
    canvasRef,
    phase,
    errorMessage,
    calibrationSecondsLeft,
    detection,
    landmarks,
    start,
    stop,
    canSwitchCamera: camera.canSwitchCamera,
    switchCamera: camera.switchCamera,
    facingMode: camera.facingMode,
  }
}
