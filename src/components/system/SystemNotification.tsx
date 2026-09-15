import { motion } from "motion/react"
import { ICON_MAP } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { IconKey } from "@/data/types"

type NotificationTone = "system" | "danger" | "gold"

interface SystemNotificationProps {
  icon: IconKey
  title: string
  message: string
  tone?: NotificationTone
  meta?: string
}

const TONE_TEXT: Record<NotificationTone, string> = {
  system: "text-system",
  danger: "text-danger",
  gold: "text-gold",
}

export function SystemNotification({ icon, title, message, tone = "system", meta }: SystemNotificationProps) {
  const Icon = ICON_MAP[icon]
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 border-l-2 border-surface-border-strong py-2.5 pl-3"
    >
      <Icon size={18} weight="regular" className={cn("mt-0.5 shrink-0", TONE_TEXT[tone])} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-primary">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{message}</p>
      </div>
      {meta ? <span className="shrink-0 font-mono text-[10px] text-ink-tertiary">{meta}</span> : null}
    </motion.div>
  )
}
