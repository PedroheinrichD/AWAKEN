import type { Item } from "@prisma/client"
import { asIconKey, CATEGORY_TO_CLIENT, RANK_TO_CLIENT, RARITY_TO_CLIENT, SLOT_TO_CLIENT } from "../mappers"

export function serializeItem(item: Item, quantity?: number) {
  const requirements =
    item.reqLevel || item.reqRank || item.reqForca || item.reqResistencia || item.reqAgilidade || item.reqVitalidade || item.reqStamina
      ? {
          level: item.reqLevel ?? undefined,
          rank: item.reqRank ? RANK_TO_CLIENT[item.reqRank] : undefined,
          attributes: {
            forca: item.reqForca ?? undefined,
            resistencia: item.reqResistencia ?? undefined,
            agilidade: item.reqAgilidade ?? undefined,
            vitalidade: item.reqVitalidade ?? undefined,
            stamina: item.reqStamina ?? undefined,
          },
        }
      : undefined

  const bonus =
    item.bonusForca || item.bonusResistencia || item.bonusAgilidade || item.bonusVitalidade || item.bonusStamina
      ? {
          forca: item.bonusForca || undefined,
          resistencia: item.bonusResistencia || undefined,
          agilidade: item.bonusAgilidade || undefined,
          vitalidade: item.bonusVitalidade || undefined,
          stamina: item.bonusStamina || undefined,
        }
      : undefined

  return {
    id: item.id,
    name: item.name,
    category: CATEGORY_TO_CLIENT[item.category],
    slot: item.slot ? SLOT_TO_CLIENT[item.slot] : undefined,
    rarity: RARITY_TO_CLIENT[item.rarity],
    icon: asIconKey(item.icon),
    description: item.description,
    passive: item.passive ?? undefined,
    active: item.active ?? undefined,
    requirements,
    bonus,
    quantity,
  }
}
