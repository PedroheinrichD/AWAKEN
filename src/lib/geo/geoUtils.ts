export interface GeoPoint {
  lat: number
  lng: number
}

const EARTH_RADIUS_KM = 6371

/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}
