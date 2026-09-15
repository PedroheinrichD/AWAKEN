import type { Character, Item } from "@/data/types"
import { rankAtLeast } from "./rank"

export function meetsRequirements(character: Character, item: Item): boolean {
  const req = item.requirements
  if (!req) return true
  if (req.level && character.level < req.level) return false
  if (req.rank && !rankAtLeast(character.rank, req.rank)) return false
  if (req.attributes) {
    for (const [key, min] of Object.entries(req.attributes)) {
      const value = character.attributes[key as keyof Character["attributes"]]
      if (typeof min === "number" && value < min) return false
    }
  }
  return true
}
