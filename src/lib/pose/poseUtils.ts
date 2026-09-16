import type { PoseLandmarkPoint } from "./poseTypes"

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Angle at vertex `b`, in degrees, formed by segments b→a and b→c. Uses image-plane (x, y) only. */
export function angleBetweenPoints(a: PoseLandmarkPoint, b: PoseLandmarkPoint, c: PoseLandmarkPoint): number {
  const abx = a.x - b.x
  const aby = a.y - b.y
  const cbx = c.x - b.x
  const cby = c.y - b.y

  const magAB = Math.hypot(abx, aby)
  const magCB = Math.hypot(cbx, cby)
  if (magAB === 0 || magCB === 0) return 0

  const cos = clampNumber((abx * cbx + aby * cby) / (magAB * magCB), -1, 1)
  return (Math.acos(cos) * 180) / Math.PI
}

/** Angle of segment a→b relative to the horizontal axis, in degrees: 0 = horizontal, 90 = vertical. */
export function angleFromHorizontal(a: PoseLandmarkPoint, b: PoseLandmarkPoint): number {
  const dx = Math.abs(b.x - a.x)
  const dy = Math.abs(b.y - a.y)
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

export function landmarkVisibility(landmark: PoseLandmarkPoint | undefined): number {
  return landmark?.visibility ?? 0
}

export function averageVisibility(landmarks: PoseLandmarkPoint[], indices: number[]): number {
  if (indices.length === 0) return 0
  const total = indices.reduce((sum, index) => sum + landmarkVisibility(landmarks[index]), 0)
  return total / indices.length
}

export function fractionVisible(landmarks: PoseLandmarkPoint[], indices: number[], minVisibility: number): number {
  if (indices.length === 0) return 0
  const visibleCount = indices.filter((index) => landmarkVisibility(landmarks[index]) >= minVisibility).length
  return visibleCount / indices.length
}

/** Simple moving average over the last N pushed values — smooths per-frame jitter in joint angles. */
export class SlidingAverage {
  private values: number[] = []
  private readonly windowSize: number

  constructor(windowSize: number) {
    this.windowSize = windowSize
  }

  push(value: number): number {
    this.values.push(value)
    if (this.values.length > this.windowSize) this.values.shift()
    return this.average()
  }

  average(): number {
    if (this.values.length === 0) return 0
    return this.values.reduce((sum, value) => sum + value, 0) / this.values.length
  }

  reset(): void {
    this.values = []
  }
}

/**
 * Debounces a discrete state so a value only "sticks" after it has been the
 * requested candidate for `minFrames` consecutive updates AND `minDurationMs`
 * has elapsed since it first appeared. This is what stops a single noisy frame
 * (camera shake, a momentary tracking glitch) from flipping the rep state
 * machine and causing a false count (claude.md §12).
 */
export class HysteresisGate<T extends string> {
  private current: T
  private candidate: T | null = null
  private candidateFrames = 0
  private candidateSinceMs = 0
  private readonly minFrames: number
  private readonly minDurationMs: number

  constructor(initial: T, minFrames: number, minDurationMs: number) {
    this.current = initial
    this.minFrames = minFrames
    this.minDurationMs = minDurationMs
  }

  get value(): T {
    return this.current
  }

  /** Feed the raw (unstable) reading for this frame; returns the debounced/confirmed state. */
  update(rawValue: T, nowMs: number): T {
    if (rawValue === this.current) {
      this.candidate = null
      this.candidateFrames = 0
      return this.current
    }

    if (this.candidate !== rawValue) {
      this.candidate = rawValue
      this.candidateFrames = 1
      this.candidateSinceMs = nowMs
    } else {
      this.candidateFrames += 1
    }

    const elapsed = nowMs - this.candidateSinceMs
    if (this.candidateFrames >= this.minFrames && elapsed >= this.minDurationMs) {
      this.current = rawValue
      this.candidate = null
      this.candidateFrames = 0
    }

    return this.current
  }

  reset(initial: T): void {
    this.current = initial
    this.candidate = null
    this.candidateFrames = 0
  }
}
