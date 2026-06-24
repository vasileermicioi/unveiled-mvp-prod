## Context

`bun ladle` currently exits 0 with the empty-state "No stories found"
message. Three independent defects converge on that symptom:

1. The dev script
   ([`packages/design-system/scripts/ladle-dev.ts`](../../../packages/design-system/scripts/ladle-dev.ts))
   spawns `ladle` with `cwd: packages/design-system/`. That directory
   has **no** `ladle.config.mjs` and **no** `.ladle/config.mjs`, so
   Ladle runs with zero configuration.
2. The only Ladle config in the repo
   ([`.ladle/config.mjs`](../../../.ladle/config.mjs)) lives at the
   repo root and globs `src/**/*.ladle.tsx`, but `src/` at the root
   no longer exists (the legacy app moved to `packages/app/src/` in
   change 04), so that glob matches zero files.
3. The 18 actual stories live at
   `packages/design-system/src/heroui-replica/*.ladle.tsx`. The
   dev script's `cwd` is the package root, **not** the package
   `src/`, so even with a config that points at
   `src/**/*.ladle.tsx`, Ladle would walk from
   `packages/design-system/` and find nothing.

Every later proposal in iteration 13 (02–06) and proposal 11 need
Ladle working to demo atoms, run `test:ladle`, and produce the
`design-system-overview` story.

## Goals / Non-Goals

**Goals:**

- `bun ladle` resolves stories from
  `packages/design-system/src/**/*.ladle.tsx`,
  `packages/app/src/**/*.ladle.tsx`,
  `tests/features/**/*.ladle.tsx`, and
  `tests/ladle/**/*.ladle.tsx`.
- `bun run ladle:build` writes a static bundle to
  `packages/design-system/dist/ladle/` whose `index.html`
  references every discoverable story.
- `bunx --bun ladle` is the single binary entry point; the
  `@ladle/react` devDependency in `packages/design-system/package.json`
  makes resolution deterministic.
- The legacy `.ladle/config.mjs` is gone; two permanent unit tests
  under `tests/unit/` guard against regression.
- The HeroUI replica stories remain visible and continue to pass
  `heroui-design-system-replica:check`.

**Non-Goals:**

- Restructuring `packages/design-system/src/` into
  `atoms|molecules|organisms|templates|pages/`. That is proposal 02.
- Removing `heroui-replica/`. That is proposal 11.
- Documenting the design-system architecture in `AGENTS.md` /
  `docs/architecture.md`. That is proposal 10.
- Changing the `// @ladle-only` invariant or the
  `heroui-design-system-replica:check` gate.

## Decisions

### Package-local `.ladle/config.mjs`

[`packages/design-system/.ladle/config.mjs`](../../../packages/design-system/.ladle/config.mjs):

```js
export default {
  stories: [
    "src/**/*.ladle.tsx",
    "../app/src/**/*.ladle.tsx",
    "../../tests/features/**/*.ladle.tsx",
    "../../tests/ladle/**/*.ladle.tsx",
  ],
  base: "/ladle/",
  viteConfig: "./vite.config.mjs",
};
```

Rationale:

- The config lives in the package that owns Ladle
  (`packages/design-system/.ladle/`). Ladle v5 loads
  `<configFolder>/config.mjs` (see
  `node_modules/@ladle/react/lib/cli/load-config.js`); we pass
  `--config .ladle` from the package root.
- It is the only place Ladle configurations are read from now;
  the legacy `.ladle/config.mjs` is deleted.
- Story globs are **relative** paths from the package root.
  Ladle's `vite-base.js` does `path.join(process.cwd(), story)`
  on each globby result, so absolute paths collapse to wrong
  locations. Relative globs work because Ladle runs with
  `cwd = packages/design-system/`.
- `base: "/ladle/"` is the production path the orchestrator serves
  on and matches what `ladle:build` already passes via
  `--base /ladle/`. Declaring it in the config avoids a CLI flag
  that can drift.
- `viteConfig: "./vite.config.mjs"` points Ladle at a co-located
  Vite config that wires the cross-package aliases Ladle cannot
  derive from the design-system's `tsconfig.json` alone.

