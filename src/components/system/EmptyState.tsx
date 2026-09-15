import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { Eye } from "@phosphor-icons/react"

interface EmptyStateProps {
  title: string
  message: string
  icon?: PhosphorIcon
}

export function EmptyState({ title, message, icon: Icon = Eye }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-surface-border px-6 py-16 text-center">
      <Icon size={28} weight="light" className="text-ink-tertiary" />
      <div>
        <p className="font-display text-sm font-semibold tracking-[0.15em] text-ink-secondary uppercase">{title}</p>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-tertiary">{message}</p>
      </div>
    </div>
  )
}
