import {
  Backpack,
  CalendarStar,
  ChartBar,
  ClipboardText,
  Crosshair,
  House,
  MapTrifold,
  Medal,
  Shield,
  Skull,
  Sparkle,
  Storefront,
  Trophy,
  UserCircle,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"

export interface NavItem {
  path: string
  label: string
  icon: PhosphorIcon
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Início", icon: House },
  { path: "/personagem", label: "Personagem", icon: UserCircle },
  { path: "/missoes", label: "Missões", icon: ClipboardText },
  { path: "/bosses", label: "Bosses", icon: Skull },
  { path: "/equipamentos", label: "Equipamentos", icon: Shield },
  { path: "/inventario", label: "Inventário", icon: Backpack },
  { path: "/habilidades", label: "Habilidades", icon: Sparkle },
  { path: "/eventos", label: "Eventos", icon: CalendarStar },
  { path: "/mapa", label: "Mapa", icon: MapTrifold },
  { path: "/x1", label: "X1", icon: Crosshair },
  { path: "/conquistas", label: "Conquistas", icon: Trophy },
  { path: "/titulos", label: "Títulos", icon: Medal },
  { path: "/estatisticas", label: "Estatísticas", icon: ChartBar },
  { path: "/loja-eventos", label: "Loja de Eventos", icon: Storefront },
]
