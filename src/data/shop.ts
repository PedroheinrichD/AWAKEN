import type { ShopListing } from "./types"

export const EVENT_CURRENCY_NAME = "Fragmentos de Evento"

export const SHOP_LISTINGS: ShopListing[] = [
  {
    id: "manto-furtivo-eclipse",
    name: "Manto Furtivo do Eclipse",
    rarity: "ultraRaro",
    price: 1200,
    exclusive: true,
    description: "Costurado com material que não reflete luz de portal.",
    icon: "shield",
  },
  {
    id: "pocao-ressurreicao-coletiva",
    name: "Poção de Ressurreição Coletiva",
    rarity: "deus",
    price: 5000,
    exclusive: true,
    description: "Uso restrito a eventos e Bosses coletivos. Não funciona fora deles.",
    icon: "flask",
  },
  {
    id: "emblema-cacador-noturno",
    name: "Emblema do Caçador Noturno",
    rarity: "raro",
    price: 400,
    exclusive: false,
    description: "Reconhecido por sentinelas de portal em qualquer região.",
    icon: "amulet",
  },
  {
    id: "pergaminhos-identificacao-lote",
    name: "Lote de Pergaminhos de Identificação",
    rarity: "comum",
    price: 60,
    exclusive: false,
    description: "5 unidades. Sempre acabam mais rápido do que parecem.",
    icon: "scroll",
  },
  {
    id: "runa-temporaria",
    name: "Tatuagem Rúnica Temporária",
    rarity: "incomum",
    price: 150,
    exclusive: true,
    description: "Dura 7 dias. Efeito puramente estético, por enquanto.",
    icon: "gem",
  },
  {
    id: "estabilizador-portal",
    name: "Fragmento Estabilizador de Portal",
    rarity: "raro",
    price: 500,
    exclusive: true,
    description: "Aumenta o tempo de vida de portais instáveis descobertos.",
    icon: "core",
  },
]
