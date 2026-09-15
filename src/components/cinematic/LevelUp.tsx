import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { useGsapContext } from "@/lib/useGsapContext"

interface LevelUpProps {
  from: number
  to: number
  onDismiss: () => void
}

export function LevelUp({ from, to, onDismiss }: LevelUpProps) {
  const scope = useGsapContext<HTMLDivElement>(() => {
    const tl = gsap.timeline()
    tl.from(".levelup-backdrop", { autoAlpha: 0, duration: 0.4 })
      .from(".levelup-label", { autoAlpha: 0, y: 12, duration: 0.5 }, "-=0.1")
      .from(".levelup-from", { autoAlpha: 0, duration: 0.3 }, "-=0.1")
      .to(".levelup-from", { autoAlpha: 0, y: -24, duration: 0.5, ease: "power3.in" }, "+=0.5")
      .fromTo(
        ".levelup-to",
        { autoAlpha: 0, y: 24, scale: 0.85 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power4.out" },
        "-=0.3",
      )
      .from(".levelup-footer", { autoAlpha: 0, y: 8, duration: 0.5 }, "-=0.1")

    if (prefersReducedMotion()) tl.timeScale(40)
  }, [])

  return (
    <div ref={scope} className="fixed inset-0 z-90 flex items-center justify-center px-6" onClick={onDismiss}>
      <div className="levelup-backdrop absolute inset-0 bg-void/90 backdrop-blur-sm" />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <p className="levelup-label font-display text-sm font-bold tracking-[0.5em] text-system uppercase">
          Level Up
        </p>
        <div className="relative flex h-28 items-center justify-center">
          <p className="levelup-from absolute font-display text-7xl font-bold text-ink-tertiary">{from}</p>
          <p className="levelup-to absolute font-display text-8xl font-bold text-ink-primary opacity-0">{to}</p>
        </div>
        <p className="levelup-footer font-mono text-xs text-ink-secondary">
          Novo patamar alcançado. Atributos e XP redefinidos para a próxima jornada.
        </p>
        <p className="levelup-footer font-mono text-[10px] tracking-[0.2em] text-ink-tertiary uppercase">
          Toque para continuar
        </p>
      </div>
    </div>
  )
}
