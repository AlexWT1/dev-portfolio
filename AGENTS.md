# Dev Portfolio — Agent Instructions

## Stack (versions matter — these have breaking changes)

- **Next.js 16** with React 19 — APIs and conventions differ from training data. Read `node_modules/next/dist/docs/` before writing unfamiliar Next.js APIs.
- **Prisma 7** — uses `prisma.config.mts` for datasource config (not the old `datasource url` in schema.prisma alone). Uses `@prisma/adapter-pg` driver adapter.
- **NextAuth v5 beta** — not v4. Import from `next-auth`, not `next-auth/react` for server-side.
- **Tailwind CSS v4** — uses `@tailwindcss/postcss` (not the v3 PostCSS plugin). CSS uses `@import "tailwindcss"` and `@theme inline {}` instead of `tailwind.config.*`.

## Setup order

1. `docker compose up -d` — PostgreSQL 16 on localhost:5432 (user/pass/db: `devportfolio`)
2. `npx prisma migrate dev` — apply schema and generate client
3. `npm run dev` — dev server at localhost:3000

Prisma client generates to `src/generated/prisma` (gitignored). If TypeScript can't find `@prisma/client`, run `npx prisma generate`.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, next core-web-vitals + typescript)
- `npx prisma migrate dev` — apply migrations + generate client
- `npx prisma generate` — regenerate client only
- No test runner is configured.

## Architecture

- **App Router** with `src/app/` — pages use server components by default; client components marked with `'use client'`.
- **Auth**: GitHub OAuth via NextAuth v5, `src/lib/auth.ts`. Adapter is Prisma.
- **Middleware**: `src/middleware.ts` does manual cookie check for `next-auth.session-token` — intentionally avoids importing Prisma (not Edge-compatible). Protected routes: `/dashboard`, `/settings`, `/api/projects`, `/api/sessions`, `/api/github`.
- **Prisma client**: `src/lib/prisma.ts` uses a lazy Proxy + `PrismaPg` adapter singleton on `globalThis`. Don't import `PrismaClient` directly; use `import { prisma } from '@/lib/prisma'`.
- **Path alias**: `@/*` → `./src/*`.
- **UI**: shadcn/ui pattern — `src/components/ui/` wraps Radix primitives with CVA + `tailwind-merge`.
- **Types**: `src/types/index.ts` mirrors Prisma models with frontend-friendly shapes.

## Env vars

Required in `.env` (gitignored, defaults match docker-compose):
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth app credentials
- `AUTH_SECRET` — NextAuth signing secret
- `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`

## Gotchas

- `prisma.config.mts` imports `dotenv/config` so Prisma CLI can read `.env`. If `DATABASE_URL` is missing, `npx prisma *` commands fail silently or with confusing errors.
- The `output` in `prisma.config.mts` controls generated-client location; the `src/generated/prisma` directory must exist or `prisma generate` will create it, but TypeScript won't resolve `@prisma/client` until generation completes.
- Route `/project/:slug` permanently redirects to `/projects/:slug` (configured in `next.config.ts`).
- The app forces dark mode via `className="dark"` on `<html>`.
