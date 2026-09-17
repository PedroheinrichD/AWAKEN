import type { CharacterAppearance, EquipmentSlotKey, IconKey } from "@/data/types"
import { ICON_MAP } from "@/lib/icons"
import { RARITY_CONFIG } from "@/lib/rarity"
import type { Rarity } from "@/lib/rarity"
import { cn } from "@/lib/utils"

interface CanvasItem {
  id: string
  name: string
  icon: IconKey
  rarity: Rarity
}

interface CharacterCanvasProps {
  appearance: CharacterAppearance
  equipment?: Partial<Record<EquipmentSlotKey, string>>
  items?: CanvasItem[]
  showCallouts?: boolean
  className?: string
}

const BODY_SCALE: Record<CharacterAppearance["bodyType"], number> = {
  esguio: 0.92,
  atletico: 1,
  robusto: 1.14,
}

const ANCHORS: Record<EquipmentSlotKey, { x: number; y: number; side: "left" | "right"; label: string }> = {
  cabeca: { x: 80, y: 38, side: "right", label: "Cabeça" },
  acessorio1: { x: 80, y: 68, side: "left", label: "Acessório" },
  corpo: { x: 80, y: 96, side: "right", label: "Corpo" },
  maos: { x: 48, y: 142, side: "left", label: "Mãos" },
  arma: { x: 112, y: 142, side: "right", label: "Arma" },
  acessorio2: { x: 80, y: 176, side: "left", label: "Acessório" },
  pernas: { x: 80, y: 190, side: "right", label: "Pernas" },
  pes: { x: 80, y: 288, side: "left", label: "Pés" },
}

const SLOT_ORDER: EquipmentSlotKey[] = [
  "cabeca",
  "corpo",
  "maos",
  "pernas",
  "pes",
  "arma",
  "acessorio1",
  "acessorio2",
]

export function CharacterCanvas({ appearance, equipment = {}, items = [], showCallouts = true, className }: CharacterCanvasProps) {
  const scale = BODY_SCALE[appearance.bodyType]

  const leftBadges = SLOT_ORDER.filter((slot) => ANCHORS[slot].side === "left")
  const rightBadges = SLOT_ORDER.filter((slot) => ANCHORS[slot].side === "right")

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg viewBox="0 0 160 300" className="h-full w-full max-w-md" role="img" aria-label="Personagem">
        <defs>
          <radialGradient id="canvas-base-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-system)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-system)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="canvas-body-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-3)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-surface-1)" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <ellipse cx="80" cy="292" rx="58" ry="10" fill="url(#canvas-base-glow)" />
        <ellipse
          cx="80"
          cy="292"
          rx="46"
          ry="6"
          fill="none"
          stroke="var(--color-system)"
          strokeOpacity="0.4"
          strokeWidth="1"
        />

        <g style={{ transformOrigin: "80px 190px", transform: `scaleX(${scale})` }}>
          {/* legs */}
          <polygon points="64,192 82,192 78,288 60,286" fill="url(#canvas-body-fill)" stroke="var(--color-system)" strokeOpacity="0.55" strokeWidth="1" />
          <polygon points="78,192 96,192 100,286 82,288" fill="url(#canvas-body-fill)" stroke="var(--color-system)" strokeOpacity="0.55" strokeWidth="1" />
          {/* pelvis */}
          <polygon points="56,170 104,170 96,192 64,192" fill="url(#canvas-body-fill)" stroke="var(--color-system)" strokeOpacity="0.6" strokeWidth="1" />
          {/* arms */}
          <polygon points="50,80 68,82 62,140 46,138" fill="url(#canvas-body-fill)" stroke="var(--color-system)" strokeOpacity="0.55" strokeWidth="1" />
          <polygon points="92,82 110,80 114,138 98,140" fill="url(#canvas-body-fill)" stroke="var(--color-system)" strokeOpacity="0.55" strokeWidth="1" />
          {/* hands */}
          <circle cx="46" cy="144" r="6" fill={appearance.skinTone} fillOpacity="0.85" stroke="var(--color-system)" strokeOpacity="0.4" />
          <circle cx="114" cy="144" r="6" fill={appearance.skinTone} fillOpacity="0.85" stroke="var(--color-system)" strokeOpacity="0.4" />
          {/* torso */}
          <polygon points="50,76 110,76 104,120 56,120" fill="url(#canvas-body-fill)" stroke="var(--color-system)" strokeOpacity="0.65" strokeWidth="1.2" />
          <polygon points="56,120 104,120 100,170 60,170" fill="url(#canvas-body-fill)" stroke="var(--color-system)" strokeOpacity="0.6" strokeWidth="1" />
        </g>

        {/* neck */}
        <polygon points="72,64 88,64 90,76 70,76" fill={appearance.skinTone} fillOpacity="0.85" stroke="var(--color-system)" strokeOpacity="0.4" />

        {/* head */}
        <polygon
          points="80,18 98,30 98,54 80,66 62,54 62,30"
          fill={appearance.skinTone}
          fillOpacity="0.9"
          stroke="var(--color-system)"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />
        <circle cx="86" cy="40" r="2.2" fill={appearance.eyeColor} />

        <HairShape style={appearance.hairStyle} color={appearance.hairColor} />

        {SLOT_ORDER.map((slot) => {
          const itemId = equipment[slot]
          const item = itemId ? items.find((candidate) => candidate.id === itemId) : undefined
          if (!item) return null
          return <EquipmentGlyph key={slot} anchor={ANCHORS[slot]} item={item} />
        })}
      </svg>

      {showCallouts ? (
        <>
          <CalloutColumn slots={leftBadges} equipment={equipment} items={items} align="left" />
          <CalloutColumn slots={rightBadges} equipment={equipment} items={items} align="right" />
        </>
      ) : null}
    </div>
  )
}

