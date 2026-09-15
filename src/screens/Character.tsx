import { CheckCircle, XCircle } from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom"
import { CharacterCanvas } from "@/components/character/CharacterCanvas"
import { AttributePanel } from "@/components/hud/AttributePanel"
import { HPBar } from "@/components/hud/HPBar"
import { LevelBadge } from "@/components/hud/LevelBadge"
import { RankBadge } from "@/components/hud/RankBadge"
import { XPBar } from "@/components/hud/XPBar"
import { EquipmentSlot } from "@/components/rpg/EquipmentSlot"
import { SystemPanel } from "@/components/system/SystemPanel"
import type { EquipmentSlotKey } from "@/data/types"
import { trpc } from "@/lib/trpc"
import { useGameStore } from "@/store/useGameStore"

const SLOT_LABELS: Record<EquipmentSlotKey, string> = {
  cabeca: "Cabeça",
  corpo: "Corpo",
  maos: "Mãos",
  pernas: "Pernas",
  pes: "Pés",
  arma: "Arma",
  acessorio1: "Acessório I",
  acessorio2: "Acessório II",
}

const SLOT_ORDER: EquipmentSlotKey[] = ["arma", "cabeca", "corpo", "maos", "pernas", "pes", "acessorio1", "acessorio2"]

export function CharacterScreen() {
  const navigate = useNavigate()
  const utils = trpc.useUtils()
  const pushOverlay = useGameStore((state) => state.pushOverlay)

  const { data: character } = trpc.character.getActive.useQuery()
  const { data: titles } = trpc.titles.unlocked.useQuery()
  const { data: inventory } = trpc.items.inventory.useQuery()
  const { data: promotion } = trpc.character.rankPromotionStatus.useQuery()
  const { data: trialBoss } = trpc.bosses.getById.useQuery(
    { bossId: promotion?.trialBossId ?? "" },
    { enabled: Boolean(promotion?.trialBossId) },
  )

  const attemptPromotion = trpc.character.attemptRankPromotion.useMutation({
    onSuccess: (result) => {
      utils.character.getActive.invalidate()
      utils.character.rankPromotionStatus.invalidate()
      pushOverlay({ type: "rankUp", from: result.from, to: result.to })
    },
  })

  if (!character) return null

  const equippedTitle = titles?.find((title) => title.equipped)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div className="space-y-6">
        <SystemPanel accent="system" className="flex flex-col items-center p-6 text-center">
          <CharacterCanvas appearance={character.appearance} equipment={character.equipment} items={inventory} className="h-80 w-full" />
          <p className="mt-2 font-display text-2xl font-bold text-ink-primary">{character.name}</p>
          <p className="text-sm text-system">{equippedTitle ? equippedTitle.name : "Sem título equipado"}</p>
          <div className="mt-4 flex items-center gap-4">
            <RankBadge rank={character.rank} size="lg" />
            <LevelBadge level={character.level} />
          </div>
        </SystemPanel>

        <SystemPanel label="Vitalidade" className="space-y-4 p-5">
          <HPBar current={character.hp} max={character.hpMax} />
          <XPBar current={character.xp} max={character.xpToNext} />
        </SystemPanel>

        {promotion?.nextRank ? (
          <SystemPanel accent="gold" label="Promoção de Rank" className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm text-ink-secondary">
                {character.rank} → <span className="text-gold">{promotion.nextRank}</span>
              </span>
            </div>
            <RequirementLine met={promotion.levelMet} label={`Nível mínimo: ${promotion.minLevel}`} />
            {trialBoss ? <RequirementLine met={trialBoss.defeated} label={`Derrotar: ${trialBoss.name}`} /> : null}
            <button
              type="button"
              disabled={!promotion.eligible || attemptPromotion.isPending}
              onClick={() => attemptPromotion.mutate()}
              className="w-full border border-gold bg-gold/10 py-2.5 font-display text-xs font-semibold tracking-[0.2em] text-gold uppercase transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Tentar Promoção
            </button>
          </SystemPanel>
        ) : null}
      </div>

      <div className="space-y-6">
        <SystemPanel label="Atributos" className="p-5">
          <AttributePanel attributes={character.attributes} />
        </SystemPanel>

        <SystemPanel label="Equipamentos" className="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SLOT_ORDER.map((slot) => {
              const itemId = character.equipment[slot]
              const item = inventory?.find((candidate) => candidate.id === itemId)
              return (
                <EquipmentSlot
                  key={slot}
                  label={SLOT_LABELS[slot]}
                  item={item}
                  onClick={() => navigate("/equipamentos")}
                />
              )
            })}
          </div>
        </SystemPanel>
      </div>
    </div>
  )
}

function RequirementLine({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? <CheckCircle size={16} weight="fill" className="text-system" /> : <XCircle size={16} className="text-ink-disabled" />}
      <span className={met ? "text-ink-secondary" : "text-ink-tertiary"}>{label}</span>
    </div>
  )
}
