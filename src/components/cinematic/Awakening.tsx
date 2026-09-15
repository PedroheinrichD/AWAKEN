import { ICON_MAP } from "@/lib/icons"
import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { useGsapContext } from "@/lib/useGsapContext"
import type { Skill } from "@/data/types"

interface AwakeningProps {
  skill: Skill
  onDismiss: () => void
}

export function Awakening({ skill, onDismiss }: AwakeningProps) {
  const Icon = ICON_MAP[skill.icon]

  const scope = useGsapContext<HTMLDivElement>(() => {
    const tl = gsap.timeline()
    tl.from(".awaken-backdrop", { autoAlpha: 0, duration: 0.6 })
      .set(".awaken-flicker", { autoAlpha: 0 })
      .to(".awaken-flicker", { autoAlpha: 1, duration: 0.04 })
      .to(".awaken-flicker", { autoAlpha: 0.15, duration: 0.05 })
      .to(".awaken-flicker", { autoAlpha: 1, duration: 0.04 })
      .to(".awaken-flicker", { autoAlpha: 0.3, duration: 0.08 })
      .to(".awaken-flicker", { autoAlpha: 1, duration: 0.3 })
      .from(".awaken-detected", { autoAlpha: 0, y: 8, duration: 0.5 }, "-=0.1")
      .from(".awaken-icon", { autoAlpha: 0, scale: 0.6, duration: 0.6, ease: "back.out(1.8)" }, "+=0.2")
      .fromTo(
        ".awaken-name",
        { autoAlpha: 0, y: 16, filter: "blur(6px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power4.out" },
        "-=0.3",
      )
      .from(".awaken-body", { autoAlpha: 0, y: 10, duration: 0.5 }, "-=0.2")
      .from(".awaken-footer", { autoAlpha: 0, duration: 0.5 }, "-=0.1")

    if (prefersReducedMotion()) tl.timeScale(40)
  }, [])

  return (
    <div ref={scope} className="fixed inset-0 z-95 flex items-center justify-center px-6" onClick={onDismiss}>
      <div className="awaken-backdrop absolute inset-0 bg-void/95" />
      <div className="relative flex max-w-md flex-col items-center gap-4 text-center">
        <p className="awaken-flicker font-mono text-[11px] tracking-[0.5em] text-ink-tertiary uppercase">System</p>
        <p className="awaken-detected font-display text-sm font-bold tracking-[0.35em] text-gold uppercase">
          Despertar Detectado
        </p>

        <div className="awaken-icon flex h-16 w-16 items-center justify-center border border-gold/50 bg-surface-1">
          <Icon size={30} weight="regular" className="text-gold" />
        </div>

        <p className="awaken-name text-shimmer-gold font-display text-4xl font-bold sm:text-5xl">{skill.name}</p>

        <div className="awaken-body space-y-2">
          <p className="text-sm text-ink-secondary italic">{skill.description}</p>
          <p className="text-sm text-ink-primary">{skill.effect}</p>
        </div>

        <p className="awaken-footer font-mono text-[10px] tracking-[0.2em] text-ink-tertiary uppercase">
          Toque para continuar
        </p>
      </div>
    </div>
  )
}
