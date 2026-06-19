## Why

Today the design system lives inside `src/components/ui/` of the single Astro app. The HeroUI replica sits at `src/components/ui/heroui-replica/` and is gated by `bun run heroui-design-system-replica:check`. With the monorepo skeleton in place (change 00 — see `packages/README.md`), the design system needs to become its own package: `@unveiled/design-system`. It will own the production UI primitives, the Ladle-only HeroUI replica, the Ladle harness, the design-token CSS, and the coverage / isolation gates — so both `@unveiled/app` and `@unveiled/landing` can consume the same surface and the Ladle harness stops being tied to the Astro app's build.

## What Changes

- Add `packages/design-system/` as a Bun workspace member (`@unveiled/design-system`, `private: true`) shipping production UI primitives, the Ladle-only HeroUI replica, the Ladle config + coverage scripts, and the design-token CSS that downstream packages consume.
- Move every production primitive from `src/components/ui/*.tsx` into `packages/design-system/src/` with **no behavior change**, updating their imports to use the package's relative paths (the package is consumed via the `@unveiled/design-system` alias declared in `tsconfig.base.json`).
- Update every consumer under `src/components/unveiled/**`, `src/components/payments/**`, `src/components/providers/**`, `src/pages/**`, `src/layouts/**`, and `src/actions/**` to import the primitives from `@unveiled/design-system` instead of `@/components/ui/...`. The legacy `@/components/ui/...` alias is removed by change 04.
- Move the HeroUI replica (`src/components/ui/heroui-replica/`) to `packages/design-system/src/heroui-replica/` verbatim, preserving the `// @ladle-only` headers and the import-isolation guard.
- Move the Ladle config (`ladle.config.ts`) into `packages/design-system/` and have the root `bun run ladle`, `bun run ladle:build`, `bun run ladle:coverage` scripts delegate to `bun --filter @unveiled/design-system run <script>`. `scripts/check-heroui-design-system-replica.ts` and `tests/ladle/coverage.ts` are moved into the package; their scan-target constants are updated to `packages/design-system/src/**`.
- Keep `tests/ladle/ladle.spec.ts` and `tests/ladle/smoke-*.ladle.tsx` at the repo root (Playwright test discovery path) and update the root `playwright.config.*` so the `ladle` project's `testDir` is `./tests/ladle` and the Ladle static build is served at `/ladle/` from `packages/design-system/dist/ladle/` once `bun run ladle:build` writes there.
- Update `tests/unit/no-ladle-replica-in-production.test.ts` to scan the new replica path `packages/design-system/src/heroui-replica/` and the legacy `src/components/ui/` directory; once changes 04 and 05 land, the scan target is updated to `packages/app/src/**` and `packages/landing/src/**`.
- Relocate `src/styles/generated/tokens.css` to `packages/design-system/src/styles/generated/tokens.css` and have `src/styles/global.css` re-import it through the package's `exports` map. `bun run tokens:gen` and `bun run tokens:check` are updated to read/write the new path.
- **Dependency hoisting is preserved.** Per `packages/README.md`, all dependencies stay hoisted at the repo root until change 06. `@nextui-org/react`, `@tailwindcss/vite`, `tailwindcss`, `@ladle/react`, `react-aria-components`, `react`, `react-dom`, and the Biome / Ladle / Playwright devDeps remain at the root. The package's `dependencies` / `devDependencies` stay empty for change 01.

## Capabilities

### New Capabilities

- `design-system-package`: `@unveiled/design-system` is a Bun workspace package exposing the production UI primitives and the Ladle-only HeroUI replica. It enforces the import-isolation gate, owns the Ladle harness, owns design-token CSS, and is consumed by `@unveiled/app` and `@unveiled/landing`.

### Modified Capabilities

- `heroui-ladle-design-system`: the HeroUI replica is now located at `packages/design-system/src/heroui-replica/` and is published from the `@unveiled/design-system` package instead of co-located under `src/components/ui/`. The capability contract (no production imports, brand-token-driven theme, co-located `Hero<Name>.ladle.tsx` per primitive, overview page) is unchanged — only the import paths are updated.
- `ui-system`: production primitives are now resolved through `@unveiled/design-system` rather than `@/components/ui`. The visible / behavioral / accessibility contract is unchanged; only the import paths are updated.
- `ui-system-heroui-parity`: the parity suite consumes primitives through `@unveiled/design-system`; the `@ladle(component=…, story=…)` tags resolve to stories shipped by the package.
- `design-tokens`: design-token CSS is now generated into `packages/design-system/src/styles/generated/tokens.css` and consumed by `@unveiled/app` and `@unveiled/landing` via the package's `exports` map. `bun run tokens:gen` and `bun run tokens:check` continue to enforce drift but now write into and check the package-owned output.

## Impact

- **New files:** `packages/design-system/{package.json, tsconfig.json, ladle.config.ts, biome.json, src/index.ts, src/heroui-replica/index.ts, src/styles/generated/tokens.css, …}`. The exact tree is enumerated in `tasks.md`.
- **Modified files:**
  - `package.json` (root) — drops moved scripts (`ladle`, `ladle:build`, `ladle:coverage`, `heroui-design-system-replica:check`), adds `bun --filter @unveiled/design-system run <script>` shims.
  - `playwright.config.*` — `ladle` project's `testDir` is updated to `./tests/ladle`, `baseURL` updated to point at `packages/design-system/dist/ladle/` when Ladle is built.
  - `biome.json` — scan globs already include `packages/**` from change 00.
  - `tsconfig.base.json` (root) — `@unveiled/design-system` path alias resolves to `packages/design-system/src/index.ts` (already declared by change 00).
  - `src/styles/global.css` — re-imports the design-token CSS from `@unveiled/design-system/styles/generated/tokens.css`.
  - `scripts/check-heroui-design-system-replica.ts`, `scripts/generate-design-tokens.ts`, `scripts/check-design-tokens.ts`, `tests/ladle/coverage.ts` — relocated into `packages/design-system/scripts/`.
  - `packages/design-system/ladle.config.ts` — new, mirroring the current root config.
  - Every file under `src/components/ui/**` — relocated into `packages/design-system/src/**`.
  - 20 consumer files under `src/components/unveiled/**`, `src/components/payments/**`, `src/components/providers/**`, `src/pages/**`, `src/layouts/**`, and `src/actions/**` — import paths rewritten from `@/components/ui/...` to `@unveiled/design-system`.
- **Removed files:** the empty `src/components/ui/` folder once the move is complete. The legacy `@/components/ui/...` alias remains in `tsconfig.base.json` until change 04.
- **Dependencies changed:** none at change 01. All dependencies stay hoisted at the root per `packages/README.md`. `@unveiled/design-system`'s `dependencies` / `devDependencies` stay empty until change 06.
- **Risks:**
  - **React 19 + HeroUI.** Already pinned; carrying the constraint forward into the package.
  - **Astro SSR + Tailwind v4 plugin path.** The `@tailwindcss/vite` plugin currently lives in the root Astro config. Mitigation: move the plugin registration into `packages/app/astro.config.mjs` and `packages/landing/astro.config.mjs` and re-export the design-system CSS through each Astro app's `global.css` import chain (executed here for the existing single Astro app; the package move only touches plugin discovery).
  - **Ladle output location.** `bun run ladle:build` currently writes to `public/ladle/` at the repo root, which is what `bun run test:ladle` and the production deploy both rely on. Mitigation: the package's `ladle:build` script writes to `packages/design-system/dist/ladle/`, and a tiny Astro static-asset mount (added in change 04) re-exposes it at `/ladle/` in production so the contract holds.