Alternatives considered:

- Put the config at `packages/design-system/ladle.config.mjs` and
  point Ladle at a synthetic `--config` folder → rejected: Ladle
  v5 only loads `<configFolder>/config.mjs`; the conventional
  `.ladle/config.mjs` path requires no flag-punting.
- Keep the legacy root `.ladle/config.mjs` and update its glob →
  rejected: the file is read from `cwd`, and the package-local
  scripts cannot rely on `cwd` without re-introducing the footgun.
- Resolve `stories` via a `loadConfig` callback →
  rejected: the static array is simpler and matches Ladle's v5
  documented contract.
- Use absolute paths from a computed `repoRoot` →
  rejected: `path.join(cwd, absolutePath)` in Ladle's
  `vite-base.js` collapses them onto the wrong location.

### Dev script (`ladle-dev.ts`) and build script (`ladle-build.ts`)

`ladle-dev.ts`:

```ts
#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");

const result = spawnSync(
  "bunx",
  ["--bun", "ladle", "dev", "-p", "6006", "--config", ".ladle"],
  { cwd: pkgRoot, stdio: "inherit" },
);
process.exit(result.status ?? 1);
```

`ladle-build.ts`:

```ts
#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");

const result = spawnSync(
  "bunx",
  [
    "--bun", "ladle", "build",
    "-o", "dist/ladle",
    "--base", "/ladle/",
    "--config", ".ladle",
  ],
  { cwd: pkgRoot, stdio: "inherit" },
);
process.exit(result.status ?? 1);
```

Rationale:

- `bunx --bun` (already in use elsewhere per `AGENTS.md` §2) honours
  the package's own `devDependencies` and resolves the binary even
  if the hoisted root is on a different Node version.
- `--config .ladle` is Ladle v5's documented way to point at the
  `.ladle/config.mjs` we ship in the package. Ladle has no
  `LADLE_CONFIG_PATH` env var; the only way to override the config
  folder is the `--config` flag.
- The scripts are kept as two small, parallel files (no shared
  helper) because they only differ by one Ladle subcommand and the
  shared shape would add an indirection without saving lines.

Alternatives considered:

- Direct `node_modules/.bin/ladle` invocation → rejected: the binary
  is not currently hoisted into the package and the path is fragile.
- `LADLE_CONFIG_PATH` env var → rejected: it does not exist in
  Ladle v5 (verified against
  `node_modules/@ladle/react/lib/cli/load-config.js`).
- Use Bun's `Bun.spawn` API → rejected: `spawnSync` is fine here and
  keeps the surface area tiny.

### Cross-package Vite config

[`packages/design-system/vite.config.mjs`](../../../packages/design-system/vite.config.mjs):

```js
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(here, "..");
const appSrc = resolve(packagesDir, "app/src");
const designSystemSrc = resolve(here, "src");
const landingSrc = resolve(packagesDir, "landing/src");
const apiSrc = resolve(packagesDir, "api/src");
const orchestratorSrc = resolve(packagesDir, "orchestrator/src");

export default {
  plugins: [tailwindcss()],
  resolve: {
    alias: [
      { find: /^~\/(.*)$/, replacement: `${appSrc}/$1` },
      { find: /^@unveiled\/app(?:\/(.*))?$/, replacement: `${appSrc}/$1` },
      {
        find: /^@unveiled\/design-system(?:\/(.*))?$/,
        replacement: `${designSystemSrc}/$1`,
      },
      { find: /^@unveiled\/landing(?:\/(.*))?$/, replacement: `${landingSrc}/$1` },
      { find: /^@unveiled\/api(?:\/(.*))?$/, replacement: `${apiSrc}/$1` },
      {
        find: /^@unveiled\/orchestrator(?:\/(.*))?$/,
        replacement: `${orchestratorSrc}/$1`,
      },
    ],
    dedupe: ["react", "react-dom"],
  },
};
```

Rationale:

