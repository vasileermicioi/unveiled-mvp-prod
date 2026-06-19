## Context

The repo is currently a single Astro 6 application rooted at the repo root. All source lives under `src/`, the only `package.json` is the root one, TypeScript resolves imports via the `@/` alias declared in the root `tsconfig.json`, and `biome.json` walks `src/` plus a few other top-level globs. The 12-iteration goal introduces four deployable units — `@unveiled/design-system`, `@unveiled/api`, `@unveiled/app`, `@unveiled/landing` — that must share types, design tokens, and CI without each package carrying a duplicate copy of the entire repo.

Today there is no workspace plumbing: no `workspaces` field, no per-package `tsconfig`, no shared `tsconfig.base.json` for paths, and no Biome globs that look at `packages/`. Bun's workspace support is the natural fit because the toolchain is already pinned to Bun (per `AGENTS.md` §2) and the lockfile is `bun.lock`.

Constraints:

- **No production behavior changes.** This change is pure tooling; nothing under `src/`, `drizzle/`, `typespec/`, or the Astro routes moves.
- **No new dependencies.** `bun.lock` must continue to hoist; we are not introducing per-package `node_modules` yet.
- **No TypeScript or Biome version bumps.** The version pins in `package.json` stay exactly as they are.
- **The legacy `@/` alias must keep working** until change 04 finishes moving `src/` into `packages/app/src/` and rewires the alias to point there.
- **`AGENTS.md` and `docs/guidelines.md` are the source of truth for conventions.** This design conforms to them; it does not amend them.

Stakeholders: the maintainer (who will own changes 01–06) and the CI pipeline (`bun run check`, Playwright, Ladle, TypeSpec, LikeC4, Style Dictionary), all of which must stay green.

## Goals / Non-Goals

**Goals:**

- Stand up a Bun workspace with four named members whose `name` field matches `@unveiled/<pkg>`.
- Establish a single source of truth for path aliases in `tsconfig.base.json` so future per-package `tsconfig.json` files extend it.
- Make Biome, the Astro check, Playwright, TypeSpec, and Style Dictionary all continue to work without script changes outside `package.json` and `biome.json`.
- Add three explicit fan-out root scripts (`lint:workspaces`, `typecheck:workspaces`, `test:workspaces`) so change 04 can run them in isolation.
- Keep the `src/` tree, the Astro Cloudflare adapter, and the existing `bun.lock` layout intact.

**Non-Goals:**

- Moving any `src/` files into a package.
- Splitting dependencies across packages (everything stays hoisted).
- Introducing per-package `node_modules` or `bun install --no-hoist` behavior.
- Adding a build orchestrator (Turborepo, Nx, moon, etc.).
- Touching the Astro config, the Cloudflare adapter, or `wrangler.toml`.
- Modifying the TypeSpec, LikeC4, or design-token generation pipelines beyond widening their scan globs to include `packages/`.

## Decisions

### D1. Bun workspaces over npm/pnpm/yarn workspaces

The toolchain is already pinned to Bun (`bun.lock` is committed and the `AGENTS.md` mandates `bun` for install/scripts/CLIs). Bun's workspace support is native, lockfile-compatible with the current hoisted layout, and avoids introducing a second package manager. Alternatives considered: `npm workspaces` (requires dropping the `bun.lock` lockfile), `pnpm` (would force a non-hoisted install and break the Astro Cloudflare adapter's `node_modules` resolution today), Yarn 4 PnP (incompatible with the Astro toolchain).

### D2. Single root `tsconfig.base.json` plus `packages/tsconfig.base.json`

Two bases serve two different audiences. The **root** `tsconfig.base.json` declares `compilerOptions.paths` for `@unveiled/*` (the cross-package alias) and `@/` (the compatibility shim), and is the file the Astro check and any root-level tool reads. The **packages** `tsconfig.base.json` declares shared compiler options (`strict`, `moduleResolution`, `target`, `jsx`, etc.) so each package's `tsconfig.json` is a 5-line `extends`. This split keeps the path-alias table at the root where it can be edited in one place, while letting each package opt in to its own compiler knobs later (e.g., the design system may want `noEmit: true`).

