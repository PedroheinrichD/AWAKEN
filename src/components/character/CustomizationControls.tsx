import type { CharacterAppearance } from "@/data/types"
import { cn } from "@/lib/utils"

const BODY_OPTIONS: { value: CharacterAppearance["bodyType"]; label: string }[] = [
  { value: "esguio", label: "Esguio" },
  { value: "atletico", label: "Atlético" },
  { value: "robusto", label: "Robusto" },
]

const HAIR_STYLE_OPTIONS: { value: CharacterAppearance["hairStyle"]; label: string }[] = [
  { value: "raspado", label: "Raspado" },
  { value: "curto", label: "Curto" },
  { value: "longo", label: "Longo" },
  { value: "preso", label: "Preso" },
  { value: "moicano", label: "Moicano" },
  { value: "afro", label: "Afro" },
  { value: "trancas", label: "Tranças" },
]

const SKIN_TONES = ["#f2c9a1", "#dba876", "#c68a5e", "#a56a42", "#7a4a2b", "#4a2e1c"]
const HAIR_COLORS = ["#1c1a19", "#3b2417", "#6b4423", "#a85c2a", "#c9a227", "#e5e5e5", "#4cc9f0"]
const EYE_COLORS = ["#4cc9f0", "#46d67a", "#a78bfa", "#8b93a1", "#c68a5e", "#ff3b4e"]

interface CustomizationControlsProps {
  appearance: CharacterAppearance
  onChange: (next: CharacterAppearance) => void
}

export function CustomizationControls({ appearance, onChange }: CustomizationControlsProps) {
  function update<K extends keyof CharacterAppearance>(key: K, value: CharacterAppearance[K]) {
    onChange({ ...appearance, [key]: value })
  }

  return (
    <div className="space-y-6">
      <ChoiceRow
        label="Tipo de Corpo"
        options={BODY_OPTIONS}
        value={appearance.bodyType}
        onChange={(value) => update("bodyType", value)}
      />
      <ChoiceRow
        label="Estilo de Cabelo"
        options={HAIR_STYLE_OPTIONS}
        value={appearance.hairStyle}
        onChange={(value) => update("hairStyle", value)}
      />
      <SwatchRow label="Tom de Pele" colors={SKIN_TONES} value={appearance.skinTone} onChange={(value) => update("skinTone", value)} />
      <SwatchRow label="Cor do Cabelo" colors={HAIR_COLORS} value={appearance.hairColor} onChange={(value) => update("hairColor", value)} />
      <SwatchRow label="Cor dos Olhos" colors={EYE_COLORS} value={appearance.eyeColor} onChange={(value) => update("eyeColor", value)} />
    </div>
  )
}

interface ChoiceRowProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

function ChoiceRow<T extends string>({ label, options, value, onChange }: ChoiceRowProps<T>) {
  return (
    <div>
      <p className="mb-2 font-display text-[11px] font-semibold tracking-[0.2em] text-ink-tertiary uppercase">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "border px-3.5 py-1.5 font-display text-xs font-semibold tracking-wide uppercase transition-colors",
              value === option.value
                ? "border-system bg-system/10 text-system"
                : "border-surface-border text-ink-tertiary hover:text-ink-secondary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SwatchRow({
  label,
  colors,
  value,
  onChange,
}: {
  label: string
  colors: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-2 font-display text-[11px] font-semibold tracking-[0.2em] text-ink-tertiary uppercase">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-transform",
              value === color ? "scale-110 border-system" : "border-transparent hover:scale-105",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}
