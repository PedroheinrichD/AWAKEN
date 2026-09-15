import { useState } from "react"
import { ItemCard } from "@/components/rpg/ItemCard"
import { InventoryGrid } from "@/components/rpg/InventoryGrid"
import { EmptyState } from "@/components/system/EmptyState"
import type { ItemCategory } from "@/data/types"
import { meetsRequirements } from "@/lib/requirements"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

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

export function EquipmentScreen() {
  const [filter, setFilter] = useState<"todos" | ItemCategory>("todos")
  const utils = trpc.useUtils()
  const { data: character } = trpc.character.getActive.useQuery()
  const { data: inventory } = trpc.items.inventory.useQuery()
  const equipItem = trpc.character.equipItem.useMutation({
    onSuccess: () => {
      utils.character.getActive.invalidate()
    },
  })

  const equipable = (inventory ?? []).filter((item) => EQUIPABLE_CATEGORIES.includes(item.category))
  const visibleItems = equipable.filter((item) => filter === "todos" || item.category === filter)

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

      {!character || visibleItems.length === 0 ? (
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
                onClick={item.slot ? () => equipItem.mutate({ itemId: item.id }) : undefined}
              />
            )
          })}
        </InventoryGrid>
      )}
    </div>
  )
}
