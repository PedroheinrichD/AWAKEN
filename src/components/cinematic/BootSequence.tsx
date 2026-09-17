import { useEffect, useRef } from "react"
import { playSound } from "@/lib/audio/soundEngine"
import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { useGsapContext } from "@/lib/useGsapContext"

const LOADING_LINES = [
  "Sincronizando atributos do caçador...",
  "Verificando integridade da jornada...",
  "Carregando módulos de combate...",
  "Estabelecendo conexão com o Sistema...",
]

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const reduced = prefersReducedMotion()

  const scope = useGsapContext<HTMLDivElement>(() => {
    const tl = gsap.timeline({ onComplete: () => onCompleteRef.current() })

    tl.set(".boot-online", { autoAlpha: 0 })
      .from(".boot-title", {
        autoAlpha: 0,
        letterSpacing: "0.7em",
        filter: "blur(12px)",
        duration: 1,
        ease: "power4.out",
      })
      .from(".boot-subtitle", { autoAlpha: 0, y: 10, duration: 0.6 }, "-=0.4")
      .from(".boot-status", { autoAlpha: 0, duration: 0.4 }, "+=0.15")
      .fromTo(
        ".boot-progress-fill",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.6, ease: "power2.inOut", transformOrigin: "left" },
        "<",
      )
      .to(".boot-line", { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.22 }, "<0.2")
      .to(
        [".boot-title", ".boot-subtitle", ".boot-status", ".boot-progress", ".boot-lines"],
        { autoAlpha: 0, y: -8, duration: 0.5, ease: "power2.in" },
        "+=0.5",
      )
      .fromTo(
        ".boot-online",
        { autoAlpha: 0, scale: 0.92, filter: "blur(8px)" },
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out", onStart: () => playSound("boot") },
      )
      .to(".boot-online", { autoAlpha: 0, duration: 0.5 }, "+=0.7")
  }, [])

  useEffect(() => {
    if (!reduced) return
    playSound("boot")
    const timeout = window.setTimeout(() => onCompleteRef.current(), 900)
    return () => window.clearTimeout(timeout)
  }, [reduced])

  if (reduced) {
    return (
      <div className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-void">
        <p className="font-display text-4xl font-bold tracking-[0.3em] text-ink-primary">AWAKEN</p>
        <p className="font-mono text-xs tracking-[0.35em] text-system">SYSTEM ONLINE</p>
      </div>
    )
  }

  return (
    <div ref={scope} className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 bg-void px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="boot-title font-display text-5xl font-bold tracking-[0.2em] text-ink-primary sm:text-6xl">
          AWAKEN
        </p>
        <p className="boot-subtitle font-mono text-xs tracking-[0.5em] text-system">REAL LIFE RPG</p>
      </div>

      <p className="boot-status font-mono text-[11px] tracking-[0.3em] text-ink-tertiary">SYSTEM INITIALIZING...</p>

      <div className="boot-progress h-px w-64 overflow-hidden bg-surface-2">
        <div className="boot-progress-fill h-full w-full bg-system" />
      </div>

      <div className="boot-lines flex flex-col items-center gap-1.5">
        {LOADING_LINES.map((line) => (
          <p key={line} className="boot-line translate-y-1 font-mono text-[11px] text-ink-tertiary opacity-0">
            {line}
          </p>
        ))}
      </div>

      <p className="boot-online absolute font-mono text-sm tracking-[0.5em] text-system opacity-0">SYSTEM ONLINE</p>
    </div>
  )
}
