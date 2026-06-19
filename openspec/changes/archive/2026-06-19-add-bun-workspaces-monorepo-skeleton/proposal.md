## Why

The repo is a single Astro application rooted at the repo root. The 12-iteration goal is a Bun-workspace monorepo with four packages (`@unveiled/design-system`, `@unveiled/api`, `@unveiled/app`, `@unveiled/landing`), but none of those packages can exist until the repo has Bun workspace plumbing, root `tsconfig` path aliases, a shared `biome.json` that walks all packages, and CI scripts that fan out per-package. This change is the pure-tooling prerequisite for 01–06 and intentionally touches no production behavior.

## What Changes

- Convert the root `package.json` into a Bun workspace root: add `"workspaces": ["packages/*"]`, set `"private": true`, and keep all existing root scripts (delegating via `bun --filter` or per-package `bun run` invocations).
- Create the canonical four-package skeleton with `package.json`, `tsconfig.json` (extending a new `packages/tsconfig.base.json`), and `README.md` per package. Skeletons stay empty except where a later change populates them.
- Add a root `tsconfig.base.json` exporting `compilerOptions.paths` for `@unveiled/design-system`, `@unveiled/api`, `@unveiled/app`, `@unveiled/landing`, plus the legacy `@/` alias retained as a compatibility shim for the migration (removed in change 04). `compilerOptions.baseUrl` points at the repo root.
- Update `biome.json` to include `packages/**` in its scan globs and to use the root `tsconfig.base.json` for the import resolver.
- Update CI scripts (`bun run check`, `bun run test:e2e`, `bun run ladle:coverage`, `bun run specs:check`, `bun run tokens:check`, `bun run arch:check`) so each either runs once at the root and recursively walks packages via Biome/Playwright/drizzle-kit globs that include `packages/**`, or fans out via `bun --filter '*' run <script>` for per-package tasks.
- Add root scripts that explicitly fan out: `bun run lint:workspaces` (`biome check packages/`), `bun run typecheck:workspaces` (`bun --filter '*' run typecheck`), `bun run test:workspaces` (`bun --filter '*' run test:unit`).
- Add `packages/README.md` documenting the package contract: every package MUST expose `dev`, `build`, `typecheck`, `lint` scripts; package-internal imports MUST use the `@unveiled/*` alias; cross-package relative imports are forbidden.
- Add `.gitignore` entries for `packages/*/dist`, `packages/*/.astro`, `packages/*/node_modules`, `packages/*/coverage`.

## Capabilities

### New Capabilities

- `monorepo-tooling`: the Bun workspace + path-mapped + Biome-walked monorepo skeleton. Enforces the four-package layout, the `@unveiled/*` import alias contract, and the CI fan-out behavior. Carries no user-visible behavior of its own; everything else in 01–06 builds on it.

### Modified Capabilities

- _None._ The existing `app-shell`, `routing`, `openapi-contract`, and other capabilities are not touched; their code stays under `src/` until changes 01–04 move it.

## Impact

- **New files:**
  - `tsconfig.base.json`
  - `packages/tsconfig.base.json` (shared base extended by each package)
  - `packages/design-system/{package.json, tsconfig.json, README.md}` — skeleton; populated by change 01
  - `packages/api/{package.json, tsconfig.json, README.md}` — skeleton; populated by change 02
  - `packages/app/{package.json, tsconfig.json, README.md}` — skeleton; populated by change 04
  - `packages/landing/{package.json, tsconfig.json, README.md}` — skeleton; populated by change 05
  - `packages/README.md`
- **Modified files:**
  - `package.json` — adds `"workspaces"`, sets `"private": true`; leaves deps hoisted at the root for now; per-package `dependencies` start empty until 01–05.
  - `tsconfig.json` — extends `tsconfig.base.json`.
  - `biome.json` — adds `packages/**` to `include`.
  - `.gitignore` — adds per-package output ignores.
- **Removed files:** _none._
- **Dependencies changed:** _none._ Bun workspace metadata only; the lockfile still hoists as today.
- **Risks:**
  - **Path-alias regressions.** Existing imports under `src/` use the `@/` alias. Mitigation: keep `@/` as a compatibility alias that resolves into `packages/app/src/**` from change 04 onward; remove only after `bun run check` is green in `packages/app`.
  - **CI fanning out vs. running once.** Some scripts (Biome, Playwright) work root-only; others (TypeScript per package) must fan out. Mitigation: document the rule per script in `packages/README.md` and gate on `bun run check` before each per-package cutover.
  - **Bun workspace + Astro Cloudflare adapter.** The current `astro.config.mjs` resolves deps from the root `node_modules`. Mitigation: keep deps hoisted (don't switch to per-package installs yet) and revisit isolated installs after change 06 ships.
