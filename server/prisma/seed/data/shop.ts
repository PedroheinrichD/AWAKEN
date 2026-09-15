import type { Rarity } from "@prisma/client"

export interface ShopListingSeed {
  id: string
  name: string
  rarity: Rarity
  price: number
  exclusive: boolean
  oneTimePerCharacter: boolean
  itemId?: string
  icon: string
  description: string
}

export const SHOP_LISTINGS: ShopListingSeed[] = [
  {
    id: "manto-furtivo-eclipse-listing",
    name: "Manto Furtivo do Eclipse",
    rarity: "ULTRA_RARO",
    price: 1200,
    exclusive: true,
    oneTimePerCharacter: true,
    itemId: "manto-furtivo-eclipse",
    icon: "shield",
    description: "Costurado com material que não reflete luz de portal.",
  },
  {
    id: "pocao-ressurreicao-coletiva-listing",
    name: "Poção de Ressurreição Coletiva",
    rarity: "DEUS",
    price: 5000,
    exclusive: true,
    oneTimePerCharacter: false,
    itemId: "pocao-ressurreicao-coletiva",
    icon: "flask",
    description: "Uso restrito a eventos e Bosses coletivos. Não funciona fora deles.",
  },
  {
    id: "emblema-cacador-noturno-listing",
    name: "Emblema do Caçador Noturno",
    rarity: "RARO",
    price: 400,
    exclusive: false,
    oneTimePerCharacter: false,
    itemId: "emblema-cacador-noturno",
    icon: "amulet",
    description: "Reconhecido por sentinelas de portal em qualquer região.",
  },
  {
    id: "pergaminho-identificacao-listing",
    name: "Pergaminho de Identificação",
    rarity: "COMUM",
    price: 60,
    exclusive: false,
    oneTimePerCharacter: false,
    itemId: "pergaminho-identificacao",
    icon: "scroll",
    description: "Sempre acaba mais rápido do que parece.",
  },
  {
    id: "runa-temporaria-listing",
    name: "Tatuagem Rúnica Temporária",
    rarity: "INCOMUM",
    price: 150,
    exclusive: true,
    oneTimePerCharacter: false,
    itemId: "runa-temporaria",
    icon: "gem",
    description: "Dura 7 dias. Efeito puramente estético, por enquanto.",
  },
  {
    id: "estabilizador-portal-listing",
    name: "Fragmento Estabilizador de Portal",
    rarity: "RARO",
    price: 500,
    exclusive: true,
    oneTimePerCharacter: false,
    itemId: "estabilizador-portal",
    icon: "core",
    description: "Aumenta o tempo de vida de portais instáveis descobertos.",
  },
]
