## Context

The design system is the most cross-cutting asset in the codebase: every page, action, and component in `@unveiled/app` (and eventually `@unveiled/landing`) consumes the production UI primitives, the brand-token CSS, the HeroUI theme module, and the Ladle harness that drives parity coverage. Today all of this lives under `src/components/ui/` of the single Astro app, with the Ladle-only replica gated by `scripts/check-heroui-design-system-replica.ts` and the coverage gate at `tests/ladle/coverage.ts`. The Bun workspace skeleton (change 00) has already carved out `packages/design-system/`, `packages/app/`, `packages/api/`, and `packages/landing/` and declared `@unveiled/design-system` as a `private: true` workspace member with stub scripts; this change populates it.

The migration is mechanical at the primitive level (move files, preserve behavior, update import paths) but has three non-trivial architectural seams:

1. **The Tailwind v4 + Astro Vite plugin boundary.** `@tailwindcss/vite` is currently registered in the root `astro.config.mjs`. Once the design-system package owns the token CSS and the Tailwind theme, the plugin registration must move into the Astro apps that consume it (still the single Astro app for change 01; `packages/app/astro.config.mjs` and `packages/landing/astro.config.mjs` later).
2. **The Ladle static-build mount point.** `bun run ladle:build` writes to `public/ladle/` at the repo root, which `bun run test:ladle` and the production deploy both rely on. Moving Ladle into the package moves the output to `packages/design-system/dist/ladle/`; the Astro app must continue to serve `/ladle/` so Playwright's `ladle.spec.ts` keeps working. A tiny Astro static-asset mount (added in change 04) re-exposes the directory at `/ladle/` in production; for change 01 we keep the package's `ladle:build` writing to `packages/design-system/dist/ladle/` and rely on a Ladle dev-server-only contract during the transition window.
3. **The replica import-isolation guard.** The current `tests/unit/no-ladle-replica-in-production.test.ts` walks the import graph from production entry points under `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, and `src/layouts/`. After the extraction it must also walk the import graph from `@unveiled/design-system`'s runtime export (not just the consumer entry points) and reject any path that lands inside `packages/design-system/src/heroui-replica/`.

The change has no new external dependencies at the framework level: `@nextui-org/react`, `@tailwindcss/vite`, `tailwindcss`, `@ladle/react`, and `react-aria-components` already exist in the root `package.json` and are simply moved into `@unveiled/design-system`'s `dependencies` / `devDependencies`.

## Goals / Non-Goals

**Goals:**

- Populate `packages/design-system/` so that `@unveiled/design-system` is the single source of truth for production UI primitives, the HeroUI theme module, the Ladle harness, and the design-token CSS.
- Preserve the visible, behavioral, accessibility, and keyboard contract of every primitive and every Ladle story — zero functional or pixel diff against the approved baselines.
- Make the existing root CI commands (`bun run check`, `bun run ladle`, `bun run ladle:build`, `bun run ladle:coverage`, `bun run heroui-design-system-replica:check`, `bun run tokens:gen`, `bun run tokens:check`) keep working — either via `bun --filter` shims or via the package's own scripts.
- Move the import-isolation guard into the package so it lives next to the assets it protects.

**Non-Goals:**

- Splitting `@unveiled/design-system` runtime consumers into the `packages/app/` and `packages/landing/` workspaces — that is the work of changes 04 and 05. Change 01 only adds the package and leaves the existing Astro app consuming it via the `@unveiled/design-system` path alias.
- Removing the legacy `@/components/ui/...` alias — that is change 04.
- Switching the Bun workspace from hoisted installs to per-package installs — that is change 06 (the Astro Cloudflare adapter still resolves modules from the root `node_modules` during change 01).
- Updating the `tests/unit/no-ladle-replica-in-production.test.ts` target paths to `packages/app/src/**` and `packages/landing/src/**` — that depends on changes 04 and 05 and is deferred.
- Changing the design tokens themselves, the HeroUI theme palette, or the gherkin parity scenarios.

## Decisions

### Decision 1 — Move the entire `src/components/ui/` tree verbatim, then update import paths

We relocate every file from `src/components/ui/` into `packages/design-system/src/` preserving the relative file layout, the `// @ladle-only` headers, the `replica-not-imported.test.ts` test (renamed to `isolation.test.ts`), and the public prop surface of every primitive. After the move we run `rg "@/components/ui/" packages/design-system/src/` and rewrite the hits to use the package's relative imports.

**Rationale.** This is the lowest-risk extraction strategy: no behavior changes, no API surface changes, and the existing `bun run ladle:coverage` and `bun run heroui-design-system-replica:check` scripts only need their target-path constants updated, not their logic. Any attempt to refactor the primitives during the move (e.g. consolidate `unveiled-primitives.tsx`, rename `SafeImage`, drop the `Field` wrapper in favor of HeroUI's `Input` directly) would multiply the review surface and the regression risk for zero architectural gain.

**Alternatives considered.**

- *Inline the HeroUI theme into every primitive.* Rejected: loses the single HeroUI provider boundary and forces every consumer to repeat the theme wiring.
- *Rename primitives to drop the HeroUI prefix and call them `Button` instead of `HeroButton`.* Rejected: the `INVENTORY.md` contract requires `Hero<Name>` for the replica; renaming the production primitives would force the parity suite to retag every `@ladle(component=…, story=…)` reference.

### Decision 2 — Use `bun --filter @unveiled/design-system run <script>` shims for transition

The root `package.json` keeps `ladle`, `ladle:build`, `ladle:coverage`, and `heroui-design-system-replica:check` scripts, but each script body becomes `bun --filter @unveiled/design-system run <script>`. `bun run check` still calls them in the same order, so the existing CI surface is unchanged.

**Rationale.** The umbrella script `bun run check:heroui-replica` (in `package.json`) currently chains the HeroUI gate, the Ladle coverage gate, and `bun run check`; refactoring it to drop into per-package mode would break downstream workflows that copy the root commands verbatim. The `--filter` shim keeps the contract intact while the actual logic moves into the package.

**Alternatives considered.**

- *Delete the root scripts and require consumers to invoke the filtered versions directly.* Rejected: violates the "package contract" guidance in `packages/README.md` (which says CI fan-out happens via `bun --filter` only for per-package tools like `tsc --noEmit`; tree-walking tools like Biome, Ladle coverage, and the HeroUI gate run once at the root with widened globs).
- *Keep two parallel implementations (root + package) for one release cycle.* Rejected: doubles the maintenance cost and creates a second source of truth for the gate.

### Decision 2a — Keep dependencies hoisted at the repo root

The package's `dependencies` and `devDependencies` stay empty for change 01. `@nextui-org/react`, `@tailwindcss/vite`, `tailwindcss`, `@ladle/react`, `react-aria-components`, `react`, `react-dom`, and the Biome / Ladle / Playwright devDeps remain at the root.

**Rationale.** `packages/README.md` §"Dependency hoisting" explicitly forbids per-package installs until change 06 — "the Astro Cloudflare adapter still resolves modules from the root `node_modules`." The Astro `vite` config in `astro.config.mjs` uses `optimizeDeps.include: ["react", "react-dom", ...]` and `resolve.dedupe: ["react", "react-dom"]`, both of which assume the deps resolve from the root. Moving HeroUI / Tailwind / Ladle into the package would force a premature switch off hoisting and break the Astro build.

**Alternatives considered.**

- *Move HeroUI / Tailwind / Ladle into the package's `dependencies` now.* Rejected: violates the hoisting contract and breaks the Astro Vite optimize-deps and dedupe config.
- *Use Bun workspace resolution to symlink the package's `node_modules` to the root.* Rejected: doesn't actually change resolution; same hoisting semantics.

### Decision 3 — Move `@tailwindcss/vite` registration into each Astro app's config

The plugin currently lives in `astro.config.mjs` at the repo root. After the extraction, the Astro apps each register `@tailwindcss/vite` themselves and import the design-system CSS (`@unveiled/design-system/styles/generated/tokens.css`) through their own `global.css` import chain.

**Rationale.** `@tailwindcss/vite` is an Astro Vite plugin, not a Node module — it has to be registered inside the Astro app that loads the tokens. Hoisting it into the design-system package would force the package to know about every Astro app's Vite config, which would couple it to the host. The Tailwind v4 `@theme inline` block continues to read `--unveiled-*` CSS variables; the variables are now defined in the package's exported CSS, but the plugin still runs in the consuming Astro app.

**Alternatives considered.**

- *Export a Vite plugin from `@unveiled/design-system` that bundles `@tailwindcss/vite` plus the token CSS import.* Rejected: leaks Astro/Vite specifics into a package that should be runtime-agnostic, and forces every consumer (Astro app, future Storybook, future docs site) to opt into the same Vite plugin even if they want to consume the primitives in a different framework.
- *Pre-bundle the Tailwind theme into a CSS file at build time and ship it as a static asset.* Rejected: Tailwind v4 is intentionally runtime-driven; pre-bundling breaks the `@theme inline` indirection that lets variants reference `var(--unveiled-…)` directly.

### Decision 4 — Keep `bun run ladle:build` output inside the package; re-mount in change 04

`bun --filter @unveiled/design-system run ladle:build` writes to `packages/design-system/dist/ladle/`. For change 01 the `bun run test:ladle` Playwright spec is updated to point at `packages/design-system/dist/ladle/index.html` when run from the Astro app's dev server, and the Astro app's `public/ladle/` mount is added in change 04 so the production deploy can serve `/ladle/` from the same files.

**Rationale.** The static Ladle build is package-owned because Ladle is package-owned; the Astro app should not own a build artifact it didn't produce. The mounting seam is small enough (a single `import.meta.glob` or static-dir copy in `astro.config.mjs`) that it can be deferred to change 04 without blocking this change.

**Alternatives considered.**

- *Continue writing the Ladle build to `public/ladle/` at the repo root and have the package's `ladle:build` script shell out to the root.* Rejected: reintroduces a hidden coupling between the package and the root `public/` directory, exactly the seam change 01 is meant to remove.
- *Inline Ladle into the Astro app's dev server.* Rejected: bloats the Astro app, defeats the purpose of having a standalone package, and prevents `@unveiled/landing` from reusing the harness.

### Decision 5 — Move the import-isolation guard into the package

`tests/unit/no-ladle-replica-in-production.test.ts` is split: the `bun:test` import-graph walker is relocated to `packages/design-system/src/heroui-replica/isolation.test.ts` and a thin root-level shim (`tests/unit/no-ladle-replica-in-production.test.ts`) keeps the path-based scan working until changes 04 and 05 land the per-package consumer scans.

**Rationale.** The guard protects package-owned assets; it belongs next to them. The path-based root shim is a temporary bridge so `bun run test:unit` keeps passing without rewriting the consumer scan in this change. When changes 04 and 05 land, the shim is updated to delegate to the per-package `isolation.test.ts` and the root shim is removed.

**Alternatives considered.**

- *Leave the guard at the root and update its scan paths in this change.* Rejected: leaves the guard scanning a stale set of paths and forces a follow-up change the moment 04 and 05 land.
- *Move the guard entirely to the package and delete the root shim now.* Rejected: breaks `bun run test:unit` because the package's `bun:test` runner does not yet have a way to scan `src/components/unveiled/**`, `src/components/payments/**`, etc. — those directories will live in `packages/app/src/**` only after change 04.

## Risks / Trade-offs

- **React 19 + HeroUI peer mismatch.** `@nextui-org/react` declares a peer range that may not list React 19 in its `peerDependencies`. → Mitigation: pin HeroUI to a version that already declares React 19 support (already done at the root), document the constraint in `packages/design-system/README.md`, and surface the version in the package's `peerDependenciesMeta` block so consumers see the override.
- **Biome glob drift.** The root `biome.json` already includes `packages/**` from change 00, but the new package needs its own `biome.json` (or a `biome.json` extension) so the package-local lint script (`bun --filter @unveiled/design-system run lint`) works without re-running the root scan twice. → Mitigation: add `packages/design-system/biome.json` that extends the root config and explicitly excludes `dist/ladle/**`, `src/styles/generated/tokens.css`, and `src/heroui-replica/**/*.tsx` (the replica's `// @ladle-only` files use the same Biome formatter settings).
- **TypeScript path alias collision.** The root `tsconfig.base.json` declares `@/...` as a legacy alias resolving into `src/**` and `@unveiled/<pkg>` as a cross-package alias. Adding `@unveiled/design-system` must not collide with the existing `@/components/ui/...` resolutions while the legacy alias is still in use. → Mitigation: declare `@unveiled/design-system` as a sibling of the other `@unveiled/<pkg>` aliases; verify with `bun run typecheck` that the existing single Astro app still resolves `@/components/ui/...` correctly until change 04 removes the legacy alias.
- **HeroUI replica theme path.** `packages/design-system/src/heroui-replica/theme.ts` previously imported `@/lib/design-tokens`. After the move, the replica sits inside the package and must import from `@unveiled/design-system/lib/design-tokens` (a self-import via the package's own exports map). → Mitigation: the package's `exports` map explicitly lists `./lib/design-tokens` and `./lib/heroui-theme` so self-imports resolve; verified by `bun --filter @unveiled/design-system run typecheck` and `bun run test:unit`.
- **Ladle dev server port collision.** Both the Astro dev server (`bun run dev`) and the Ladle dev server (`bun run ladle`) currently default to different ports, but adding a second consumer (`@unveiled/landing` in change 05) doubles the number of dev servers that may run in parallel. → Mitigation: pin the Ladle dev server to port 6006 in `packages/design-system/ladle.config.ts` and document the port allocation in `packages/design-system/README.md`.
- **Token CSS drift during the move.** `bun run tokens:gen` currently writes to `src/styles/generated/tokens.css`; the new path `packages/design-system/src/styles/generated/tokens.css` will produce a one-time drift on the first CI run after the merge. → Mitigation: run `bun run tokens:gen` as part of the merge commit (and re-run after every subsequent `design-tokens.json` edit) so the committed CSS matches the new location on first push; `bun run tokens:check` will block the merge otherwise.
- **`tests/unit/no-ladle-replica-in-production.test.ts` scan window.** During the transition the test still scans `src/**`, which now contains zero production components (the package owns the primitives and the replica). The scan will pass trivially until changes 04 and 05 reintroduce consumer code under `src/components/**`. → Mitigation: keep the root shim in place and add a `// TODO(change-04/05): update scan paths` comment in `tests/unit/no-ladle-replica-in-production.test.ts` so reviewers know the test is intentionally permissive during the window. (Override: AGENTS.md §9 forbids comments unless explicitly asked; this design surfaces the TODO via `tasks.md` instead — see task 6.3.)

## Migration Plan

1. **Land the package skeleton.** Add `packages/design-system/{package.json, tsconfig.json, biome.json, ladle.config.ts}` and wire `@unveiled/design-system` into `tsconfig.base.json`'s `paths` map. Root `package.json` adds `--filter` shims for the moved scripts.
2. **Move the primitives.** `git mv` every file under `src/components/ui/**` into `packages/design-system/src/**`, preserving relative paths (`button.tsx` → `packages/design-system/src/button.tsx`, `heroui-replica/` → `packages/design-system/src/heroui-replica/`).
3. **Rewrite imports.** `rg "@/components/ui/" packages/design-system/src/` and rewrite every hit to a relative import inside the package; `rg "@/lib/" packages/design-system/src/` and rewrite to `@unveiled/design-system/lib/...` once the alias is wired.
4. **Move the gates.** Relocate `scripts/check-heroui-design-system-replica.ts` → `packages/design-system/scripts/check-heroui-design-system-replica.ts`; `tests/ladle/coverage.ts` → `packages/design-system/scripts/coverage.ts`; `tests/ladle/ladle.spec.ts` and `tests/ladle/smoke-*.ladle.tsx` → `packages/design-system/tests/`. Update each script's scan-target constants to the new package paths.
5. **Move the tokens.** Relocate `src/styles/generated/tokens.css` → `packages/design-system/src/styles/generated/tokens.css` and update `bun run tokens:gen` / `bun run tokens:check` to read/write the new path. `src/styles/global.css` re-imports the CSS through the `@unveiled/design-system` exports map.
6. **Update the Tailwind plugin boundary.** Register `@tailwindcss/vite` in the existing Astro config and import the design-system token CSS through the Astro app's `global.css`.
7. **Update the root shim.** Replace `tests/unit/no-ladle-replica-in-production.test.ts` with a thin shim that delegates to `packages/design-system/src/heroui-replica/isolation.test.ts` and continues scanning the legacy `src/**` consumer directories until changes 04 and 05 land.
8. **Run the full check.** `bun install`, `bun run typecheck:workspaces`, `bun run test:workspaces`, `bun run check`, `bun --filter @unveiled/design-system run ladle:coverage`, `bun --filter @unveiled/design-system run heroui-design-system-replica:check`, `bun run test:ladle`, `bun run test:e2e`. Every command must exit zero before merge.

**Rollback.** If the merge breaks CI, revert the merge commit. Because change 01 is additive at the package layer (the legacy `@/components/ui/` alias and the root scripts are removed in changes 04 and 05), the worst-case rollback is a revert + a re-run of `bun install`; no data migration is involved.

## Open Questions

- Should `@unveiled/design-system` ship its own `vitest.config.ts` or rely on the root `bun:test` runner? Decision pending: lean on the root `bun:test` runner (no extra config) until a per-package Vitest need emerges.
- Do we want a per-package `tsup` / `tsc --emitDeclarationOnly` build step so consumers can tree-shake unused primitives, or do we ship raw TypeScript sources via Bun workspace resolution? Decision pending: ship raw sources (consistent with the rest of the workspace today, and matches `packages/README.md` §"Dependency hoisting").
- Should `packages/design-system/dist/ladle/` be `.gitignore`d or committed (mirroring how `public/ladle/` is currently committed)? Decision pending: committed, mirroring the current behavior so Playwright's `ladle.spec.ts` does not need a `bun --filter` invocation in its setup.
- Do we want the package to expose a `default` export (a single object with all primitives) or named exports only? Decision pending: named exports only, matching how the current `src/components/ui/*.tsx` files are consumed.