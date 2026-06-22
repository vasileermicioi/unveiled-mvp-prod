# Packages

Bun workspace containing the deployable units of the Unveiled monorepo.

| Package | Purpose | Mounted at | Populated by |
| --- | --- | --- | --- |
| `@unveiled/design-system` | Ladle harness + production UI primitives | n/a (library) | change 01 |
| `@unveiled/api` | Hono HTTP backend | `/api/*` in Cloudflare | change 02 |
| `@unveiled/app` | The current Astro application | `/app/*` | change 04 |
| `@unveiled/landing` | Astro landing application | `/*` | change 05 |
| `@unveiled/orchestrator` | Cloudflare Worker that owns the public URL surface | entry Worker (`name = "unveiled"`) | change 06 |

## Package contract

Every package MUST:

- Declare `name` as `@unveiled/<pkg>` and `private: true`.
- Expose the scripts `dev`, `build`, `typecheck`, and `lint`.
- Ship a `tsconfig.json` that extends `../../packages/tsconfig.base.json`.
- Use the `@unveiled/*` alias for **all** cross-package imports.
- Refuse cross-package relative imports (e.g. `import x from "../../api/src/..."`).

## Import alias rules

- `@unveiled/<pkg>` — cross-package alias; declared once in the root `tsconfig.base.json` and inherited by every package.
- `@/...` — **legacy** compatibility shim that resolves into `src/*` for the duration of the migration to the monorepo. Removed by change 04. Do not use it in any new package source.

## Local dev boot order (change 06)

`bun run dev` boots four Workers behind a single local port (4320):

1. `@unveiled/api` on `http://localhost:8787` (`wrangler dev --config wrangler.api.toml`; defaults to `--local`; set `WRANGLER_REMOTE=1` in `.env` to opt into remote Cloudflare bindings).
2. `@unveiled/app` on `http://localhost:4321` (`astro dev --port 4321`).
3. `@unveiled/landing` on `http://localhost:4322` (`astro dev --port 4322`).
4. `@unveiled/orchestrator` on `http://localhost:4320` (Vite dev proxy that listens on port 4320 and forwards per the dispatch map: `/api/*` → 8787, `/app/*` → 4321, everything else → 4322).

The orchestrator's `dev` script gates on the three downstream dev servers via `wait-on http://localhost:8787 http://localhost:4321 http://localhost:4322` so it never starts until they are listening.

## CI fan-out rules

Root scripts in `package.json` fall into two categories:

- **Run once at the root** (with widened globs to cover `packages/**`):
  `check`, `lint`, `format`, `specs:check`, `specs:gen`, `tokens:check`, `tokens:gen`, `arch:check`, `arch:drift`, `test:e2e`, `test:ladle`, `ladle:coverage`, `heroui-design-system-replica:check`, `lint:viewport`, `db:seed:*`, `deploy:*`.

- **Fan out per package** via `bun run --filter '*' <script>`:
  `lint:workspaces` (uses `biome check packages/`), `typecheck:workspaces` (per-package `tsc --noEmit`), `test:workspaces` (per-package `test:unit`).

Rule of thumb: if the tool reads from the repo root and walks the tree itself, run once at the root with a wider glob. If the tool is per-package by nature (TypeScript compile, `bun test`), fan out via `bun run --filter`.

## Dependency hoisting

For now all dependencies stay hoisted at the repo root; per-package `dependencies` and `devDependencies` start empty. The orchestrator package is an exception: it carries its own `wrangler`, `concurrently`, `wait-on`, and `vite` devDependencies because it ships as a separate Cloudflare Worker. Do **not** switch to per-package installs (no `bun install --no-hoist`) without a dedicated change — the Astro Cloudflare adapter still resolves modules from the root `node_modules`.
