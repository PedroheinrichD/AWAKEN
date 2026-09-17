import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react"
import { playSound } from "@/lib/audio/soundEngine"
import { cn } from "@/lib/utils"
import { useSettingsStore } from "@/store/useSettingsStore"

export function SettingsScreen() {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled)

  function toggleSound() {
    const next = !soundEnabled
    setSoundEnabled(next)
    if (next) playSound("confirm")
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Configuração</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Opções</h1>
      </div>

      <div className="border border-surface-border bg-surface-1 p-5">
        <p className="mb-4 font-display text-[11px] font-semibold tracking-[0.24em] text-ink-tertiary uppercase">Áudio do Sistema</p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {soundEnabled ? (
              <SpeakerHigh size={20} className="mt-0.5 shrink-0 text-system" />
            ) : (
              <SpeakerSlash size={20} className="mt-0.5 shrink-0 text-ink-tertiary" />
            )}
            <div>
              <p className="font-display text-sm font-semibold text-ink-primary">Sons do Sistema</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-secondary">
                Sinais sonoros para eventos do Sistema: início de sessão, evolução, confrontos e outras ocorrências.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={toggleSound}
            className={cn(
              "relative h-7 w-14 shrink-0 border transition-colors",
              soundEnabled ? "border-system bg-system/20" : "border-surface-border-strong bg-surface-2",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 transition-[left] duration-200",
                soundEnabled ? "left-7 bg-system" : "left-0.5 bg-ink-tertiary",
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
