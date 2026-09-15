import type { Rank } from "@prisma/client"

export interface ExerciseSeed {
  id: string
  name: string
  unit: "REPETICOES" | "QUILOMETROS" | "SEGUNDOS"
  description: string
  variants?: { rank: Rank; name: string; description: string }[]
}

const RANKS: Rank[] = ["E", "D", "C", "B", "A", "S", "SPLUS"]

function variants(names: string[], descriptions: string[]) {
  return RANKS.map((rank, i) => ({ rank, name: names[i], description: descriptions[i] }))
}

export const EXERCISES: ExerciseSeed[] = [
  {
    id: "flexao",
    name: "Flexão",
    unit: "REPETICOES",
    description: "O exercício fundamental de empurrar. Base de tudo o que vem depois.",
    variants: variants(
      ["Flexão Normal", "Flexão Declinada", "Flexão Diamante", "Flexão Arqueiro", "Flexão com Palmas", "Flexão One-Arm Assistida", "Flexão One-Arm Completa"],
      [
        "A base. Ombros, peito e tríceps trabalhando juntos.",
        "Pés elevados, mais peso sobre a parte superior do corpo.",
        "Mãos unidas sob o peito. O tríceps sofre.",
        "Peso deslocado quase inteiramente para um lado a cada repetição.",
        "Explosão suficiente para as mãos saírem do chão.",
        "Um braço, com apoio parcial para reduzir a carga.",
        "Um braço, peso total. Poucos chegam até aqui.",
      ],
    ),
  },
  {
    id: "agachamento",
    name: "Agachamento",
    unit: "REPETICOES",
    description: "O exercício fundamental das pernas.",
    variants: variants(
      ["Agachamento Livre", "Agachamento Búlgaro", "Agachamento Sumô com Salto", "Pistol Squat Assistido", "Pistol Squat Completo", "Pistol Squat com Peso", "Shrimp Squat"],
      [
        "Peso do corpo, amplitude completa.",
        "Uma perna elevada atrás, o equilíbrio já não é gratuito.",
        "Base larga e explosão vertical a cada repetição.",
        "Uma perna só, com apoio para controlar a descida.",
        "Uma perna só, sem apoio algum.",
        "Uma perna, carga extra. O joelho não perdoa erro de forma.",
        "Uma perna dobrada atrás do corpo. Equilíbrio quase impossível.",
      ],
    ),
  },
  {
    id: "abdominal",
    name: "Abdominal",
    unit: "REPETICOES",
    description: "O exercício fundamental do core.",
    variants: variants(
      ["Abdominal Tradicional", "Abdominal Bicicleta", "Prancha com Elevação de Perna", "Dragon Flag Assistido", "Dragon Flag Completo", "Front Lever Tuck", "Front Lever Completo"],
      [
        "Tronco sobe, ombros saem do chão.",
        "Rotação de tronco a cada repetição.",
        "Isometria com movimento adicionado.",
        "Corpo reto, apoio reduzido na descida.",
        "Corpo reto, controle total do quadril ao ombro.",
        "Corpo suspenso, joelhos dobrados junto ao peito.",
        "Corpo suspenso, completamente reto, paralelo ao chão.",
      ],
    ),
  },
  {
    id: "corrida",
    name: "Corrida",
    unit: "QUILOMETROS",
    description: "Resistência cardiovascular pura.",
    variants: variants(
      ["Corrida Leve", "Corrida Contínua 5km", "Corrida Intervalada", "Corrida 10km", "Corrida de Resistência 15km", "Meia Maratona", "Maratona Completa"],
      [
        "1 a 3km em ritmo confortável.",
        "5km sem interrupção.",
        "Alternância de tiros e recuperação.",
        "10km. O corpo começa a negociar.",
        "15km. A mente cede antes das pernas.",
        "21km. Poucos treinam de verdade para isso.",
        "42km. O tipo de coisa que muda como você se vê.",
      ],
    ),
  },
  { id: "burpee", name: "Burpee", unit: "REPETICOES", description: "Corpo inteiro, sem desculpas." },
  { id: "prancha", name: "Prancha", unit: "SEGUNDOS", description: "Isometria de core. Tempo é o inimigo." },
  { id: "handstand", name: "Parada de Mãos", unit: "SEGUNDOS", description: "Inverter o corpo. Inverter o medo." },
  { id: "lsit", name: "L-Sit", unit: "SEGUNDOS", description: "Poucos sustentam. Menos ainda sustentam sorrindo." },
]
