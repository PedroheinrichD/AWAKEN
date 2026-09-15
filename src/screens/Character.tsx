import { useNavigate } from "react-router-dom"
import { CharacterCanvas } from "@/components/character/CharacterCanvas"
import { AttributePanel } from "@/components/hud/AttributePanel"
import { HPBar } from "@/components/hud/HPBar"
import { LevelBadge } from "@/components/hud/LevelBadge"
import { RankBadge } from "@/components/hud/RankBadge"
import { XPBar } from "@/components/hud/XPBar"
import { EquipmentSlot } from "@/components/rpg/EquipmentSlot"
import { SystemPanel } from "@/components/system/SystemPanel"
import { getItem } from "@/data/items"
import type { EquipmentSlotKey } from "@/data/types"
import { TITLES } from "@/data/titles"
import { useGameStore } from "@/store/useGameStore"

const SLOT_LABELS: Record<EquipmentSlotKey, string> = {
  cabeca: "Cabeça",
  corpo: "Corpo",
  maos: "Mãos",
  pernas: "Pernas",
  pes: "Pés",
  arma: "Arma",
  acessorio1: "Acessório I",
  acessorio2: "Acessório II",
}

const SLOT_ORDER: EquipmentSlotKey[] = ["arma", "cabeca", "corpo", "maos", "pernas", "pes", "acessorio1", "acessorio2"]

export function CharacterScreen() {
  const character = useGameStore((state) => state.character)
  const equippedTitle = TITLES.find((title) => title.id === character.equippedTitle)
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div className="space-y-6">
        <SystemPanel accent="system" className="flex flex-col items-center p-6 text-center">
          <CharacterCanvas appearance={character.appearance} equipment={character.equipment} className="h-80 w-full" />
          <p className="mt-2 font-display text-2xl font-bold text-ink-primary">{character.name}</p>
          <p className="text-sm text-system">{equippedTitle ? equippedTitle.name : "Sem título equipado"}</p>
          <div className="mt-4 flex items-center gap-4">
            <RankBadge rank={character.rank} size="lg" />
            <LevelBadge level={character.level} />
          </div>
        </SystemPanel>

        <SystemPanel label="Vitalidade" className="space-y-4 p-5">
          <HPBar current={character.hp} max={character.hpMax} />
          <XPBar current={character.xp} max={character.xpToNext} />
        </SystemPanel>
      </div>

      <div className="space-y-6">
        <SystemPanel label="Atributos" className="p-5">
          <AttributePanel attributes={character.attributes} />
        </SystemPanel>

        <SystemPanel label="Equipamentos" className="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SLOT_ORDER.map((slot) => {
              const itemId = character.equipment[slot]
              const item = itemId ? getItem(itemId) : undefined
              return (
                <EquipmentSlot
                  key={slot}
                  label={SLOT_LABELS[slot]}
                  item={item}
                  onClick={() => navigate("/equipamentos")}
                />
              )
            })}
          </div>
        </SystemPanel>
      </div>
    </div>
  )
}
