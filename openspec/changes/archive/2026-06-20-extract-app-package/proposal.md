## Why

The Astro 6 SSR application still lives at the repo root under `src/`, while the design system (change 01) and the Hono API (changes 02–03) have already been extracted into their own workspace packages. With those in place, the Astro app is now only the shell, SSR pages, and React islands — it belongs in its own `@unveiled/app` package. Once packaged, the app must serve under the `/app/*` URL prefix so that the orchestrator (change 06) can own `/*` and a future landing page can claim the marketing surface.

## What Changes

- Move every file under `src/` (except `src/worker.ts`, which moves into the orchestrator in change 06) into `packages/app/src/`. This includes pages, layouts, components, actions, Astro-only data-access, view models, the Drizzle client, Better Auth setup, the middleware, styles, and the per-package `env.d.ts`.
- Configure `packages/app/astro.config.mjs` with `base: "/app"` so every static asset, page route, and asset reference is rewritten under the prefix.
- Drop the legacy `@/` alias in favor of `@unveiled/design-system`, `@unveiled/api`, and the package's own `~/` alias (resolves to `packages/app/src/`).
- Move Drizzle config (`drizzle.config.ts`) and the single shared migration history (`drizzle/`) into `packages/app/`, and have `@unveiled/api` consume them via a workspace import alias documented in `design.md`. Update `bun run db:generate`, `db:migrate:local`, `db:migrate`, and `db:seed:operations-smoke` to `cd` into `packages/app/` before running `drizzle-kit`.
- Rename the root `wrangler.toml` to `wrangler.app.toml` (kept at the repo root for Wrangler CLI ergonomics) so the Cloudflare adapter resolves a per-package config; re-register the API service binding that was wired in change 03.
- Update tests under `tests/features/**`, `tests/parity/**`, `tests/visual/**`, and `tests/unit/**` to point at `packages/app/` (gherkin selectors are unaffected; `baseURL` is set to `http://localhost:4321/app/` in this change and will move to the orchestrator dispatch in change 06).
- Update the Ladle build mount (`/ladle/`) so the design-system package's static output is served from the Astro app during the transition.
- Update root scripts so `bun run dev`, `bun run build`, `bun run check`, and `bun run db:*` fan out across workspaces or `cd` into the app package as appropriate.

This is the largest mechanical change of the iteration. It produces no user-visible behavior change in this change; the URL prefix swap is the orchestrator's job in change 06, and the local dev URL simply becomes `http://localhost:4321/app/`.

## Capabilities

### New Capabilities

- `app-package`: `@unveiled/app` is the Astro 6 SSR application package. It owns the app shell, SSR pages, React islands, server actions, Drizzle schema, Better Auth session verification, and the `/app` URL prefix. Its Cloudflare Workers bundle is produced by `bun run build` from `packages/app/`, and its development server runs under `http://localhost:4321/app/` (in this change) and under the orchestrator dispatch (in change 06).

### Modified Capabilities

- `app-shell`: every SSR page that previously rendered at `/` now renders at `/app/...`. The shell's URL awareness is updated to resolve links and active-state against the new prefix; the visual contract is unchanged.
- `routing`: the Astro app no longer owns `/`; it owns `/app/*`. The middleware guard chain (language resolution, viewer hydration, route-table match, permission check) still runs for every non-`/api/*` request, but the mount point is the `/app` prefix. The `/api/*` short-circuit (wired in change 03) is preserved unchanged and continues to forward to the API Worker via the service binding.
- `forms-actions`: action handlers live in `packages/app/src/actions/index.ts`. They call into `@unveiled/api`'s exported handler logic (`packages/api/src/routes/actions/**`) for the canonical HTTP shape, preserving the `safe` / `data` / `error` envelope for Astro callers while the canonical HTTP form is also exposed under `/api/actions/*` via the service binding.
- `openapi-contract`: TypeSpec contract is unchanged. The Astro-side OpenAPI YAML emitter is no longer generated (the API Worker owns it via `@hono/zod-openapi`); `bun run specs:check` runs in `@unveiled/api` and is wired into the umbrella `bun run check` via `bun --filter @unveiled/api run specs:check`.
- `design-tokens`: token CSS is generated into `packages/design-system/src/styles/generated/tokens.css` (already done in change 01) and imported by `packages/app/src/styles/global.css`; `@unveiled/app` no longer owns the token generator script. `bun run tokens:gen` and `bun run tokens:check` continue to be root-level commands and are wired into the umbrella `bun run check`.
- `viewer-session`: Better Auth session verification runs in `packages/app/src/middleware.ts`. The session cookie itself is issued by the API Worker (which mounts Better Auth in change 03), so the app's middleware only reads + validates the cookie; the underlying user/role/profile hydration still runs against the shared Drizzle schema that now lives in `packages/app/src/db/`.

