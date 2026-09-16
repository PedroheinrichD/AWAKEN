import { PushupDetector } from "./detectors/pushupDetector"
import { RunningDetector } from "./detectors/runningDetector"
import { SquatDetector } from "./detectors/squatDetector"
import type { ExerciseDetector, SupportedExerciseId } from "./poseTypes"

const SUPPORTED_EXERCISE_IDS: readonly SupportedExerciseId[] = ["flexao", "agachamento", "corrida"]
const REP_COUNTED_EXERCISE_IDS: readonly SupportedExerciseId[] = ["flexao", "agachamento"]

export function isCameraSupportedExercise(exerciseId: string): exerciseId is SupportedExerciseId {
  return (SUPPORTED_EXERCISE_IDS as readonly string[]).includes(exerciseId)
}

/**
 * Narrower than `isCameraSupportedExercise`: true only for exercises whose
 * detector output is a rep count comparable to a numeric target. Corrida's
 * detector produces steps/activity, not reps, so a mission's km-based target
 * can't be gated on it (claude.md §8 — never fabricate distance from steps).
 */
export function isRepCountedExercise(exerciseId: string): exerciseId is "flexao" | "agachamento" {
  return (REP_COUNTED_EXERCISE_IDS as readonly string[]).includes(exerciseId)
}

/**
 * The only place in the app that maps an exercise id to a detector class.
 * Adding abdominal (or burpee, handstand, …) later means adding one case here
 * and one file under detectors/ — nothing else in the pipeline changes
 * (claude.md §13/§25).
 */
export function createExerciseDetector(exerciseId: SupportedExerciseId): ExerciseDetector {
  switch (exerciseId) {
    case "flexao":
      return new PushupDetector()
    case "agachamento":
      return new SquatDetector()
    case "corrida":
      return new RunningDetector()
  }
}
