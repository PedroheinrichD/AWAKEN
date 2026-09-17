import { useRef } from "react"
import { RankBadge } from "@/components/hud/RankBadge"
import type { Boss } from "@/data/types"
import { playSound } from "@/lib/audio/soundEngine"
import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { useGsapContext } from "@/lib/useGsapContext"

interface BossEncounterIntroProps {
  boss: Boss
  onComplete: () => void
}

export function BossEncounterIntro({ boss, onComplete }: BossEncounterIntroProps) {
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const scope = useGsapContext<HTMLDivElement>(() => {
    const tl = gsap.timeline({ onComplete: () => onCompleteRef.current() })
    tl.from(".encounter-bar-top", { yPercent: -100, duration: 0.5, ease: "power3.out", onStart: () => playSound("bossEncounter") })
      .from(".encounter-bar-bottom", { yPercent: 100, duration: 0.5, ease: "power3.out" }, "<")
      .from(".encounter-rank", { autoAlpha: 0, scale: 0.7, duration: 0.5 }, "-=0.1")
      .from(".encounter-name", { autoAlpha: 0, y: 10, duration: 0.5 }, "-=0.2")
      .from(".encounter-warning", { autoAlpha: 0, duration: 0.4 }, "-=0.1")
      .to(".encounter-rank, .encounter-name, .encounter-warning", { autoAlpha: 0, duration: 0.4 }, "+=1")
      .to(".encounter-bar-top", { yPercent: -100, duration: 0.5, ease: "power3.in" }, "-=0.1")
      .to(".encounter-bar-bottom", { yPercent: 100, duration: 0.5, ease: "power3.in" }, "<")

    if (prefersReducedMotion()) tl.timeScale(40)
  }, [])

  return (
    <div ref={scope} className="fixed inset-0 z-85 flex items-center justify-center bg-void">
      <div className="encounter-bar-top absolute inset-x-0 top-0 h-1/2 border-b border-danger/30 bg-void" />
      <div className="encounter-bar-bottom absolute inset-x-0 bottom-0 h-1/2 border-t border-danger/30 bg-void" />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="encounter-rank">
          <RankBadge rank={boss.rank} size="lg" />
        </div>
        <p className="encounter-name font-display text-4xl font-bold text-ink-primary">{boss.name}</p>
        <p className="encounter-warning font-mono text-xs tracking-[0.3em] text-danger uppercase">Combate Iniciado</p>
      </div>
    </div>
  )
}
