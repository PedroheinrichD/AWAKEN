import { HP_FORMULA } from "./config"
import type { Attributes, ItemBonuses } from "./types"

export function hpMaxFor(level: number, vitalidade: number): number {
  return HP_FORMULA.base + level * HP_FORMULA.perLevel + vitalidade * HP_FORMULA.perVitalidade
}

export function effectiveAttributes(base: Attributes, equippedBonuses: ItemBonuses[]): Attributes {
  return equippedBonuses.reduce<Attributes>(
    (acc, bonus) => ({
      forca: acc.forca + bonus.bonusForca,
      resistencia: acc.resistencia + bonus.bonusResistencia,
      agilidade: acc.agilidade + bonus.bonusAgilidade,
      vitalidade: acc.vitalidade + bonus.bonusVitalidade,
      stamina: acc.stamina + bonus.bonusStamina,
    }),
    { ...base },
  )
}

const ATTRIBUTE_LEVEL_CYCLE: (keyof Attributes)[] = ["forca", "resistencia", "agilidade", "vitalidade", "stamina"]

export function attributeGainForLevel(newLevel: number): keyof Attributes {
  return ATTRIBUTE_LEVEL_CYCLE[newLevel % ATTRIBUTE_LEVEL_CYCLE.length]
}
