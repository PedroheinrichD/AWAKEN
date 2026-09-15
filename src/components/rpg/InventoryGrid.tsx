import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface InventoryGridProps {
  children: ReactNode
  className?: string
}

export function InventoryGrid({ children, className }: InventoryGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {children}
    </div>
  )
}
