import { useSettingsStore } from "@/store/useSettingsStore"

/**
 * Every "System" sound is synthesized with the Web Audio API instead of shipped as
 * audio files — there are no sound assets anywhere in this repo, and generated
 * oscillator tones actually fit the holographic-UI aesthetic (digital blips, not
 * realistic sound effects) better than a stock sound-effect pack would.
 *
 * Add a new sound by naming it here and giving it a recipe in SOUND_RECIPES below.
 */
export type SoundName =
  | "boot"
  | "confirm"
  | "click"
  | "levelUp"
  | "rankUp"
  | "rankEligible"
  | "awakening"
  | "bossEncounter"
  | "turnVictory"
  | "turnDefeat"
  | "death"

interface ToneStep {
  /** Hz. */
  freq: number
  /** Seconds after the sound starts. */
  startOffset: number
  /** Seconds. */
  duration: number
  type?: OscillatorType
  /** Peak gain, 0–1. Keep well under 1 — several tones can overlap. */
  gain?: number
}

const SOUND_RECIPES: Record<SoundName, ToneStep[]> = {
  boot: [
    { freq: 220, startOffset: 0, duration: 0.12, type: "triangle", gain: 0.12 },
    { freq: 440, startOffset: 0.11, duration: 0.12, type: "triangle", gain: 0.12 },
    { freq: 880, startOffset: 0.22, duration: 0.28, type: "triangle", gain: 0.14 },
  ],
  confirm: [
    { freq: 660, startOffset: 0, duration: 0.07, type: "sine", gain: 0.15 },
    { freq: 880, startOffset: 0.07, duration: 0.1, type: "sine", gain: 0.15 },
  ],
  click: [{ freq: 880, startOffset: 0, duration: 0.035, type: "sine", gain: 0.1 }],
  levelUp: [
    { freq: 523.25, startOffset: 0, duration: 0.11, type: "triangle", gain: 0.14 },
    { freq: 659.25, startOffset: 0.1, duration: 0.11, type: "triangle", gain: 0.14 },
    { freq: 783.99, startOffset: 0.2, duration: 0.11, type: "triangle", gain: 0.14 },
    { freq: 1046.5, startOffset: 0.3, duration: 0.32, type: "triangle", gain: 0.16 },
  ],
  rankUp: [
    { freq: 392, startOffset: 0, duration: 0.15, type: "sawtooth", gain: 0.08 },
    { freq: 523.25, startOffset: 0.12, duration: 0.15, type: "sawtooth", gain: 0.08 },
    { freq: 659.25, startOffset: 0.24, duration: 0.15, type: "sawtooth", gain: 0.09 },
    { freq: 783.99, startOffset: 0.36, duration: 0.15, type: "sawtooth", gain: 0.1 },
    { freq: 1046.5, startOffset: 0.48, duration: 0.5, type: "triangle", gain: 0.18 },
    { freq: 1318.5, startOffset: 0.48, duration: 0.5, type: "triangle", gain: 0.12 },
  ],
  rankEligible: [
    { freq: 587.33, startOffset: 0, duration: 0.14, type: "triangle", gain: 0.12 },
    { freq: 880, startOffset: 0.13, duration: 0.35, type: "triangle", gain: 0.14 },
  ],
  awakening: [
    { freq: 330, startOffset: 0, duration: 1.1, type: "sine", gain: 0.1 },
    { freq: 333, startOffset: 0, duration: 1.1, type: "sine", gain: 0.1 },
    { freq: 660, startOffset: 0.5, duration: 0.7, type: "sine", gain: 0.08 },
  ],
  bossEncounter: [
    { freq: 82, startOffset: 0, duration: 1.4, type: "sawtooth", gain: 0.11 },
    { freq: 85, startOffset: 0, duration: 1.4, type: "sawtooth", gain: 0.09 },
    { freq: 164, startOffset: 0.15, duration: 0.5, type: "triangle", gain: 0.06 },
  ],
  turnVictory: [
    { freq: 587.33, startOffset: 0, duration: 0.1, type: "triangle", gain: 0.13 },
    { freq: 880, startOffset: 0.09, duration: 0.22, type: "triangle", gain: 0.15 },
  ],
  turnDefeat: [
    { freq: 293.66, startOffset: 0, duration: 0.16, type: "sawtooth", gain: 0.1 },
    { freq: 220, startOffset: 0.14, duration: 0.28, type: "sawtooth", gain: 0.1 },
  ],
  death: [
    { freq: 220, startOffset: 0, duration: 0.5, type: "sawtooth", gain: 0.1 },
    { freq: 146.83, startOffset: 0.4, duration: 0.6, type: "sawtooth", gain: 0.1 },
    { freq: 73.42, startOffset: 0.9, duration: 0.9, type: "sine", gain: 0.14 },
  ],
}

let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  // Browsers start a fresh context "suspended" until a user gesture unlocks it — most
  // triggers here (button clicks) already are one, so this quietly no-ops otherwise.
  if (audioContext.state === "suspended") void audioContext.resume().catch(() => {})
  return audioContext
}

export function playSound(name: SoundName): void {
  if (!useSettingsStore.getState().soundEnabled) return

  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  for (const step of SOUND_RECIPES[name]) {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = step.type ?? "sine"
    osc.frequency.value = step.freq

    const startTime = now + step.startOffset
    const endTime = startTime + step.duration
    const peakGain = step.gain ?? 0.15

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.02, step.duration / 4))
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start(startTime)
    osc.stop(endTime + 0.05)
  }
}
