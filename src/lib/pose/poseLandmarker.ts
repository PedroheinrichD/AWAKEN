import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision"
import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision"
import { POSE_ASSETS, POSE_DETECTION_CONFIG } from "./poseConfig"

/**
 * Centralized, singleton loading of the Pose Landmarker model (claude.md §21 —
 * never instantiate this from a component, and never re-download it per exercise).
 * The first caller triggers loading; every later call awaits the same promise.
 */

export class PoseLandmarkerLoadError extends Error {}

interface LoadAttempt {
  wasmBaseUrl: string
  modelAssetPath: string
  delegate: "GPU" | "CPU"
}

let landmarkerPromise: Promise<PoseLandmarker> | null = null

async function createLandmarker({ wasmBaseUrl, modelAssetPath, delegate }: LoadAttempt): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(wasmBaseUrl)
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath, delegate },
    runningMode: "VIDEO",
    numPoses: POSE_DETECTION_CONFIG.numPoses,
    minPoseDetectionConfidence: POSE_DETECTION_CONFIG.minPoseDetectionConfidence,
    minPosePresenceConfidence: POSE_DETECTION_CONFIG.minPosePresenceConfidence,
    minTrackingConfidence: POSE_DETECTION_CONFIG.minTrackingConfidence,
  })
}

/**
 * Tries local self-hosted assets before falling back to the remote CDN/Google
 * Storage copies, and GPU delegate before CPU. Each combination is a real attempt
 * (no silent mock) — if all four fail, the caller gets a clear, typed error.
 */
async function loadWithFallbacks(): Promise<PoseLandmarker> {
  const attempts: LoadAttempt[] = [
    { wasmBaseUrl: POSE_ASSETS.wasmBaseUrl, modelAssetPath: POSE_ASSETS.modelAssetPath, delegate: "GPU" },
    { wasmBaseUrl: POSE_ASSETS.wasmBaseUrl, modelAssetPath: POSE_ASSETS.modelAssetPath, delegate: "CPU" },
    { wasmBaseUrl: POSE_ASSETS.fallbackWasmBaseUrl, modelAssetPath: POSE_ASSETS.fallbackModelAssetPath, delegate: "GPU" },
    { wasmBaseUrl: POSE_ASSETS.fallbackWasmBaseUrl, modelAssetPath: POSE_ASSETS.fallbackModelAssetPath, delegate: "CPU" },
  ]

  let lastError: unknown
  for (const attempt of attempts) {
    try {
      return await createLandmarker(attempt)
    } catch (error) {
      lastError = error
      console.warn(`[pose] Falha ao inicializar Pose Landmarker (${attempt.delegate}, ${attempt.wasmBaseUrl})`, error)
    }
  }

  throw new PoseLandmarkerLoadError(
    "Não foi possível carregar o modelo Pose Landmarker (local e remoto falharam).",
    lastError instanceof Error ? { cause: lastError } : undefined,
  )
}

export function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = loadWithFallbacks().catch((error: unknown) => {
      // Allow a future call to retry (e.g. after the user reconnects to the network)
      // instead of permanently caching a rejected promise.
      landmarkerPromise = null
      throw error
    })
  }
  return landmarkerPromise
}

export function detectForVideoFrame(landmarker: PoseLandmarker, video: HTMLVideoElement, timestampMs: number): PoseLandmarkerResult {
  return landmarker.detectForVideo(video, timestampMs)
}
