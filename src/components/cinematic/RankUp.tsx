import { RankBadge } from "@/components/hud/RankBadge"
import { RANK_CONFIG } from "@/lib/rank"
import type { Rank } from "@/lib/rank"
import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { useGsapContext } from "@/lib/useGsapContext"

interface RankUpProps {
  from: Rank
  to: Rank
  onDismiss: () => void
}

export function RankUp({ from, to, onDismiss }: RankUpProps) {
  const scope = useGsapContext<HTMLDivElement>(() => {
    const tl = gsap.timeline()
    tl.from(".rankup-backdrop", { autoAlpha: 0, duration: 0.5 })
      .from(".rankup-label", { autoAlpha: 0, letterSpacing: "0.9em", duration: 0.8, ease: "power4.out" })
      .from(".rankup-from", { autoAlpha: 0, scale: 0.8, duration: 0.5 }, "-=0.2")
      .to(".rankup-from", { autoAlpha: 0, scale: 0.6, duration: 0.5, ease: "power3.in" }, "+=0.6")
      .fromTo(
        ".rankup-flash",
        { scale: 0, autoAlpha: 0.8 },
        { scale: 3.4, autoAlpha: 0, duration: 0.8, ease: "power2.out" },
        "-=0.35",
      )
      .fromTo(
        ".rankup-to",
        { autoAlpha: 0, scale: 0.5 },
        { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)" },
        "-=0.55",
      )
      .from(".rankup-danger", { autoAlpha: 0, y: 10, duration: 0.5 }, "-=0.15")
      .from(".rankup-footer", { autoAlpha: 0, y: 8, duration: 0.5 }, "-=0.1")

    if (prefersReducedMotion()) tl.timeScale(40)
  }, [])

  return (
    <div ref={scope} className="fixed inset-0 z-90 flex items-center justify-center px-6" onClick={onDismiss}>
      <div className="rankup-backdrop absolute inset-0 bg-void/92 backdrop-blur-md" />
      <div
        className="rankup-flash pointer-events-none absolute h-32 w-32 rounded-full opacity-0"
        style={{ backgroundColor: `var(--color-${RANK_CONFIG[to].slug})`, filter: "blur(20px)" }}
      />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <p className="rankup-label font-display text-sm font-bold tracking-[0.5em] text-gold uppercase">
          Promoção de Rank
        </p>

        <div className="relative flex h-32 items-center justify-center">
          <div className="rankup-from absolute">
            <RankBadge rank={from} size="lg" />
          </div>
          <div className="rankup-to absolute opacity-0">
            <RankBadge rank={to} size="lg" />
          </div>
        </div>

        <p className="rankup-danger font-mono text-xs tracking-[0.2em] text-ink-secondary uppercase">
          {from} → {to} · Nível de ameaça: {RANK_CONFIG[to].danger}
        </p>

        <p className="rankup-footer max-w-sm font-mono text-xs leading-relaxed text-ink-secondary">
          Poucos alcançam este patamar. O Sistema reconheceu sua evolução.
        </p>
        <p className="rankup-footer font-mono text-[10px] tracking-[0.2em] text-ink-tertiary uppercase">
          Toque para continuar
        </p>
      </div>
    </div>
  )
}
