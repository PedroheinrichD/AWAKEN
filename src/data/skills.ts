import type { Skill } from "./types"

export const DISCOVERED_SKILLS: Skill[] = [
  {
    id: "folego-de-ferro",
    name: "Fôlego de Ferro",
    description: "Sua respiração deixou de ser reflexo e virou instrumento.",
    effect: "Recupera 15% de stamina instantaneamente ao iniciar um novo turno de combate.",
    cost: "1 uso por combate",
    cooldown: "Recarrega ao vencer qualquer desafio",
    awakenedCondition: "Despertada ao completar 20 dias consecutivos de sequência ativa.",
    icon: "wind",
  },
  {
    id: "golpe-agil",
    name: "Golpe Ágil",
    description: "Cada repetição passou a carregar um pouco mais de intenção do que a anterior.",
    effect: "+18% de chance de dano crítico durante os primeiros 3 turnos de um combate contra Boss.",
    cost: "Passiva",
    cooldown: "Sem cooldown",
    duration: "3 turnos",
    awakenedCondition: "Despertada após derrotar um Boss de Rank C sem sofrer nenhum ataque.",
    icon: "lightning",
  },
  {
    id: "pulso-de-sobrevivencia",
    name: "Pulso de Sobrevivência",
    description: "Algo no corpo se recusou a aceitar o fim naquele dia.",
    effect: "Ao ficar abaixo de 15% de HP em combate, regenera 8% de HP máximo uma única vez.",
    cost: "1 uso por dia",
    cooldown: "24 horas",
    awakenedCondition: "Despertada ao sobreviver a um combate com menos de 5% de HP restante.",
    icon: "heart",
  },
]

// Nunca renderizar diretamente: só chega à UI via triggerAwakening, quando uma condição secreta é cumprida.
export const HIDDEN_SKILL_POOL: Skill[] = [
  {
    id: "erga-se",
    name: "Erga-se",
    description: "O que cai diante de você não precisa continuar caído.",
    effect: "Após derrotar certos Bosses, transforma-os em entidades subordinadas ao seu comando.",
    cost: "Condicional ao Boss derrotado",
    cooldown: "Sem cooldown",
    awakenedCondition: "Condição secreta cumprida.",
    icon: "crown",
  },
  {
    id: "eco-do-devorador",
    name: "Eco do Devorador",
    description: "Uma característica que não era sua começou a responder aos seus comandos.",
    effect: "Absorve uma característica específica de um Boss derrotado sob condições raras.",
    cost: "1 uso por Boss elegível",
    cooldown: "Desconhecido",
    awakenedCondition: "Condição secreta cumprida.",
    icon: "skull",
  },
]

const ALL_SKILLS = [...DISCOVERED_SKILLS, ...HIDDEN_SKILL_POOL]

export function getSkillById(id: string): Skill | undefined {
  return ALL_SKILLS.find((skill) => skill.id === id)
}
