# Unveiled MVP

Astro SSR starter configured with Bun, Drizzle ORM, PGlite for local development, managed Postgres for cloud, Better Auth, Tailwind CSS, shadcn/ui conventions, Biome, and TanStack Query.

## Commands

```sh
bun install
bun run dev
bun run check
bun run build
```

## Database

Local development uses PGlite when `DATABASE_URL` is empty. The local database is stored at `./.data/pglite` and is ignored by Git.

```sh
bun run db:generate
bun run db:migrate:local
```

Cloud environments should set `DATABASE_URL` to a Postgres connection string, then run:

```sh
bun run db:migrate
```

Copy `.env.example` to `.env` for local values.

## Auth

Better Auth is configured in `src/lib/auth.ts` and mounted at:

```text
/api/auth/[...all]
```

The Drizzle schema includes the Better Auth `user`, `session`, `account`, and `verification` tables.

## UI Workbench

Use Astro pages as a lightweight Storybook alternative:

```text
/workbench
```

The workbench includes shadcn/ui-style button variants and a TanStack Query React island backed by `/api/health.json`.