- The design-system package's own `tsconfig.json` only knows its
  own paths. The replica stories pull in `@unveiled/app/styles/global.css`,
  the gherkin `@ladle` stories pull in
  `@unveiled/landing/components/landing/landing-hero`,
  `@unveiled/app/components/payments/*`, and
  `@unveiled/api/unveiled-view-models`. None of those resolve
  from the design-system tsconfig alone.
- Ladle automatically wires `vite-tsconfig-paths` against the
  package cwd, but that reads the design-system tsconfig which
  has no knowledge of the cross-package imports.
- A co-located Vite config with explicit `resolve.alias` entries
  is the smallest surface that satisfies every cross-package
  story and any future one (proposal 05 promotes page-level
  stories into the app package).
- The aliases mirror the `paths` blocks in `packages/<pkg>/tsconfig.json`
  so the alias map is the union of every workspace tsconfig.
- `resolve.dedupe: ["react", "react-dom"]` forces Vite to resolve
  React from a single copy. Without it, `@ladle/react`'s
  transitively-pinned `react@19.2.7` can co-exist with the
  workspace-pinned `react@19.2.5`, producing two React copies and
  the "Invalid hook call" / `Cannot read properties of null
  (reading 'useContext')` console error reported in the manual
  test feedback for `bun run ladle` (the crash inside `<NextUI.Input>`
  masked the story list).
- `plugins: [tailwindcss()]` mounts the `@tailwindcss/vite` plugin
  so that any story importing `~/styles/global.css` (the app
  shell, the design-system overview, and every HeroUI replica
  that pulls in the design tokens) gets Tailwind utilities
  compiled into the bundle. Without the plugin, the manual-test
  screenshot shows un-styled brand chrome — broken "Unveiled"
  logo, missing yellow background, no `bg-brand-*` / `unveiled-shadow`
  utilities, icons rendering as broken-image glyphs. The plugin
  is added to `packages/design-system/package.json` `devDependencies`
  because Ladle's bare Vite config has no other way to compile
  Tailwind directives.
- `packages/design-system/public/app` is a symlink to
  `packages/app/public`, so Ladle's default `publicDir`
  (`packages/design-system/public/`) exposes the app's
  `logos/unveiled-logo-{black,white}.svg` and `fonts/EKNoticeSans-Black.{woff2,woff,otf}`
  under the production `/app/...` URL prefix that
  `app-shell.tsx` and `global.css` already use. Without the
  symlink, Vite's HTML-fallback middleware would respond with
  the Ladle SPA HTML for any `/app/...` URL (status 200, content
  type `text/html`) and the browser would render broken-image
  glyphs for the logo and miss the brand font.

Alternatives considered:

- Add every cross-package path to the design-system
  `tsconfig.json` → rejected: it would lie about which paths the
  package can actually resolve from its own source, breaking
  `astro check` and confusing future contributors.
- Use `vite-tsconfig-paths` with a `projects: [...]` list →
  rejected: the package does not have `vite-tsconfig-paths` in its
  direct `devDependencies`, so Vite cannot import it from the
  resolved config. Adding it is more invasive than the alias map.
- Inline the aliases via `ladleConfig.viteConfig` as an object
  instead of a file path → Ladle does not support that; the
  field is documented as a string path.
- Skip `resolve.dedupe` and rely on Ladle's own
  `optimizeDeps.include: ["react", "react-dom", …]` →
  rejected: `optimizeDeps.include` only pre-bundles the listed
  packages, it does not force a single resolution when two
  copies are present in the workspace's nested `node_modules`.

`/root/.ladle/config.mjs` is deleted. The root `package.json`
already calls `bun packages/design-system/scripts/ladle-dev.ts`,
so the root config was dead weight that only served the old
pre-monorepo layout.

### Coverage script

[`packages/design-system/scripts/coverage.ts`](../../../packages/design-system/scripts/coverage.ts)
already walks `packages/design-system/src/`, `tests/features/`,
and `tests/ladle/` (see `STORY_GLOBS`, lines 51–55). It does not
need changes for this proposal; we only verify it still passes.

### Regression guards

Two unit tests under `tests/unit/`:

