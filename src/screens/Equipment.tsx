import { useState } from "react"
import { ItemCard } from "@/components/rpg/ItemCard"
import { InventoryGrid } from "@/components/rpg/InventoryGrid"
import { EmptyState } from "@/components/system/EmptyState"
import { ITEMS } from "@/data/items"
import type { ItemCategory } from "@/data/types"
import { meetsRequirements } from "@/lib/requirements"
import { cn } from "@/lib/utils"
import { useGameStore } from "@/store/useGameStore"

const EQUIPABLE_CATEGORIES: ItemCategory[] = ["arma", "armadura", "roupa", "acessorio"]

const CATEGORY_LABELS: Record<"todos" | ItemCategory, string> = {
  todos: "Todos",
  arma: "Armas",
  armadura: "Armaduras",
  roupa: "Roupas",
  acessorio: "Acessórios",
  item: "Itens",
  pocao: "Poções",
  itemMagico: "Itens Mágicos",
}

const EQUIPABLE_ITEMS = ITEMS.filter((item) => EQUIPABLE_CATEGORIES.includes(item.category))

export function EquipmentScreen() {
  const [filter, setFilter] = useState<"todos" | ItemCategory>("todos")
  const character = useGameStore((state) => state.character)
  const equipItem = useGameStore((state) => state.equipItem)

  const visibleItems = EQUIPABLE_ITEMS.filter((item) => filter === "todos" || item.category === filter)

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Armazenamento</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Equipamentos</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["todos", ...EQUIPABLE_CATEGORIES] as const).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            className={cn(
              "border px-3.5 py-1.5 font-display text-xs font-semibold tracking-wide uppercase transition-colors",
              filter === category
                ? "border-system bg-system/10 text-system"
                : "border-surface-border text-ink-tertiary hover:text-ink-secondary",
            )}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <EmptyState title="Nada por aqui" message="Nenhum item desta categoria foi encontrado ainda." />
      ) : (
        <InventoryGrid>
          {visibleItems.map((item) => {
            const locked = !meetsRequirements(character, item)
            const equipped = Boolean(item.slot && character.equipment[item.slot] === item.id)
            return (
              <ItemCard
                key={item.id}
                item={item}
                locked={locked}
                equipped={equipped}
                onClick={item.slot ? () => equipItem(item.slot!, item.id) : undefined}
              />
            )
          })}
        </InventoryGrid>
      )}
    </div>
  )
}
