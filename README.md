# AWAKEN — Real Life RPG

Transforme sua vida real em um RPG. Ver `claude.md` para a visão completa do projeto.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4, tRPC/React Query, Zustand (estado de UI), GSAP/Lenis/Framer Motion.
- **Backend**: Node + Express + tRPC.
- **Banco**: MySQL/MariaDB via Prisma ORM (driver adapter `@prisma/adapter-mariadb`).

## Pré-requisitos

- Node.js 20+
- Um servidor MySQL/MariaDB acessível localmente (este projeto foi desenvolvido usando o MariaDB do XAMPP).

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` / `JWT_SECRET` se necessário:
   ```bash
   cp .env.example .env
   ```
3. Garanta que o MySQL/MariaDB esteja rodando e que o banco exista (ajuste o nome se mudar `DATABASE_URL`):
   ```sql
   CREATE DATABASE IF NOT EXISTS awaken CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   Se estiver usando o MariaDB do XAMPP e ele não estiver rodando, inicie pelo XAMPP Control Panel (ou execute `xampp/mysql_start.bat`).
4. Rode as migrations e o seed:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## Desenvolvimento

```bash
npm run dev
```

Isso sobe o cliente (Vite) e o servidor (Express/tRPC) juntos. O Vite faz proxy de `/trpc` para `http://localhost:4000`, então tudo funciona a partir de uma única origem no navegador.

## Build de produção

```bash
npm run build
npm start
```

`npm start` sobe um único processo Express que serve o front-end buildado (`dist/`) e a API (`/trpc`) na porta definida por `PORT` (padrão 4000).

## Scripts úteis

- `npm run db:studio` — abre o Prisma Studio para inspecionar o banco.
- `npm run typecheck` / `npm run typecheck:server` — checagem de tipos do cliente / servidor.
- `npm run db:migrate` — cria e aplica uma nova migration a partir de mudanças no schema.

## Estrutura

```
src/            Frontend (screens, componentes, tRPC client)
server/
  prisma/       schema.prisma, migrations, seed
  src/
    game/       Regras de jogo puras (XP, dano, loot, requisitos) — sem I/O
    services/   Camada de persistência/orquestração sobre o Prisma
    trpc/       Routers tRPC (a API)
```