/** Equipped item worn on the silhouette itself: a rarity-glowing socket at the slot's
 * anchor point, with the item's own icon inside — reuses the same icon/rarity language
 * as the side callouts instead of hand-drawn per-item art (claude.md §16/§36). */
function EquipmentGlyph({ anchor, item }: { anchor: { x: number; y: number }; item: CanvasItem }) {
  const Icon = ICON_MAP[item.icon]
  const color = `var(--color-${RARITY_CONFIG[item.rarity].slug})`

  return (
    <g>
      <circle cx={anchor.x} cy={anchor.y} r="10" fill={color} fillOpacity="0.18" />
      <circle cx={anchor.x} cy={anchor.y} r="9" fill="none" stroke={color} strokeWidth="1.2" strokeOpacity="0.85" />
      <foreignObject x={anchor.x - 7} y={anchor.y - 7} width="14" height="14">
        <div className="flex h-full w-full items-center justify-center" style={{ color }}>
          <Icon size={12} weight="fill" />
        </div>
      </foreignObject>
    </g>
  )
}

function HairShape({ style, color }: { style: CharacterAppearance["hairStyle"]; color: string }) {
  if (style === "raspado") return null
  if (style === "longo") {
    return (
      <>
        <path d="M60,30 Q80,8 100,30 L100,38 Q80,20 60,38 Z" fill={color} />
        <polygon points="60,32 66,32 62,84 56,80" fill={color} fillOpacity="0.9" />
        <polygon points="100,32 94,32 98,84 104,80" fill={color} fillOpacity="0.9" />
      </>
    )
  }
  if (style === "preso") {
    return (
      <>
        <path d="M62,30 Q80,10 98,30 L98,36 Q80,22 62,36 Z" fill={color} />
        <circle cx="96" cy="34" r="6" fill={color} />
      </>
    )
  }
  if (style === "moicano") {
    return (
      <>
        <polygon points="72,10 76,24 68,24" fill={color} />
        <polygon points="80,2 85,22 75,22" fill={color} />
        <polygon points="88,10 92,24 84,24" fill={color} />
      </>
    )
  }
  if (style === "afro") {
    return (
      <path
        d="M54,38 Q50,8 80,4 Q110,8 106,38 Q106,24 96,16 Q80,8 64,16 Q54,24 54,38 Z"
        fill={color}
        fillOpacity="0.95"
      />
    )
  }
  if (style === "trancas") {
    return (
      <>
        <path d="M60,30 Q80,8 100,30 L100,36 Q80,20 60,36 Z" fill={color} />
        <polygon points="64,32 68,32 66,90 62,86" fill={color} fillOpacity="0.9" />
        <polygon points="74,34 78,34 76,94 72,90" fill={color} fillOpacity="0.9" />
        <polygon points="82,34 86,34 88,94 84,90" fill={color} fillOpacity="0.9" />
        <polygon points="92,32 96,32 98,90 94,86" fill={color} fillOpacity="0.9" />
      </>
    )
  }
  return <path d="M62,30 Q80,10 98,30 L98,36 Q80,22 62,36 Z" fill={color} />
}

function CalloutColumn({
  slots,
  equipment,
  items,
  align,
}: {
  slots: EquipmentSlotKey[]
  equipment: Partial<Record<EquipmentSlotKey, string>>
  items: CanvasItem[]
  align: "left" | "right"
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 flex h-full flex-col justify-between py-4",
        align === "left" ? "left-0" : "right-0",
      )}
    >
      {slots.map((slot) => {
        const itemId = equipment[slot]
        const item = itemId ? items.find((candidate) => candidate.id === itemId) : undefined
        const Icon = item ? ICON_MAP[item.icon] : ICON_MAP.scroll
        const rarityColor = item ? `var(--color-${RARITY_CONFIG[item.rarity].slug})` : "var(--color-ink-disabled)"
        const anchor = ANCHORS[slot]

        return (
          <div
            key={slot}
            className={cn("flex items-center gap-2 text-[10px]", align === "right" ? "flex-row-reverse text-right" : "text-left")}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center border bg-surface-1/90"
              style={{ borderColor: rarityColor, boxShadow: `0 0 10px color-mix(in srgb, ${rarityColor} 35%, transparent)` }}
            >
              <Icon size={14} weight="regular" style={{ color: rarityColor }} />
            </div>
            <div className="hidden sm:block">
              <p className="font-display uppercase tracking-[0.15em] text-ink-tertiary">{anchor.label}</p>
              <p className="max-w-[110px] truncate text-ink-secondary">{item ? item.name : "Vazio"}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
