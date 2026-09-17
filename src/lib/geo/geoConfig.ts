/**
 * Every tunable number for the GPS run tracker lives here (same convention as
 * lib/pose/poseConfig.ts) — no magic numbers scattered across the tracking code.
 */

export const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 2000,
  timeout: 15000,
}

export const RUN_TRACKING_CONFIG = {
  /** Readings worse than this (meters) are dropped — GPS noise, not real movement. */
  maxAcceptableAccuracyMeters: 30,
  /** Minimum distance between two accepted points (meters) before it counts as movement —
   * filters GPS jitter while standing still, which would otherwise accumulate fake distance. */
  minMovementMeters: 7,
}
