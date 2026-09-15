import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PanelAccent = "system" | "danger" | "gold" | "neutral"

const ACCENT_BORDER: Record<PanelAccent, string> = {
  system: "border-t-system",
  danger: "border-t-danger",
  gold: "border-t-gold",
  neutral: "border-t-surface-border-strong",
}

interface SystemPanelProps {
  children: ReactNode
  className?: string
  accent?: PanelAccent
  label?: ReactNode
  corners?: boolean
}

export function SystemPanel({ children, className, accent = "neutral", label, corners = true }: SystemPanelProps) {
  return (
    <div
      className={cn(
        "relative border border-surface-border border-t-2 bg-surface-1/90",
        ACCENT_BORDER[accent],
        className,
      )}
    >
      {corners ? <PanelCorners /> : null}
      {label ? (
        <div className="border-b border-surface-border px-4 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-tertiary">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  )
}

function PanelCorners() {
  const base = "pointer-events-none absolute h-2.5 w-2.5 border-surface-border-strong"
  return (
    <>
      <span className={cn(base, "-top-px -left-px border-t border-l")} />
      <span className={cn(base, "-top-px -right-px border-t border-r")} />
      <span className={cn(base, "-bottom-px -left-px border-b border-l")} />
      <span className={cn(base, "-bottom-px -right-px border-b border-r")} />
    </>
  )
}
