# AWAKEN — Game Design: Gameplay Loop

**Data**: 2026-09-17  
**Autor**: Pedro Heinrich

---

## Visão Geral

AWAKEN evolui para um jogo mobile legítimo, inspirado em **Soul Knight**. O gameplay é puro — exploração de Bosses e Dungeons com controles mobile intuitivos. Exercícios reais funcionam como complemento em Missões e Eventos, **não como mecânica central**. O personagem e o jogador evoluem juntos.

---

## Gameplay

### Mecânicas Centrais

- **Exploração de Dungeons**: O jogador controla o personagem em tempo real, navegando por ambientes gerados.
- **Boss Fights**: Combates diretos contra Bosses, com HP visível, ataques especiais e mecânicas únicas.
- **Sistema de Dano**: O Boss causa dano baseado em seu comportamento e atributos. O jogador reduz HP do Boss através de ataques e habilidades.
- **Loot**: Ao derrotar um Boss, o jogador recebe itens aleatoriamente (baseado em raridade e rank do Boss).
- **Progressão do Jogo**: Subir de nível, desbloquear ranks, encontrar itens melhores e descobrir habilidades secretas.

### Inspiração Soul Knight

- Visão de cima (top-down)
- Personagem controla em tempo real
- Múltiplos inimigos/Bosses simultaneamente
- Dinâmico e rápido
- Feedback visual constante

---

## Controles Mobile

### 5 Inputs Principais

1. **Analógico à esquerda** — Movimento do personagem (8 direções)
2. **Botão de ataque (à direita)** — Ataca com a arma equipada
3. **Botão de habilidade da arma** — Usa habilidade especial da arma (ex: dash da espada)
4. **Botão de desviar** — Executa esquiva/roll (invulnerabilidade temporária)
5. **Botão de habilidade do personagem** — Usa a habilidade equipada do personagem

Todos os botões devem ter visual claro, feedback tátil quando possível, e desativar automaticamente se em cooldown.

---

## Progressão do Personagem

### Dentro do Jogo (Gameplay)

- **XP normal**: Ganho ao derrotar inimigos/Bosses durante dungeons
- **Nível**: Aumenta com XP
- **Atributos**: Força, Resistência, Agilidade, Vitalidade (aumentam ao subir nível)
- **Habilidades**: Descobertas ao longo da progressão
- **Equipamentos**: Encontrados como loot em Bosses
- **Rank**: Sobe quando cumpre critérios específicos (nível + atributos + conquistas)

### Fora do Jogo (Exercícios)

- **XP de Exercício**: Ganho ao completar Missões/Eventos que exigem exercício real validado
- **Stat Boost Temporário**: Exercícios podem gerar buffs que aumentam dano/defesa por determinado tempo
- **Desbloqueios**: Alguns itens/habilidades exigem atividades físicas para desbloquear

---

## Exercícios: Missões e Eventos

### Separação Clara

- **Gameplay**: 100% dentro do app (controles, turnos, Bosses, dungeons)
- **Exercícios**: Integrados em Missões/Eventos específicas, não em combates normais

### Tipos de Atividades com Exercício

**Missões Diárias**
- "Derrote o Boss Sombrio" → Validado por exercício
- Ex: 50 flexões = derrota o Boss
- Recompensa: XP, item raro, moeda de evento

**Eventos Aleatórios**
- "Desafio relâmpago: complete 100 agachamentos em 5 minutos"
- Recompensa variável (XP, item, título)

**Bosses Especiais**
- Bosses que exigem exercício para desbloquear
- Ex: Abrir portal = 30 segundos de corrida validada

**Conquistas**
- "1000 flexões no total" → desbloqueia habilidade/item
- Contador acumulado durante a jornada

### Validação por Câmera

- Sempre que uma Missão/Evento exigir exercício
- Câmera valida quantidade e qualidade da execução
- Bônus se exceder o requisito (mais XP, melhor item)
- Sem validação = exercício não conta

---

## Arquitetura Técnica

### Stack Recomendado

- **Frontend**: React Native ou Flutter
- **Game Engine**: Godot (2D) ou Unity (mais pesado)
- **Backend**: Node.js + Express ou Python + FastAPI
- **Banco de Dados**: PostgreSQL + Redis (cache/real-time)
- **Validação de Exercício**: MediaPipe ou TensorFlow.js (pose detection)
- **Real-time**: WebSocket pra sincronização e X1 futuro

### Estrutura do Projeto

```
awaken/
├── frontend/
│   ├── game/          # Game loop, controles, rendering
│   ├── ui/            # Menus, inventário, perfil
│   └── camera/        # Validação de exercícios
├── backend/
│   ├── api/           # REST API
│   ├── game-logic/    # Bosses, loot, progressão
│   ├── exercise-validation/ # IA de pose detection
│   └── database/      # Schemas, migrations
└── assets/
    ├── sprites/       # Personagem, inimigos, Bosses
    ├── sounds/        # SFX, música
    └── animations/    # Animar ataques, dano, etc
```

### Próximos Passos

1. Prototipar controles e game loop básico
2. Implementar um Boss simples com mecânicas
3. Integrar câmera para validação
4. Sistema de progressão (nível, itens)
5. Habilidades secretas e descoberta
6. Polir e expandir

---

## Notas de Design

- O jogo deve parecer uma **experiência completa**, não apenas um app de exercício
- A sensação de **descoberta e progressão** é fundamental
- Exercícios devem ser complementares, não obrigatórios para o gameplay
- A câmera e validação devem ser transparentes — não intrusive
- Design visual deve ser polido e diferenciado