### Removed Capabilities

- _None._ Every existing capability continues to work, just from a different path prefix and from inside a workspace package.

## Impact

- **New files:** `packages/app/` tree (mirrors the current `src/` tree), `wrangler.app.toml` (renamed from `wrangler.toml` at the repo root).
- **Modified files:**
  - `package.json` (root) — every script delegates via `bun --filter` or `cd` into the relevant package.
  - `tsconfig.json` and `tsconfig.base.json` — `@unveiled/app` path alias gains a concrete `src/index.ts` entry; the legacy `@/` alias is removed once every import is migrated.
  - `drizzle.config.ts` — moved into `packages/app/`.
  - `tests/features/**`, `tests/parity/**`, `tests/visual/**`, `tests/unit/**` — paths and `baseURL` updated; visual baselines are re-recorded against `/app/*` URLs.
  - `astro.config.mjs` — moved into `packages/app/astro.config.mjs` and updated with `base: "/app"` and a per-package Cloudflare adapter `configPath`.
  - `biome.json` — scan globs already include `packages/**`.
- **Removed files:** the top-level `src/` tree (the folder is fully relocated). The top-level `drizzle/` tree is also relocated into `packages/app/drizzle/`.
- **Dependencies changed:** React, Astro, `@astrojs/cloudflare`, `@astrojs/react`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@radix-ui/react-slot` move from the root into `@unveiled/app`'s `dependencies`. `drizzle-orm` and `drizzle-kit` move into `@unveiled/app` (and the app's `devDependencies` for `drizzle-kit`). `@unveiled/api` adds the shared Drizzle schema as a workspace dependency.
- **Risks:**
  - **Asset path regressions.** Astro's `base` rewrites are usually correct, but any hard-coded `/static/...` URL needs an update. Mitigation: grep the codebase for hard-coded `"/` prefixes that should now be `"/app/``, and add a unit test that asserts every emitted `<link>` and `<script>` href begins with `/app/`.
  - **Cloudflare adapter `configPath`.** Move `wrangler.toml` to `wrangler.app.toml` (kept at the repo root) so the adapter resolves the right file. Mitigation: documented in `design.md`; verified by `bun run preview:cloudflare`.
  - **Drizzle migration sharing.** `drizzle/` is shared between the API and the app. Mitigation: keep one migration history at `packages/app/drizzle/` and have `@unveiled/api` consume it via the `@unveiled/app/drizzle` workspace path; documented in `design.md` and verified by `bun run db:migrate:local` succeeding for both packages.
  - **URL drift in tests.** Gherkin feature files reference `/workbench/...`, `/account/...`, etc. Mitigation: bulk-rewrite feature file `Given` steps to prepend `/app`, run `bun run test:e2e` to green, and re-record visual baselines.
  - **Alias churn.** Dropping the `@/` alias touches every file under `src/`. Mitigation: a single codemod rewrites `@/...` to `~/...` (or `@unveiled/...`) before the alias is removed; the umbrella `bun run check` fails the build if any `@/` import slips through.
