import { Fire, Heart, Shield, Sword, Wind } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import type { Attributes } from "@/data/types"
import { percentage } from "@/lib/utils"

interface AttributeConfig {
  key: keyof Attributes
  label: string
  icon: PhosphorIcon
}

const ATTRIBUTES: AttributeConfig[] = [
  { key: "forca", label: "Força", icon: Sword },
  { key: "resistencia", label: "Resistência", icon: Shield },
  { key: "agilidade", label: "Agilidade", icon: Wind },
  { key: "vitalidade", label: "Vitalidade", icon: Heart },
  { key: "stamina", label: "Stamina", icon: Fire },
]

const ATTRIBUTE_CEILING = 60

interface AttributePanelProps {
  attributes: Attributes
}

export function AttributePanel({ attributes }: AttributePanelProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ATTRIBUTES.map(({ key, label, icon: Icon }) => {
        const value = attributes[key]
        const pct = percentage(value, ATTRIBUTE_CEILING)
        return (
          <div key={key} className="flex items-center gap-3">
            <Icon size={16} weight="regular" className="shrink-0 text-system" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs text-ink-secondary">{label}</span>
                <span className="font-mono text-xs text-ink-primary">{value}</span>
              </div>
              <div className="h-1 w-full bg-surface-2">
                <div className="h-full bg-system/70" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
