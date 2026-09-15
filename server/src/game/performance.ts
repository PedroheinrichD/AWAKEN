import { PerformanceTier } from "@prisma/client"

/**
 * Derives a performance tier from the tap-to-count-reps input (no camera yet —
 * see claude.md §20 / prompt §20). Swapping in real rep detection later only
 * means replacing what feeds `repsCompleted`, not this function.
 */
export function performanceFromChallenge(
  repsCompleted: number,
  target: number,
  timeRemainingSeconds: number,
  timeLimitSeconds: number,
): PerformanceTier {
  const ratio = target > 0 ? repsCompleted / target : 0
  const timeLeftFraction = timeLimitSeconds > 0 ? timeRemainingSeconds / timeLimitSeconds : 0

  if (ratio < 0.7) return PerformanceTier.RUIM
  if (ratio < 1.0) return PerformanceTier.NORMAL
  if (timeLeftFraction >= 0.5) return PerformanceTier.EXCEPCIONAL
  return PerformanceTier.EXCELENTE
}
