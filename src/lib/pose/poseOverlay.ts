import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision"
import type { NormalizedLandmark } from "@mediapipe/tasks-vision"

/**
 * Draws the camera frame plus the detected skeleton onto a canvas sized to
 * match it. Purely visual (claude.md §5) — never touches rep-counting logic.
 */
export function drawPoseOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks: NormalizedLandmark[] | null,
  color: string,
): void {
  if (video.videoWidth === 0 || video.videoHeight === 0) return
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (landmarks) {
    const drawingUtils = new DrawingUtils(ctx)
    drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color, lineWidth: 3 })
    drawingUtils.drawLandmarks(landmarks, { color, fillColor: color, radius: 3 })
  }

  ctx.restore()
}
