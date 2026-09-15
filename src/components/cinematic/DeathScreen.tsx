import { CharacterCanvas } from "@/components/character/CharacterCanvas"
import type { Character } from "@/data/types"
import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { useGsapContext } from "@/lib/useGsapContext"

const LOST_ITEMS = ["Nível e experiência", "Rank conquistado", "Atributos acumulados", "Equipamentos e inventário", "Progresso da jornada atual"]

interface DeathScreenProps {
  character: Character
  onCreateNew: () => void
}

export function DeathScreen({ character, onCreateNew }: DeathScreenProps) {
  const scope = useGsapContext<HTMLDivElement>(() => {
    const tl = gsap.timeline()
    tl.from(".death-vignette", { autoAlpha: 0, duration: 0.6 })
      .fromTo(
        ".death-canvas",
        { filter: "grayscale(0) brightness(1)", autoAlpha: 1 },
        { filter: "grayscale(1) brightness(0.45)", autoAlpha: 0.3, duration: 1.4, ease: "power2.inOut" },
        "-=0.2",
      )
      .fromTo(
        ".death-title",
        { autoAlpha: 0, scale: 1.4, filter: "blur(14px)" },
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power4.out" },
        "-=0.9",
      )
      .from(".death-line", { autoAlpha: 0, x: -12, duration: 0.35, stagger: 0.15 }, "+=0.3")
      .from(".death-cta", { autoAlpha: 0, y: 10, duration: 0.5 }, "+=0.2")

    if (prefersReducedMotion()) tl.timeScale(40)
  }, [])

  return (
    <div ref={scope} className="fixed inset-0 z-98 overflow-y-auto bg-void">
      <div
        className="death-vignette pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,59,78,0.14), transparent 55%), radial-gradient(circle at 50% 100%, rgba(0,0,0,0.9), transparent 60%)",
        }}
      />

      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div className="death-canvas h-56 w-56 opacity-100">
          <CharacterCanvas appearance={character.appearance} showCallouts={false} className="h-full w-full" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="death-title font-display text-6xl font-black tracking-wide text-danger sm:text-7xl">
            YOU DIED
          </p>
          <p className="max-w-md text-sm text-ink-secondary">
            {character.name} caiu em combate. A jornada, do jeito que ela existia, chegou ao fim.
          </p>
        </div>

        <div className="flex flex-col items-start gap-1.5">
          {LOST_ITEMS.map((item) => (
            <p key={item} className="death-line font-mono text-xs text-ink-tertiary line-through decoration-danger/60">
              {item}
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="death-cta border border-danger bg-danger/10 px-8 py-3 font-display text-sm font-bold tracking-[0.3em] text-danger uppercase transition-colors hover:bg-danger/20"
        >
          Create New Character
        </button>
      </div>
    </div>
  )
}
