import { motion } from "motion/react"

interface NoCharacterScreenProps {
  onCreate: () => void
}

export function NoCharacterScreen({ onCreate }: NoCharacterScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-void px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <p className="font-mono text-[11px] tracking-[0.4em] text-ink-tertiary uppercase">Sistema</p>
        <p className="font-display text-2xl font-bold tracking-wide text-ink-primary sm:text-3xl">
          NENHUM JOGADOR DETECTADO
        </p>
        <p className="max-w-sm text-sm text-ink-secondary">Sua jornada ainda não começou.</p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onCreate}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="border border-system bg-system/10 px-8 py-3 font-display text-sm font-bold tracking-[0.3em] text-system uppercase transition-colors hover:bg-system/20"
      >
        Criar Personagem
      </motion.button>
    </div>
  )
}