- `tests/unit/ladle-config-exists.test.ts` — asserts
  `packages/design-system/.ladle/config.mjs` exists and exports a
  non-empty `stories` array. Failure modes covered: missing file,
  empty `stories`, missing `base`.
- `tests/unit/no-legacy-ladle-config.test.ts` — asserts the root
  `.ladle/config.mjs` does NOT exist. The legacy config is the
  footgun; the test prevents a future contributor from
  re-introducing it.

## Risks / Trade-offs

- **Binary resolution**: `bunx --bun ladle` will install Ladle on
  first run if it is not hoisted. The
  `packages/design-system/package.json` `devDependencies` is
  currently `{}`. We add `"@ladle/react": "^5.1.1"` (matching the
  root) to make `bunx` deterministic and offline-friendly.
- **Cross-package glob**: `../app/src/**/*.ladle.tsx` will pick up
  any future story in the app package. This is intentional — proposal
  05 promotes page-level stories into the app package — and the
  coverage script already handles it.
- **Replica visibility**: the replica stories stay visible. They
  are the only visual reference we have for the design language
  until proposals 02–06 land, and the
  `heroui-design-system-replica:check` gate continues to enforce
  the `// @ladle-only` policy.

## Migration Plan

This is a fix, not a migration. The single deployment step is:
ship the new `packages/design-system/.ladle/config.mjs`, the new
`packages/design-system/vite.config.mjs`, the updated
`packages/design-system/scripts/ladle-{dev,build}.ts`, the new
`@ladle/react` devDependency, the deleted legacy
`.ladle/config.mjs`, the two new unit tests, and the walk /
overview fixes below in one PR. No data migrations, no DNS
changes, no rollback concerns beyond reverting the PR.

## Unblockers applied during validation

Five pre-existing breaks surfaced once the Ladle harness was
repaired and the validation commands could finally run. All are
required to satisfy the proposal's "the replica must keep working"
and "the brand chrome renders" guarantees, so the proposal
documents them here:

- `packages/design-system/scripts/check-heroui-design-system-replica.ts`
  walks `src/components`, `src/pages`, `src/layouts`,
  `src/actions` at the repo root — paths that change 04 deleted.
  The `walk()` helper now swallows `ENOENT` for missing roots
  so the check no longer crashes before it can run the rest of
  the assertions. Same pattern as `coverage.ts`.
- `packages/design-system/src/heroui-replica/design-system-overview.ladle.tsx`
  renders `<main>` without the `role="main"` attribute the
  `heroui-design-system-replica:check` script requires. Added
  `role="main"` to the existing `<main>` element (semantically
  a no-op for modern browsers; required by the
  `hero<name>ladle design-system-overview` requirement).
- `packages/design-system/src/button.tsx` loading-state spinner
  relies on `border-current`, but the production Tailwind scan
  in `packages/app/src/styles/global.css` did not include the
  design-system's `src/` and the `@source inline` list did not
  list `border-current`, so the class was never generated. The
  app's `global.css` `@source` directives now include
  `../../design-system/src/**/*.{ts,tsx}` and the inline list
  explicitly opts in `border-current`. With the class
  generated, `border-color: currentColor` is restored and the
  spinner renders in the button text colour (white on the
  dark-loading variant). The spinner also got `mr-2` (in
  addition to `shrink-0`) so it sits clearly to the left of the
  text instead of crowding it.
- `packages/design-system/src/heroui-replica/HeroButton.ladle.tsx`
  `Loading` story relied on HeroUI's default button padding,
  which is `px-4 py-2`. With the design-system's larger letter
  spacing (`tracking-[0.18em]`) and the 20×20 HeroUI spinner,
  the first character of the label was visually clipped by the
  spinner's bounding box. The story now declares `px-5 py-3`
  (matching the design-system `Button` default size) so the
  spinner-to-label gap is the same in both code paths.
- The app's `@source inline` list at
  `packages/app/src/styles/global.css:21` already opted in
  `border-b-current` / `border-t-transparent` / etc. for the
  `SpinningButton` primitive; the same list now opts in
  `border-current` for the design-system `Button` primitive.

## Open Questions

None — the proposal, design, and tasks cover the agreed scope.