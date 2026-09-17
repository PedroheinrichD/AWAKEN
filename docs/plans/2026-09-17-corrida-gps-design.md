# Validação de missões de corrida por GPS

Data: 2026-09-17

## Problema

`missions.complete` hoje marca qualquer missão como concluída sem validar nada. Para
a missão diária de corrida (`exerciseId: "corrida"`, `targetKm: 3`), isso significa
que o jogador pode "completar" sem correr um metro. Exercícios com câmera
(flexão/agachamento) já são validados de verdade via MediaPipe; corrida ao ar livre
precisa de um mecanismo equivalente baseado em geolocalização.

## Decisões

- **Rigor anti-cheat**: boa-fé. App privado de 2 jogadores, sem incentivo real para
  fraudar (morte permanente já é a pressão principal do jogo). Sem detecção de
  fake-GPS/teleporte — só filtro de ruído normal de sinal.
- **UX**: sessão em primeiro plano ("Iniciar Corrida" → mapa ao vivo → "Finalizar").
  Sem rastreio em segundo plano (tela bloqueada) — suporte limitado em PWA,
  especialmente iOS Safari, e complexidade não compensa para o caso de uso.
- **Mapa**: Leaflet + tiles OpenStreetMap. Zero custo, zero configuração de conta.
  Migração futura para Google Maps (quando/se configurarem billing) fica isolada à
  camada visual — a lógica de rastreio/distância não muda.
- **Recompensa por excedente**: se o jogador correr além do `targetKm`, ganha um
  bônus que escala com a distância extra, mas com teto baixo (nunca chega perto de
  dobrar a recompensa da missão).

## Cálculo de distância

`navigator.geolocation.watchPosition` com `enableHighAccuracy: true`. Para cada nova
posição:

1. Se `accuracy > 30m`, ignora a leitura (GPS ruim).
2. Calcula distância Haversine até o último ponto aceito.
3. Se essa distância for menor que 7m, ignora (jitter de GPS parado no lugar).
4. Caso contrário, soma à distância total e adiciona o ponto ao trajeto desenhado.

## Fórmula do bônus por excedente

```
kmExtra = distanciaPercorrida - targetKm

se kmExtra < 0.2 km → sem bônus

bonusXp = min(xpReward * 0.5, round(kmExtra * xpReward * 0.15))
bonusMoeda = min(3, floor(kmExtra))
```

Constantes em `server/src/game/config.ts` (`RUN_OVERRUN_CONFIG`), fórmula pura em
`server/src/game/running.ts`, seguindo o padrão já usado por `game/xp.ts`.

## Arquitetura

**Cliente** (paralelo ao fluxo de câmera existente):

- `src/lib/geo/geoUtils.ts` — `haversineDistanceKm` (função pura)
- `src/lib/geo/geoConfig.ts` — constantes de filtro/opções do `watchPosition`
- `src/hooks/useRunSession.ts` — dono do `watchPosition`, estado da sessão
  (`IDLE | REQUESTING_LOCATION | LOCATION_DENIED | LOCATION_UNAVAILABLE | LOCATION_ERROR | RUNNING`),
  distância acumulada e trajeto. Autocontido (sem hook aninhado tipo `useCamera`), então
  não repete o bug de dependência instável encontrado no `usePoseExerciseSession`.
- `src/components/run/RunMap.tsx` — `react-leaflet` (`MapContainer` + `TileLayer` +
  `Polyline` + marcador da posição atual), recentraliza a cada atualização
- `src/components/run/RunSessionShell.tsx` — estados de UI (idle/permissão/erro/rodando),
  mesmo padrão visual do `PoseSessionShell`
- `src/components/missions/MissionRunChallenge.tsx` — plugra `RunSessionShell` na
  missão; libera "Concluir Missão" quando `distanceKm >= target` e repassa a
  distância final pro `onComplete`

**Servidor**:

- `missions.router.ts`: `complete` ganha input opcional `distanceKm`. Se a missão tem
  `targetKm`, o campo é obrigatório e precisa ser `>= targetKm` (senão `BAD_REQUEST`).
  `ExerciseLog.distanceKm` e `CharacterStats.km` passam a registrar a distância real
  reportada, não mais o alvo fixo da missão.

**Sem tabela nova** — reaproveita `ExerciseLog`/`CharacterStats` que já existem.

## Fora de escopo (por enquanto)

- Mapa de exploração completo (bosses/portais/eventos no mundo real, §27) — só a
  corrida usa mapa por agora.
- Rastreio em segundo plano / tela bloqueada.
- Qualquer detecção de fraude além do filtro de ruído de GPS.
