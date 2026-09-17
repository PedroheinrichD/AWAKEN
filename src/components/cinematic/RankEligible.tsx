import { useNavigate } from "react-router-dom"
import { RankBadge } from "@/components/hud/RankBadge"
import { RANK_CONFIG } from "@/lib/rank"
import type { Rank } from "@/lib/rank"
import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { useGsapContext } from "@/lib/useGsapContext"

interface RankEligibleProps {
  rank: Rank
  minLevel: number
  onDismiss: () => void
}

/**
 * Fires once, the exact moment a level-up crosses the next rank's minimum level
 * (see xp.service.ts's rankPromotionJustUnlocked) — a heads-up, not the promotion
 * itself. Reaching the level is only half the requirement (a trial Boss may still
 * be needed), so this points the player at Character.tsx's existing promotion
 * panel to see exactly what's left, rather than claiming the rank is already won.
 */
export function RankEligible({ rank, minLevel, onDismiss }: RankEligibleProps) {
  const navigate = useNavigate()

  const scope = useGsapContext<HTMLDivElement>(() => {
    const tl = gsap.timeline()
    tl.from(".eligible-backdrop", { autoAlpha: 0, duration: 0.4 })
      .from(".eligible-label", { autoAlpha: 0, y: 10, duration: 0.5 }, "-=0.1")
      .fromTo(
        ".eligible-badge",
        { autoAlpha: 0, scale: 0.7, filter: "blur(8px)" },
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "back.out(1.6)" },
        "-=0.2",
      )
      .from(".eligible-body", { autoAlpha: 0, y: 8, duration: 0.5 }, "-=0.2")
      .from(".eligible-cta", { autoAlpha: 0, y: 8, duration: 0.4 }, "-=0.15")

    if (prefersReducedMotion()) tl.timeScale(40)
  }, [])

  function viewRequirements() {
    onDismiss()
    navigate("/personagem")
  }

  return (
    <div ref={scope} className="fixed inset-0 z-90 flex items-center justify-center px-6">
      <div className="eligible-backdrop absolute inset-0 bg-void/90 backdrop-blur-md" onClick={onDismiss} />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <p className="eligible-label font-display text-sm font-bold tracking-[0.5em] text-system uppercase">Sistema</p>

        <div className="eligible-badge">
          <RankBadge rank={rank} size="lg" />
        </div>

        <p className="eligible-body max-w-sm font-mono text-xs leading-relaxed text-ink-secondary">
          Nível {minLevel} alcançado. Uma promoção ao Rank {rank} está ao seu alcance — nível de ameaça{" "}
          <span style={{ color: `var(--color-${RANK_CONFIG[rank].slug})` }}>{RANK_CONFIG[rank].danger}</span>.
        </p>

        <div className="eligible-cta flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="border border-surface-border-strong px-5 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-ink-tertiary uppercase transition-colors hover:text-ink-primary"
          >
            Depois
          </button>
          <button
            type="button"
            onClick={viewRequirements}
            className="border border-system bg-system/10 px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20"
          >
            Ver Requisitos
          </button>
        </div>
      </div>
    </div>
  )
}
