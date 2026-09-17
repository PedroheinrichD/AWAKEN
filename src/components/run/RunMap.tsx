import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from "react-leaflet"
import type { GeoPoint } from "@/lib/geo/geoUtils"

interface RunMapProps {
  currentPosition: GeoPoint
  path: GeoPoint[]
}

/** Recenters the map on the player's position as new fixes come in — react-leaflet
 * only reads its center prop once, so following movement needs the map instance directly. */
function Recenter({ position }: { position: GeoPoint }) {
  const map = useMap()
  useEffect(() => {
    map.setView([position.lat, position.lng])
  }, [map, position])
  return null
}

/** Live GPS trail on an OpenStreetMap base (claude.md §27 — map-based tracking, no
 * Google Maps billing set up yet, so this stays swappable behind the same props). */
export function RunMap({ currentPosition, path }: RunMapProps) {
  const positions = path.map((point) => [point.lat, point.lng] as [number, number])

  return (
    <div className="relative aspect-square w-full max-w-sm overflow-hidden border border-surface-border-strong sm:aspect-video sm:max-w-none">
      <MapContainer
        center={[currentPosition.lat, currentPosition.lng]}
        zoom={17}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {positions.length > 1 ? <Polyline positions={positions} pathOptions={{ color: "#4cc9f0", weight: 4 }} /> : null}
        <CircleMarker
          center={[currentPosition.lat, currentPosition.lng]}
          radius={8}
          pathOptions={{ color: "#4cc9f0", fillColor: "#4cc9f0", fillOpacity: 1, weight: 2 }}
        />
        <Recenter position={currentPosition} />
      </MapContainer>
    </div>
  )
}
