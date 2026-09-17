import { useCallback, useEffect, useRef, useState } from "react"
import { GEO_OPTIONS, RUN_TRACKING_CONFIG } from "@/lib/geo/geoConfig"
import { haversineDistanceKm, type GeoPoint } from "@/lib/geo/geoUtils"

export type RunSessionPhase = "IDLE" | "REQUESTING_LOCATION" | "LOCATION_DENIED" | "LOCATION_UNAVAILABLE" | "LOCATION_ERROR" | "RUNNING"

/**
 * Owns the geolocation watchPosition lifecycle for a run: accumulated distance,
 * the accepted-point trail for the map, and the session's phase. Self-contained
 * (no nested hook whose return value is a fresh object every render) — unlike
 * useCamera/usePoseExerciseSession, so it doesn't need the same care around
 * useCallback dependencies to avoid tearing itself down on every position update.
 */
export function useRunSession() {
  const [phase, setPhase] = useState<RunSessionPhase>("IDLE")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [distanceKm, setDistanceKm] = useState(0)
  const [path, setPath] = useState<GeoPoint[]>([])
  const [currentPosition, setCurrentPosition] = useState<GeoPoint | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const lastAcceptedRef = useRef<GeoPoint | null>(null)
  const distanceRef = useRef(0)

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
    setPhase("IDLE")
  }, [])

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPhase("LOCATION_UNAVAILABLE")
      setErrorMessage("Este dispositivo não suporta geolocalização.")
      return
    }

    watchIdRef.current !== null && navigator.geolocation.clearWatch(watchIdRef.current)
    setErrorMessage(null)
    setPhase("REQUESTING_LOCATION")
    setDistanceKm(0)
    setPath([])
    setCurrentPosition(null)
    distanceRef.current = 0
    lastAcceptedRef.current = null

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: GeoPoint = { lat: position.coords.latitude, lng: position.coords.longitude }
        setCurrentPosition(point)
        setPhase("RUNNING")

        if (position.coords.accuracy > RUN_TRACKING_CONFIG.maxAcceptableAccuracyMeters) return

        const last = lastAcceptedRef.current
        if (!last) {
          lastAcceptedRef.current = point
          setPath([point])
          return
        }

        const segmentKm = haversineDistanceKm(last, point)
        if (segmentKm * 1000 < RUN_TRACKING_CONFIG.minMovementMeters) return

        distanceRef.current += segmentKm
        lastAcceptedRef.current = point
        setDistanceKm(distanceRef.current)
        setPath((prev) => [...prev, point])
      },
      (error) => {
        let nextPhase: RunSessionPhase
        let message: string
        if (error.code === error.PERMISSION_DENIED) {
          nextPhase = "LOCATION_DENIED"
          message = "Permissão de localização negada."
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          nextPhase = "LOCATION_UNAVAILABLE"
          message = "Não foi possível obter sua localização."
        } else {
          nextPhase = "LOCATION_ERROR"
          message = "Erro ao rastrear localização."
        }
        setPhase(nextPhase)
        setErrorMessage(message)
      },
      GEO_OPTIONS,
    )
  }, [])

  useEffect(() => stop, [stop])

  return { phase, errorMessage, distanceKm, path, currentPosition, start, stop }
}