Alternatives considered: a single root `tsconfig.base.json` (forces every package to inherit the path table it doesn't need) and per-package standalone `tsconfig.json` with no base (drift between packages).

### D3. Compatibility shim for the `@/` alias

`src/` imports use `@/...` and that is the entire import surface area of the existing app. Two options were on the table: (a) keep `@/` pointing at `src/` (status quo) and add `@unveiled/*` aliases alongside it; (b) start pointing `@/` at `packages/app/src/**` immediately. We chose (a) because option (b) requires moving `src/` into `packages/app/src/` first, which is change 04. The compatibility shim is a single line in `tsconfig.base.json` and is removed by change 04. The `tsconfig.json` `include` glob continues to cover `src/`.

### D4. Biome walks `packages/**` via `include`, not a custom config per package

`biome.json` already globs `src/**` and a handful of other paths. Adding `packages/**` to `include` is a one-line change that lets `biome check .` and the new `biome check packages/` both work. Per-package `biome.json` would force each package to redeclare the formatter rules, the import resolver config, and the ignore list — a maintenance hazard for no benefit at this stage.

### D5. Root-level scripts stay root-level; only add fan-out scripts for per-package work

The Astro check, Playwright, TypeSpec, LikeC4, and Style Dictionary tools all read from the repo root and walk the tree themselves; widening their globs is cheaper and safer than fanning out per package. Conversely, TypeScript compilation is per-package in spirit, so the new `typecheck:workspaces` and `test:workspaces` scripts use `bun --filter '*'` to fan out. The rule — recorded in `packages/README.md` — is: tool that owns the root, run at the root with a wider glob; tool that's per-package, fan out via `bun --filter`.

Alternatives considered: fanning out everything via `bun --filter` (breaks Astro's root-relative `astro.config.mjs` and the Playwright config), running everything from the root (defeats the per-package `typecheck` script that change 04 will rely on).

### D6. Per-package `dependencies` start empty

Each new `packages/*/package.json` has `"private": true`, an empty `dependencies` object, and the four required scripts. The root `package.json` keeps all current dependencies hoisted. The first change that needs a cross-package import (change 01 populating the design system) adds the matching `devDependencies` to that package. This avoids an interim state where two `node_modules` trees disagree on versions.

### D7. `.gitignore` entries are wildcarded

The four `packages/*/{dist,.astro,node_modules,coverage}` ignores cover every build artifact any current or future package is expected to produce. They sit alongside the existing `dist` and `node_modules` ignores. We do **not** add a blanket `packages/*` ignore because the package source files must stay tracked.

## Risks / Trade-offs

- **Path-alias regressions.** Existing `@/...` imports must keep resolving. → Mitigation: keep the `@/` path in `tsconfig.base.json` pointing at `src/` for the duration of the migration; remove it in change 04 only after `bun run check` is green in `packages/app`.
- **Bun workspace + Astro Cloudflare adapter.** The current `astro.config.mjs` resolves deps from the root `node_modules`. Hoisting must continue. → Mitigation: do not enable `bun install --no-hoist`; document the decision in `packages/README.md`; revisit after change 06.
- **CI fanning out vs. running once.** Mixed strategy is easy to break. → Mitigation: every fan-out script is its own `package.json` entry with a comment-free, descriptive `name`; `packages/README.md` enumerates which scripts fan out and which run once; the apply phase verifies both styles still exit 0.
- **Path-table drift between root and per-package tsconfigs.** A future PR may add a path alias to one but not the other. → Mitigation: the only path table lives in `tsconfig.base.json`; per-package `tsconfig.json` files extend it without redeclaring `paths`; `bun run check:tsc` (folded into `bun run check` after change 04) catches drift.
- **Biome's `tsconfig` import resolver may not auto-discover `packages/tsconfig.base.json`.** The Biome docs say the resolver reads the nearest `tsconfig.json`. → Mitigation: the root `tsconfig.json` extends `tsconfig.base.json`, so Biome's resolver reads the root `tsconfig.json` and inherits the `paths` table transitively; the per-package `tsconfig.json` files are only read by `tsc`, not by Biome.
- **Empty package scripts may break `bun --filter '*' run typecheck`.** An empty `typecheck` script will error. → Mitigation: each package's `typecheck` is `tsc --noEmit` against its own `tsconfig.json`, which exits 0 on an empty source tree.
