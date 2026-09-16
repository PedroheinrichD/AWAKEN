import { useState } from "react"
import { CharacterCanvas } from "@/components/character/CharacterCanvas"
import { CustomizationControls } from "@/components/character/CustomizationControls"
import { SystemPanel } from "@/components/system/SystemPanel"
import type { CharacterAppearance } from "@/data/types"
import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { trpc } from "@/lib/trpc"
import { useGsapContext } from "@/lib/useGsapContext"
import { cn } from "@/lib/utils"

type Step = "identity" | "appearance" | "awakening"

const DEFAULT_APPEARANCE: CharacterAppearance = {
  skinTone: "#c68a5e",
  hairStyle: "curto",
  hairColor: "#1c1a19",
  eyeColor: "#4cc9f0",
  bodyType: "atletico",
}

export function CharacterCreateScreen() {
  const utils = trpc.useUtils()
  const createCharacter = trpc.character.create.useMutation({
    onSuccess: () => utils.character.getActive.invalidate(),
  })

  const [step, setStep] = useState<Step>("identity")
  const [name, setName] = useState("")
  const [appearance, setAppearance] = useState<CharacterAppearance>(DEFAULT_APPEARANCE)

  const finalName = name.trim() || "Caçador Sem Nome"

  function finalize() {
    createCharacter.mutate({ name: finalName, appearance })
  }

  if (step === "awakening") {
    return (
      <AwakeningWelcome
        name={finalName}
        onEnter={finalize}
        pending={createCharacter.isPending}
        errorMessage={createCharacter.error?.message ?? null}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-void px-4 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.4em] text-system uppercase">Criação de Personagem</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-primary sm:text-4xl">
            {step === "identity" ? "Quem você está prestes a se tornar?" : "Molde a sua aparência"}
          </h1>
        </div>

        <div className="flex h-1 w-full max-w-xs gap-1.5">
          <div className="h-full flex-1 bg-system" />
          <div className={cn("h-full flex-1", step === "appearance" ? "bg-system" : "bg-surface-2")} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
          <SystemPanel accent="system" className="order-2 flex items-center justify-center p-6 lg:order-1">
            <CharacterCanvas appearance={appearance} showCallouts={false} className="h-80 w-full" />
          </SystemPanel>

          <div className="order-1 lg:order-2">
            {step === "identity" ? (
              <SystemPanel className="space-y-6 p-6">
                <div>
                  <label htmlFor="character-name" className="mb-2 block font-display text-[11px] font-semibold tracking-[0.2em] text-ink-tertiary uppercase">
                    Nome do Caçador
                  </label>
                  <input
                    id="character-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Digite um nome"
                    maxLength={24}
                    className="w-full border border-surface-border-strong bg-surface-2 px-4 py-3 font-display text-lg text-ink-primary outline-none placeholder:text-ink-disabled focus:border-system"
                  />
                </div>
                <p className="text-xs leading-relaxed text-ink-secondary">
                  Este nome vai acompanhar cada Boss derrotado, cada sequência mantida e cada decisão tomada a partir de agora.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("appearance")}
                  className="w-full border border-system bg-system/10 py-3 font-display text-sm font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20"
                >
                  Continuar
                </button>
              </SystemPanel>
            ) : (
              <SystemPanel className="space-y-6 p-6">
                <CustomizationControls appearance={appearance} onChange={setAppearance} />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("identity")}
                    className="border border-surface-border-strong px-5 py-3 font-display text-xs font-semibold tracking-[0.2em] text-ink-tertiary uppercase transition-colors hover:text-ink-primary"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("awakening")}
                    className="flex-1 border border-system bg-system/10 py-3 font-display text-sm font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20"
                  >
                    Confirmar Personagem
                  </button>
                </div>
              </SystemPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AwakeningWelcome({
  name,
  onEnter,
  pending,
  errorMessage,
}: {
  name: string
  onEnter: () => void
  pending: boolean
  errorMessage: string | null
}) {
  const scope = useGsapContext<HTMLDivElement>(() => {
    const tl = gsap.timeline()
    tl.from(".welcome-label", { autoAlpha: 0, y: 10, duration: 0.6 })
      .fromTo(
        ".welcome-name",
        { autoAlpha: 0, y: 16, filter: "blur(10px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power4.out" },
        "-=0.2",
      )
      .from(".welcome-body", { autoAlpha: 0, y: 10, duration: 0.6 }, "-=0.3")
      .from(".welcome-cta", { autoAlpha: 0, y: 8, duration: 0.5 }, "-=0.2")

    if (prefersReducedMotion()) tl.timeScale(40)
  }, [])

  return (
    <div ref={scope} className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-5 bg-void px-6 text-center">
      <p className="welcome-label font-mono text-[11px] tracking-[0.4em] text-system uppercase">Sistema</p>
      <p className="welcome-name text-shimmer-gold font-display text-4xl font-bold sm:text-5xl">{name}</p>
      <p className="welcome-body max-w-md text-sm leading-relaxed text-ink-secondary">
        A partir de agora, cada esforço é registrado. Cada limite testado é uma escolha. O Sistema está observando.
      </p>
      <button
        type="button"
        onClick={onEnter}
        disabled={pending}
        className="welcome-cta mt-2 border border-system bg-system/10 px-8 py-3 font-display text-sm font-bold tracking-[0.3em] text-system uppercase transition-colors hover:bg-system/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sincronizando..." : "Entrar no Mundo"}
      </button>
      {errorMessage ? (
        <p className="welcome-cta max-w-md text-xs text-danger">
          Falha ao sincronizar: {errorMessage} — tente novamente.
        </p>
      ) : null}
    </div>
  )
}
