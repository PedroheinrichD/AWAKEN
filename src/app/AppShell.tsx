import { List, X } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { DiagnosticsPanel } from "@/components/system/DiagnosticsPanel"
import { OverlayLayer } from "@/components/system/OverlayLayer"
import { PlayerHUD } from "@/components/hud/PlayerHUD"
import { NAV_ITEMS } from "@/lib/nav"
import { useLenis } from "@/lib/useLenis"
import { cn } from "@/lib/utils"

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  useLenis()

  return (
    <div className="min-h-dvh bg-void">
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Abrir navegação"
          className="flex h-11 w-11 shrink-0 items-center justify-center border-r border-b border-surface-border text-ink-secondary"
        >
          <List size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <PlayerHUD />
        </div>
      </div>
      <div className="hidden lg:block">
        <PlayerHUD />
      </div>

      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-[calc(100dvh)] w-56 shrink-0 overflow-y-auto border-r border-surface-border lg:block">
          <NavList onNavigate={() => undefined} />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {navOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-void/85 backdrop-blur-sm"
              onClick={() => setNavOpen(false)}
            />
            <motion.div
              className="relative flex h-full w-72 flex-col border-r border-surface-border bg-surface-0"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between border-b border-surface-border p-4">
                <p className="font-display text-sm font-bold tracking-[0.3em] text-ink-primary">AWAKEN</p>
                <button type="button" onClick={() => setNavOpen(false)} aria-label="Fechar navegação">
                  <X size={18} className="text-ink-tertiary" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavList onNavigate={() => setNavOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <DiagnosticsPanel />
      <OverlayLayer />
    </div>
  )
}

function NavList({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 font-display text-[13px] font-medium tracking-wide transition-colors",
              isActive
                ? "border-l-2 border-system bg-system/10 text-system"
                : "border-l-2 border-transparent text-ink-tertiary hover:text-ink-primary",
            )
          }
        >
          <item.icon size={17} weight="regular" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
