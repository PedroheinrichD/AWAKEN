import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BossEncounterIntro } from "@/components/cinematic/BossEncounterIntro"
import { CombatHUD } from "@/components/bosses/CombatHUD"
import { SystemPanel } from "@/components/system/SystemPanel"
import { BOSSES } from "@/data/bosses"
import { ITEMS } from "@/data/items"
import { RARITY_CONFIG } from "@/lib/rarity"
import type { Rarity } from "@/lib/rarity"
import { useGameStore } from "@/store/useGameStore"

const CHALLENGES = ["30 Flexões", "40 Agachamentos", "25 Abdominais", "Prancha por 45 segundos", "20 Burpees"]

const RANK_LOOT_CEILING: Record<string, Rarity> = {
  E: "comum",
  D: "incomum",
  C: "raro",
  B: "raro",
  A: "ultraRaro",
  S: "lendario",
  "S++": "deus",
}

export function BossFightScreen() {
  const { bossId } = useParams()
  const navigate = useNavigate()
  const character = useGameStore((state) => state.character)

  const boss = BOSSES.find((entry) => entry.id === bossId)

  const [showingIntro, setShowingIntro] = useState(true)
  const [bossHp, setBossHp] = useState(boss?.hp ?? 0)
  const [playerHp, setPlayerHp] = useState(character.hpMax)
  const [turn, setTurn] = useState(1)
  const [resolving, setResolving] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [outcome, setOutcome] = useState<"vitoria" | "derrota" | null>(null)
  const [seconds, setSeconds] = useState(60)

  useEffect(() => {
    if (showingIntro || outcome) return
    setSeconds(60)
    const interval = window.setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [turn, showingIntro, outcome])

  if (!boss) {
    return (
      <SystemPanel accent="danger" className="p-8 text-center">
        <p className="font-display text-lg text-ink-primary">Boss não encontrado</p>
        <button type="button" onClick={() => navigate("/bosses")} className="mt-4 text-sm text-system underline">
          Voltar para Bosses
        </button>
      </SystemPanel>
    )
  }

  if (showingIntro) {
    return <BossEncounterIntro boss={boss} onComplete={() => setShowingIntro(false)} />
  }

  function appendLog(entry: string) {
    setLog((prev) => [entry, ...prev].slice(0, 12))
  }

  function handleComplete() {
    setResolving(true)
    window.setTimeout(() => {
      const damageToBoss = Math.round(boss!.hp * (0.16 + (turn % 3) * 0.03))
      const nextBossHp = Math.max(0, bossHp - damageToBoss)
      appendLog(`Turno ${turn}: desafio concluído. ${boss!.name} perdeu ${damageToBoss} de HP.`)

      let nextPlayerHp = playerHp
      if (nextBossHp > 0) {
        const bossActs = Math.random() > 0.35
        if (bossActs) {
          const damageToPlayer = Math.round(boss!.dano * (0.7 + Math.random() * 0.6))
          nextPlayerHp = Math.max(0, playerHp - damageToPlayer)
          appendLog(`${boss!.name} atacou e causou ${damageToPlayer} de dano.`)
        } else {
          appendLog(`${boss!.name} não atacou neste turno.`)
        }
      }

      setBossHp(nextBossHp)
      setPlayerHp(nextPlayerHp)
      setResolving(false)

      if (nextBossHp <= 0) {
        appendLog(`${boss!.name} foi derrotado.`)
        setOutcome("vitoria")
      } else if (nextPlayerHp <= 0) {
        appendLog("Você foi derrotado neste combate.")
        setOutcome("derrota")
      } else {
        setTurn((value) => value + 1)
      }
    }, 700)
  }

  function handleUseSkill() {
    appendLog("Você ativou Fôlego de Ferro. Stamina parcialmente restaurada.")
  }

  function handleUseItem() {
    appendLog("Você usou uma Poção de Vida Menor.")
    setPlayerHp((value) => Math.min(character.hpMax, value + 40))
  }

  const lootRarityCeiling = RANK_LOOT_CEILING[boss.rank]
  const possibleLoot = ITEMS.find((item) => item.rarity === lootRarityCeiling && !item.requirements)

  return (
    <div className="space-y-6">
      <CombatHUD
        boss={boss}
        bossHp={bossHp}
        playerName={character.name}
        playerHp={playerHp}
        playerHpMax={character.hpMax}
        turn={turn}
        challenge={CHALLENGES[(turn - 1) % CHALLENGES.length]}
        timeLabel={`00:${String(seconds).padStart(2, "0")}`}
        log={log}
        resolving={resolving}
        finished={outcome !== null}
        onComplete={handleComplete}
        onUseSkill={handleUseSkill}
        onUseItem={handleUseItem}
      />

      {outcome ? (
        <SystemPanel accent={outcome === "vitoria" ? "system" : "danger"} className="p-6 text-center">
          <p className={outcome === "vitoria" ? "font-display text-3xl font-bold text-system" : "font-display text-3xl font-bold text-danger"}>
            {outcome === "vitoria" ? "VITÓRIA" : "DERROTA"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
            {outcome === "vitoria"
              ? `${boss.name} foi subjugado. O Sistema avalia possíveis recompensas.`
              : "O combate terminou antes do previsto. Não houve perda permanente: apenas X1 nunca causa morte, mas Bosses reais exigem cautela real."}
          </p>
          {outcome === "vitoria" && possibleLoot ? (
            <p className="mt-4 font-mono text-xs" style={{ color: `var(--color-${RARITY_CONFIG[possibleLoot.rarity].slug})` }}>
              Possível recompensa: {possibleLoot.name}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => navigate("/bosses")}
            className="mt-6 border border-surface-border-strong px-6 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-ink-secondary uppercase transition-colors hover:text-ink-primary"
          >
            Voltar para Bosses
          </button>
        </SystemPanel>
      ) : null}
    </div>
  )
}
