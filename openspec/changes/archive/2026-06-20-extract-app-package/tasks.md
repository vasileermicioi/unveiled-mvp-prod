## 1. Scaffold `@unveiled/app` Package

- [x] 1.1 Replace `packages/app/README.md` with a brief package overview (dependency owners, scripts, mount point).
- [x] 1.2 Populate `packages/app/package.json` with the scripts (`dev`, `build`, `typecheck`, `lint`, `test:unit`, `preview`, `preview:cloudflare`, `db:generate`, `db:migrate:local`, `db:migrate`, `db:seed:operations-smoke`) and the dependencies from the proposal (Astro, `@astrojs/cloudflare`, `@astrojs/react`, React, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@radix-ui/react-slot`, `drizzle-orm`, `better-auth`, `@unveiled/design-system`, `@unveiled/api`).
- [x] 1.3 Add `packages/app/tsconfig.json` extending `packages/tsconfig.base.json` with the `~/*` path mapping (`{"~/*": ["./src/*"]}`), `jsx: "react-jsx"`, `jsxImportSource: "react"`, and the same `include`/`exclude` pattern as the root `tsconfig.json` (scoped to `packages/app/`).
- [x] 1.4 Add `packages/app/biome.json` (or rely on the root `biome.json` if it already scans `packages/app/src/**`) so the package's source tree is covered by the umbrella `biome check`.
- [x] 1.5 Create `packages/app/src/index.ts` as a barrel that re-exports the `Viewer` discriminated union, the `redirectAfterLoginFor` helper, the `productRoutes` table, and the `parseSafeRedirectTarget` helper so `@unveiled/api` can import them.

## 2. Move `src/` Into `packages/app/src/`

- [x] 2.1 `git mv src/ packages/app/src/` (preserves history) and verify no top-level `src/` tree remains.
- [x] 2.2 Move `astro.config.mjs` to `packages/app/astro.config.mjs` and add `base: "/app"` plus the Cloudflare adapter option `{ configPath: "wrangler.app.toml" }`.
- [x] 2.3 Move `env.d.ts` to `packages/app/src/env.d.ts` and update the per-package env surface to match the package's PUBLIC_* and server-only fields.
- [x] 2.4 Update every file under `packages/app/src/**` to import via `~/...` (instead of `@/...`) for app-local modules and `@unveiled/...` for cross-package modules.
- [x] 2.5 Run a `bun install` at the repo root to refresh the workspace lockfile and verify the package's `node_modules` is wired correctly.

## 3. Move Drizzle Config And Shared Migrations

- [x] 3.1 `git mv drizzle.config.ts packages/app/drizzle.config.ts` and `git mv drizzle packages/app/drizzle`; verify the migration history is intact and the meta directory is in place.
- [x] 3.2 Update `packages/app/drizzle.config.ts` to point at the new `schema` path (`./src/db/schema.ts`) and the new `out` path (`./drizzle`); update the `dbCredentials` block to use the local PGlite path (`./../../.data/pglite` from the package root) or the cloud `DATABASE_URL`.
- [x] 3.3 Update `packages/api/package.json` to add a `dependencies` entry for `@unveiled/app` (workspace) and `packages/api/tsconfig.json` to add a `paths` entry that maps `@unveiled/app/db/schema` and `@unveiled/app/drizzle/*` to the workspace paths under `packages/app/`.
- [x] 3.4 Update every import in `packages/api/src/**` that currently reads from `../../drizzle/...` or `../../db/schema` to read from `@unveiled/app/drizzle/...` and `@unveiled/app/db/schema` instead.
- [x] 3.5 Verify `bun run db:migrate:local` succeeds end-to-end (apply every committed migration to the local PGlite database) and that both `@unveiled/app` and `@unveiled/api` can read the resulting schema without drift.

## 4. Rename `wrangler.toml` To `wrangler.app.toml`

- [x] 4.1 `git mv wrangler.toml wrangler.app.toml` and verify no `wrangler.toml` file remains at the repo root.
- [x] 4.2 Update `wrangler.app.toml` to declare `main = "packages/app/dist/worker.js"`, the Astro Cloudflare adapter compatibility date, the `services` array entry (`binding = "API"`, `service = "unveiled-api"`, `entrypoint = "fetch"`), and any environment-specific bindings (D1/KV/R2/Queues/Analytics Engine) the app needs.
- [x] 4.3 Verify the Astro Cloudflare adapter resolves the new config: `bun --filter @unveiled/app run preview:cloudflare` starts the preview server on `http://localhost:8787/app/...` (or the Wrangler default port) without errors.

## 5. Update Root Scripts And `tsconfig` Aliases

- [x] 5.1 Update the root `package.json`'s `dev` script to `bun --filter @unveiled/app run dev` (with `--base /app` propagated via the app package's `dev` script).
- [x] 5.2 Update the root `package.json`'s `build` script to fan out: `bun --filter @unveiled/design-system run build && bun --filter @unveiled/app run build`.
- [x] 5.3 Update the root `package.json`'s `check` script to fan out per-package: `astro check` + `biome check .` in `@unveiled/app`, `biome check .` + `tsc --noEmit` in `@unveiled/design-system`, and the same in `@unveiled/api`.
- [x] 5.4 Update the root `package.json`'s `db:generate`, `db:migrate:local`, `db:migrate`, and `db:seed:operations-smoke` scripts to `cd` into `packages/app/` before invoking `drizzle-kit`.
- [x] 5.5 Remove the legacy `"@/*": ["src/*"]` entry from the root `tsconfig.base.json` and confirm the cross-package aliases (`@unveiled/...`) are still declared.
- [x] 5.6 Remove the now-redundant dependency entries from the root `package.json` (React, Astro, `@astrojs/cloudflare`, `@astrojs/react`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@radix-ui/react-slot`, `drizzle-orm`, `drizzle-kit`, `better-auth`).
- [x] 5.7 Run `bun install` to refresh the lockfile after the dependency move and verify the umbrella `bun run check` is green.

## 6. Run The Codemod And Remove The Legacy `@/` Alias

- [x] 6.1 Add `scripts/codemod-remove-legacy-alias.ts` (a `bun`-runnable script) that scans `packages/app/src/**` for `@/...` imports and rewrites them to `~/...` (or `@unveiled/...` if the import targets the design system or the API).
- [x] 6.2 Run the codemod once; review the diff to make sure no import was missed or mistranslated.
- [x] 6.3 Add a verification step (`bun run scripts/codemod-remove-legacy-alias.ts --verify`) to the umbrella `bun run check`; the step fails the build if any `@/` import remains in `packages/app/src/**` or `packages/api/src/**`.
- [x] 6.4 Run `rg "@/" packages/app/src packages/api/src` and confirm the result is empty.

## 7. Update Tests For The New Prefix And Package Layout

- [x] 7.1 Add `scripts/codemod-prepend-app-prefix.ts` (a `bun`-runnable script) that scans `tests/features/**/*.feature` for `Given`, `When`, and `Then` steps that visit a route and prepends `/app` to the route path.
- [x] 7.2 Run the codemod once; review the diff to make sure no step was missed or mistranslated.
- [x] 7.3 Update the Playwright config (`tests/parity/playwright.config.ts` or equivalent) to set `baseURL = "http://localhost:4321/app/"` and to start the dev server with `astro dev --base /app`.
- [x] 7.4 Update `tests/unit/no-ladle-replica-in-production.test.ts` to scan `packages/app/src/**` (and, after change 05, `packages/landing/src/**`) for any production import that lands in `heroui-replica/`.
- [x] 7.5 Re-record the visual baselines under `tests/visual/**` against the `/app/*` URLs (`BUN_UPDATE_BASELINES=1 bun run test:visual`).
- [x] 7.6 Run the full test suite end-to-end: `bun run test:unit`, `bun run test:e2e`, `bun run test:ladle`, and `bun run test:visual` are all green.

## 8. Update Documentation And TypeSpec / OpenAPI Hooks

- [x] 8.1 Update `AGENTS.md` §3 (File layout) to reference `packages/app/` instead of `src/` for the Astro application; update §7 (Toolchain commands) to use `bun --filter @unveiled/app run …` for the per-package scripts.
- [x] 8.2 Update the canonical `routing` spec (the `app-shell` and `routing` deltas in this change are already authored; verify the spec archives correctly).
- [x] 8.3 Verify `bun --filter @unveiled/api run specs:check` is green (TypeSpec artifacts are in sync) and `bun --filter @unveiled/api run openapi:check` is green (Hono OpenAPI matches TypeSpec modulo server URL).
- [x] 8.4 Update `CONTRIBUTING.md` to reflect the new script names and the per-package layout.

## 9. Final Verification

- [x] 9.1 Run `bun install` and confirm the lockfile is in sync.
- [x] 9.2 Run `bun run db:migrate:local` and confirm the local PGlite database accepts the shared migration history.
- [x] 9.3 Run `bun run build` and confirm both `@unveiled/design-system` and `@unveiled/app` produce their bundles.
- [x] 9.4 Run `bun run check` and confirm the umbrella passes (astro check, biome check, specs:check, tokens:check).
- [x] 9.5 Run `bun run preview:cloudflare` and confirm the Astro Cloudflare adapter resolves `wrangler.app.toml`, the preview server starts, and SSR pages render at `http://localhost:8787/app/...`.
- [x] 9.6 Run `bun run test:e2e`, `bun run test:ladle`, and `bun run test:visual` and confirm the gherkin parity suite, the Ladle interaction suite, and the visual regression suite are all green.
- [x] 9.7 Run `openspec validate extract-app-package` and confirm the change passes validation.
- [x] 9.8 Run `rg "src/" packages/app/src` and `ls src` to confirm the top-level `src/` tree is gone.
- [x] 9.9 Update `AGENTS.md` and `CONTRIBUTING.md` if any of the stack, file layout, toolchain commands, or definition of done changed.
- [x] 9.10 Hand off to a human reviewer with a green CI; do not self-merge. Once merged, run `openspec archive extract-app-package` to fold the spec deltas into `openspec/specs/`.
