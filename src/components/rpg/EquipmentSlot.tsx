import type { Item } from "@/data/types"
import { ICON_MAP } from "@/lib/icons"
import { RARITY_CONFIG } from "@/lib/rarity"
import { cn } from "@/lib/utils"

interface EquipmentSlotProps {
  label: string
  item?: Item
  onClick?: () => void
}

export function EquipmentSlot({ label, item, onClick }: EquipmentSlotProps) {
  const Icon = item ? ICON_MAP[item.icon] : null
  const colorVar = item ? `var(--color-${RARITY_CONFIG[item.rarity].slug})` : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-1.5 border bg-surface-1 p-2 transition-colors",
        onClick ? "cursor-pointer hover:border-system" : "cursor-default",
      )}
      style={{
        borderColor: colorVar ?? "var(--color-surface-border)",
        boxShadow: colorVar ? `0 0 14px color-mix(in srgb, ${colorVar} 30%, transparent)` : undefined,
      }}
    >
      {item && Icon ? (
        <Icon size={22} weight="regular" style={{ color: colorVar }} />
      ) : (
        <span className="h-5 w-5 rounded-full border border-dashed border-surface-border-strong" />
      )}
      <span className="text-center text-[9px] leading-tight tracking-[0.12em] text-ink-tertiary uppercase">
        {label}
      </span>
    </button>
  )
}
