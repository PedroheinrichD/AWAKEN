import { useCallback, useEffect, useRef, useState } from "react"
import { CAMERA_CONSTRAINTS } from "@/lib/pose/poseConfig"

export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "unavailable" | "error"
export type FacingMode = "user" | "environment"

export interface CameraStartResult {
  status: CameraStatus
  errorMessage: string | null
}

/**
 * Owns the getUserMedia lifecycle. The camera is only ever requested when
 * `start()` is called explicitly by the UI (claude.md §4 — never on mount),
 * and every track is stopped on `stop()`/unmount so nothing keeps recording in
 * the background.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [status, setStatus] = useState<CameraStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>("environment")
  const [canSwitchCamera, setCanSwitchCamera] = useState(false)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus("idle")
  }, [])

  const start = useCallback(async (mode: FacingMode = facingMode): Promise<CameraStartResult> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable")
      setErrorMessage("Este navegador não suporta acesso à câmera.")
      return { status: "unavailable", errorMessage: "Este navegador não suporta acesso à câmera." }
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    setStatus("requesting")
    setErrorMessage(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { ...CAMERA_CONSTRAINTS, facingMode: mode },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch {
          // Some mobile browsers (notably iOS Safari) can reject an async play() call
          // that lands outside the immediate user-gesture window — getUserMedia's own
          // await already consumed it — even though the stream itself is perfectly
          // valid and the element starts rendering frames on its own once srcObject is
          // set. Treating this as a real failure was masking a working camera behind a
          // misleading "permission denied" message.
        }
      }
      setFacingMode(mode)
      setStatus("ready")

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        setCanSwitchCamera(devices.filter((device) => device.kind === "videoinput").length > 1)
      } catch {
        // Device enumeration is a nice-to-have for the switch-camera button; ignore failures.
      }

      return { status: "ready", errorMessage: null }
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ""
      let message: string
      let nextStatus: CameraStatus
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        nextStatus = "denied"
        message = "Permissão da câmera negada."
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        nextStatus = "unavailable"
        message = "Nenhuma câmera disponível neste dispositivo."
      } else if (name === "NotReadableError") {
        nextStatus = "error"
        message = "A câmera está sendo usada por outro aplicativo."
      } else {
        nextStatus = "error"
        message = "Erro ao inicializar a câmera."
      }
      setStatus(nextStatus)
      setErrorMessage(message)
      return { status: nextStatus, errorMessage: message }
    }
  }, [facingMode])

  const switchCamera = useCallback(() => start(facingMode === "user" ? "environment" : "user"), [facingMode, start])

  useEffect(() => stop, [stop])

  return { videoRef, status, errorMessage, facingMode, canSwitchCamera, start, stop, switchCamera }
}
