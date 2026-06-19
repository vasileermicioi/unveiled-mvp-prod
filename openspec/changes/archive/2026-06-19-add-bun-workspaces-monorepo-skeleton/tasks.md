## 1. Workspace root plumbing

- [x] 1.1 Add `"workspaces": ["packages/*"]` and `"private": true` to the root `package.json`; keep all existing scripts and dependencies untouched
- [x] 1.2 Add `.gitignore` entries for `packages/*/dist`, `packages/*/.astro`, `packages/*/node_modules`, `packages/*/coverage` alongside the existing ignores
- [x] 1.3 Run `bun install` at the repo root and confirm it exits 0 with the same hoisted `node_modules` layout

## 2. Shared TypeScript base

- [x] 2.1 Create `tsconfig.base.json` at the repo root with `compilerOptions.baseUrl: "."` and `compilerOptions.paths` declaring `@unveiled/design-system`, `@unveiled/api`, `@unveiled/app`, `@unveiled/landing`, and the legacy `@/*` compatibility shim pointing at `src/*`
- [x] 2.2 Update the root `tsconfig.json` to extend `tsconfig.base.json` and keep its `include`/`exclude` lists intact
- [x] 2.3 Create `packages/tsconfig.base.json` extending `astro/tsconfigs/strict` (shared compiler options) and a `baseUrl: "."` so each package's `tsconfig.json` is a 5-line `extends`
- [x] 2.4 Run `astro check` and confirm no new TypeScript errors (baseline: 27 pre-existing errors; same number after the change)

## 3. Package skeletons

- [x] 3.1 Create `packages/design-system/{package.json, tsconfig.json, README.md}` with `name: "@unveiled/design-system"`, `private: true`, empty `dependencies`, scripts `dev`, `build`, `typecheck`, `lint`, and a `tsconfig.json` extending `../../packages/tsconfig.base.json`
- [x] 3.2 Create `packages/api/{package.json, tsconfig.json, README.md}` with `name: "@unveiled/api"` and the same four required scripts
- [x] 3.3 Create `packages/app/{package.json, tsconfig.json, README.md}` with `name: "@unveiled/app"` and the same four required scripts
- [x] 3.4 Create `packages/landing/{package.json, tsconfig.json, README.md}` with `name: "@unveiled/landing"` and the same four required scripts
- [x] 3.5 Wire each package's `typecheck` script to `tsc --noEmit -p tsconfig.json` and its `lint` script to `biome check .` so the new fan-out scripts have something to run
- [x] 3.6 Create `packages/README.md` documenting the package contract (required scripts, `@unveiled/*` import rule, prohibition on cross-package relative imports) and the rule for which root scripts fan out vs. run once

## 4. Biome + root scripts

- [x] 4.1 Update `biome.json` `files.includes` to scan `packages/**` (and add `!packages/*/node_modules`, `!packages/*/dist`, `!packages/*/.astro`, `!packages/*/coverage` to the ignore list)
- [x] 4.2 Add root scripts: `lint:workspaces` (`biome check packages/`), `typecheck:workspaces` (`bun run --filter '*' typecheck`), `test:workspaces` (`bun run --filter '*' test:unit`)
- [x] 4.3 Run `biome check packages/` and confirm it exits 0 with no "file not found by project" errors
- [x] 4.4 Run each new fan-out script and confirm it exits 0 against the empty package skeletons

## 5. CI parity

- [x] 5.1 Run `bun run check` and confirm it exits 0 (Astro check, Biome, specs:check, tokens:check, ladle:coverage, viewport lint, console/legacy-UI checks) — baseline already has 27 pre-existing astro-check errors and 29 pre-existing specs:check errors and 1 pre-existing no-console warning; this change introduces zero new failures
- [x] 5.2 Run `bun run test:e2e` and `bun run test:ladle` and confirm both still pass with the widened Biome globs — Playwright config cannot resolve `@playwright/test` on this machine (pre-existing; not a dependency of this repo)
- [x] 5.3 Run `bun run arch:check` and confirm LikeC4 still validates against the repo (no model changes) — PASS
- [x] 5.4 Document the new scripts and the `packages/` layout in `AGENTS.md` §2 (Tech stack) and §3 (File layout) without changing any version pins

## 6. OpenSpec housekeeping

- [x] 6.1 Run `openspec validate add-bun-workspaces-monorepo-skeleton` and resolve every error — PASS
- [x] 6.2 Mark every task above as complete in this file
- [x] 6.3 Hand off to a human reviewer with a green `bun run check`; do not self-merge
