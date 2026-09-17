# Expansão da customização de personagem

Data: 2026-09-17

## Problema

`CharacterCanvas.tsx` é um SVG 100% desenhado à mão: só 4 estilos de cabelo, e o
`equipment`/`items` que já recebe como prop só vira uma lista de badges ao lado do
personagem — nada aparece desenhado sobre o corpo. O jogador quer mais opções
visuais e quer ver o equipamento refletido no personagem.

## Decisão

Cogitamos adotar uma biblioteca de avatar (DiceBear) para a parte de
rosto/cabelo. Testado ao vivo via API: **todo estilo "character" do DiceBear é
retrato quadrado** (confirmado via viewBox — 762×762, 704×704, 360×360 em vários
estilos), nunca corpo inteiro. Isso inviabiliza mostrar pernas/pés/arma
equipados, que é metade do que foi pedido. Decisão final: expandir o SVG custom
existente — um só sistema visual, cobre corpo inteiro + equipamento, sem misturar
estilos de arte diferentes.

## O que muda

**Mais estilos de cabelo** — de 4 para 7: adiciona `MOICANO`, `AFRO`, `TRANCAS`
(paths SVG novos em `HairShape`, mesmo padrão das 4 existentes). Requer:
- `HairStyle` enum no `schema.prisma` + migration
- `HAIR_STYLE_TO_CLIENT`/`HAIR_STYLE_FROM_CLIENT` em `server/src/mappers.ts`
- `CharacterAppearance["hairStyle"]` em `src/data/types.ts`
- Nova opção em `CustomizationControls.tsx`

**Equipamento visível no corpo** — para cada slot equipado (`cabeca`, `corpo`,
`maos`, `pernas`, `pes`, `arma`, `acessorio1`, `acessorio2`), `CharacterCanvas`
desenha uma forma geométrica simples ancorada na região correspondente do
silhueta (arco na cabeça, retângulo no torso, linha na mão, faixa na perna/pé),
com contorno/brilho na cor da raridade do item (reaproveita `RARITY_CONFIG`, já
usado em `CalloutColumn`) e o ícone que o item já tem (`ICON_MAP`) sobreposto —
nenhuma arte nova complexa, só geometria + ícones que já existem no sistema.
Callouts laterais continuam existindo (não removidos) — a visualização no corpo
é aditiva.

## Fora de escopo

- Formas únicas por item individual (ex: espada vs lança com silhuetas
  diferentes) — v1 usa uma forma por *slot*, não por item. Pode evoluir depois
  usando o `icon` do item para variar a forma sem precisar de arte nova.
- Trocar o sistema de cor de pele/olhos (já são paletas curadas, não precisam
  mudar).
