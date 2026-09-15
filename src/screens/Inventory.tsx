import { useState } from "react"
import { ItemCard } from "@/components/rpg/ItemCard"
import { InventoryGrid } from "@/components/rpg/InventoryGrid"
import { EmptyState } from "@/components/system/EmptyState"
import { ITEMS } from "@/data/items"
import type { ItemCategory } from "@/data/types"
import { meetsRequirements } from "@/lib/requirements"
import { cn } from "@/lib/utils"
import { useGameStore } from "@/store/useGameStore"

const CONSUMABLE_CATEGORIES: ItemCategory[] = ["item", "pocao", "itemMagico"]

const CATEGORY_LABELS: Record<"todos" | ItemCategory, string> = {
  todos: "Todos",
  item: "Itens",
  pocao: "Poções",
  itemMagico: "Itens Mágicos",
  arma: "Armas",
  armadura: "Armaduras",
  roupa: "Roupas",
  acessorio: "Acessórios",
}

const CONSUMABLE_ITEMS = ITEMS.filter((item) => CONSUMABLE_CATEGORIES.includes(item.category))

export function InventoryScreen() {
  const [filter, setFilter] = useState<"todos" | ItemCategory>("todos")
  const character = useGameStore((state) => state.character)

  const visibleItems = CONSUMABLE_ITEMS.filter((item) => filter === "todos" || item.category === filter)

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-system uppercase">Posses</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-primary">Inventário</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["todos", ...CONSUMABLE_CATEGORIES] as const).map((category) => (
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
        <EmptyState title="Inventário vazio" message="Nenhum item desta categoria foi coletado ainda." />
      ) : (
        <InventoryGrid>
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} locked={!meetsRequirements(character, item)} />
          ))}
        </InventoryGrid>
      )}
    </div>
  )
}
