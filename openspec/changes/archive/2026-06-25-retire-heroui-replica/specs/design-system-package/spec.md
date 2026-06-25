## REMOVED Requirements

### Requirement: `@unveiled/design-system` owns the Ladle-only HeroUI replica

**Reason**: Every HeroUI primitive previously mirrored by `packages/design-system/src/heroui-replica/` now has a production-grade equivalent under `packages/design-system/src/atoms/` and `packages/design-system/src/molecules/`, with its own Ladle story, its own demo page in `packages/design-system/src/pages/`, and its own gate (`check:atomic-layers`). The replica is redundant, a maintenance hazard (HeroUI version bumps require replica updates even when production is unaffected), and a coverage burden on `ladle:coverage`. Its production-import invariant is subsumed by `check:atomic-layers` (no higher layer may import from `./heroui-replica/...`) and `tests/unit/design-system-hero-ui-boundary.test.ts` (no file outside `packages/design-system/**` imports HeroUI directly). The `// @ladle-only` exemption in AGENTS.md §4 was the only remaining policy supporting the folder.

**Migration**: The `packages/design-system/src/heroui-replica/` directory is deleted in its entirety (37 files). The `packages/design-system/scripts/check-heroui-design-system-replica.ts` gate script and the `heroui-design-system-replica:check` package script are removed. The `./heroui-replica` export is removed from `packages/design-system/package.json`. The `tests/unit/no-ladle-replica-in-production.test.ts` unit test is deleted. Ladle users view the production atoms/molecules under the `Atoms`, `Molecules`, `Organisms`, `Layouts`, and `Pages` groups (or the `Atoms / Overview` / `Molecules / Overview` / `Organisms / Overview` groups) instead. No production code is affected: every production entry point that previously consumed a HeroUI primitive already imports the production atom/molecule from `@unveiled/design-system`.

## MODIFIED Requirements

### Requirement: `@unveiled/design-system` is a Bun workspace package

The system MUST ship `@unveiled/design-system` as a Bun workspace member under `packages/design-system/`. The package MUST be `private: true`, declare `"name": "@unveiled/design-system"`, and ship the scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `ladle`, `ladle:build`, `ladle:coverage`, and `check:atomic-layers`. The package MUST NOT ship the `heroui-design-system-replica:check` script (the replica is retired in change `retire-heroui-replica`).

#### Scenario: Package is discoverable as a workspace member

- **WHEN** `bun pm ls` (or the Bun workspace equivalent) is run from the repo root
- **THEN** `@unveiled/design-system` appears in the workspace list with `private: true`
- **AND** its `package.json` `exports` map exposes `.` for runtime primitives, `./styles/generated/tokens.css` for the design-token CSS, and `./styles/atom-chrome.css` for the hand-written atom visual-chrome CSS. The `exports` map MUST NOT expose a `./heroui-replica` sub-path.

#### Scenario: Package scripts exist and resolve

- **WHEN** a contributor runs `bun --filter @unveiled/design-system run <script>` for each of `dev`, `build`, `typecheck`, `lint`, `test:unit`, `ladle`, `ladle:build`, `ladle:coverage`, `check:atomic-layers`
- **THEN** the package's `package.json` defines a script under that name and the filter invocation exits with code zero
- **AND** the package's `package.json` does NOT define a `heroui-design-system-replica:check` script; running `bun --filter @unveiled/design-system run heroui-design-system-replica:check` fails with "script not found".

### Requirement: `@unveiled/design-system` owns the Ladle harness

The package MUST own the Ladle config at `packages/design-system/.ladle/config.mjs` (Ladle v5's canonical config path; Ladle loads `<configFolder>/config.mjs`, the scripts pass `--config .ladle` from the package root). The config MUST be a `.mjs` module that exports an object with at least a non-empty `stories` array and a `base` field. The config MUST resolve every co-located production-primitive story under `packages/design-system/src/**/*.ladle.tsx`, every gherkin `@ladle` story under `tests/features/**/*.ladle.tsx`, and every smoke story under `tests/ladle/**/*.ladle.tsx`. The config MUST NOT resolve a story glob under `packages/design-system/src/heroui-replica/` (the directory is deleted in change `retire-heroui-replica`). The config MUST declare `base: "/ladle/"` so the static build matches the orchestrator's served path, and MUST point `viteConfig` at `packages/design-system/vite.config.mjs` which wires the cross-package `@unveiled/*` and `~` resolve aliases that Ladle cannot derive from the design-system's own `tsconfig.json` (because those aliases point at `packages/<other>/src`), mounts the `@tailwindcss/vite` plugin so Tailwind utilities (`bg-brand-*`, `unveiled-shadow`, etc.) compile for stories that import `~/styles/global.css` or `@unveiled/design-system/styles/generated/tokens.css`, AND declares `resolve.dedupe: ["react", "react-dom"]` so the dev server resolves React from a single copy (otherwise the workspace-pinned `react@19.2.5` co-exists with `@ladle/react`'s transitively-pinned `react@19.2.7` and the resulting "Invalid hook call" / "Cannot read properties of null (reading 'useContext')" error in `<NextUI.Input>` crashes the story tree). The legacy `.ladle/config.mjs` at the repo root MUST NOT exist; the package-local config is the only source of truth. The package MUST also ship a `packages/design-system/public/app` symlink that resolves to `packages/app/public` so Ladle's default `publicDir` exposes the app's `logos/unveiled-logo-{black,white}.svg` and `fonts/EKNoticeSans-Black.{woff2,woff,otf}` under the production URL prefix `app-shell.tsx` and `global.css` already use.

#### Scenario: Package-local Ladle config exists with discoverable stories

- **WHEN** `packages/design-system/.ladle/config.mjs` is read at runtime
- **THEN** it is a `.mjs` module whose default export has a non-empty `stories` array
- **AND** that array contains a glob covering `packages/design-system/src/**/*.ladle.tsx`, a glob covering `tests/features/**/*.ladle.tsx`, and a glob covering `tests/ladle/**/*.ladle.tsx`
- **AND** the array does NOT contain a glob covering `packages/design-system/src/heroui-replica/**` (the directory is deleted)
- **AND** the config exports `base: "/ladle/"` so the static build matches the orchestrator's served path.

#### Scenario: Ladle dev server lists every resolved story

- **WHEN** `bun --filter @unveiled/design-system run ladle` boots
- **THEN** the served `index.html` and `/stories.json` enumerate the production atoms/molecules/organisms/layouts/pages under `packages/design-system/src/`, the gherkin `@ladle` components under `tests/features/**`, and the smoke stories under `tests/ladle/**`
- **AND** the served stories do NOT enumerate any story under `packages/design-system/src/heroui-replica/` (the directory is deleted).

### Requirement: Atoms are the only layer that may import HeroUI directly

The package MUST organize its production primitives under `packages/design-system/src/atoms/` (one folder per atom) and MUST organize higher-level compositions under `packages/design-system/src/{molecules,organisms,layouts,pages}/`. The `atoms/` layer is the only layer that MAY import from `@nextui-org/react` or `@heroui/*`; every higher layer MUST consume atoms (or other higher layers), never HeroUI directly. The rule is enforced by the `check-atomic-layers` gate script that runs in `bun run check` (root + per-package).

The atoms/ layer MAY import only from:
- `./lib/*` (shared design-system utilities such as `cn` and `StatusColor`),
- `react`, `react-dom`, and other framework primitives,
- `@nextui-org/react` and `@heroui/*` (the HeroUI base),
- `./styles/generated/tokens.css` (the design-token CSS — never the `@nextui-org/theme` runtime),
- nothing else in the design-system package, and nothing from any other third-party UI library.

The `check-atomic-layers` gate's allow-list MUST NOT mention `./heroui-replica/...` as a forbidden cross-layer path (the directory is deleted in change `retire-heroui-replica`); the gate's cross-layer rule continues to reject any import from `./heroui-replica/...` if the directory is re-introduced, because the path is not on any allow-list.

#### Scenario: Atoms import only from allowed sources

- **WHEN** `bun run check:atomic-layers` runs across `packages/design-system/src/atoms/**/*.tsx`
- **THEN** every file's import list matches the allow-list above
- **AND** any atom importing from `./molecules/...`, `./organisms/...`, `./layouts/...`, `./pages/...`, or any third-party UI library (e.g. `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`) causes the gate to fail with the offending file path.

### Requirement: Molecules compose atoms, not HeroUI directly

The iteration-13 prompt is strict: "all components are based on HeroUI". The design system implements that rule as a layer contract — atoms are HeroUI compositions (each `<atom>.tsx` imports from `@nextui-org/react` or is a HeroUI pass-through re-export), and molecules are compositions of atoms. **Molecules MUST NOT import from `@nextui-org/react`, `@heroui/*`, or any other `@nextui-org/*` package directly.** If a molecule needs a HeroUI primitive that no atom exposes, the molecule MUST grow a new atom first; the rule is deliberate and is not relaxed in any proposal.

The molecules layer is organised under `packages/design-system/src/molecules/<molecule>/` with one folder per molecule. Each molecule folder MUST ship a `<molecule>.tsx`, a `<molecule>.types.ts` (when prop types are non-trivial), and a `<molecule>.ladle.tsx` with a default story and at least one variant story. Molecules with non-trivial logic MAY additionally ship a `<molecule>.test.tsx`.

The `check-atomic-layers` gate's allow-list MUST NOT mention `./heroui-replica/...` as a forbidden cross-layer path (the directory is deleted in change `retire-heroui-replica`); the gate's cross-layer rule continues to reject any import from `./heroui-replica/...` if the directory is re-introduced, because the path is not on any allow-list.

#### Scenario: Molecules import only from atoms and lib

- **WHEN** `bun run check:atomic-layers` runs across `packages/design-system/src/molecules/**/*.tsx`
- **THEN** every file's import list matches the allow-list: `./atoms/...`, `./lib/...`, `react`, `react-dom`, framework primitives, and `./styles/generated/tokens.css`
- **AND** any molecule importing from a sibling molecule, `./organisms/...`, `./layouts/...`, or `./pages/...` causes the gate to fail with the offending file path.

### Requirement: App package consumes the design system, not its internals

Every file under `packages/app/src/**` (Astro pages, Astro layouts, React islands, server-side data hooks, action handlers, view-model mappers) MUST import UI surfaces — atoms, molecules, organisms, layouts, semantic CSS classes, and the `cn` helper — exclusively from `@unveiled/design-system` (the public barrel). The app MUST NOT import from `@unveiled/design-system/lib/*` (the internal path), `@unveiled/design-system/<layer>/<file>` (the per-folder deep imports that skip the barrel), `@nextui-org/react`, `@heroui/*`, `lucide-react`, `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`, `@chakra-ui/*`, or any other third-party UI library. App-internal paths (`@/lib/auth-client`, `@/lib/stripe`, `@/lib/data-access/*`, `@/lib/unveiled-view-models`, `@/lib/app-shell-view-models`) are still allowed because they are not UI surfaces.

The rule is enforced by `bun run check:styling-ownership` (existing) plus a new permanent unit test under `tests/unit/` that greps every `.tsx` / `.astro` / `.ts` file in `packages/app/src/**` and fails if it imports from any forbidden path or module.

#### Scenario: No deep imports into the design system

- **WHEN** `tests/unit/app-design-system-import-boundary.test.ts` greps `packages/app/src/**/*.{ts,tsx,astro}` for `from "@unveiled/design-system/`
- **THEN** every match is followed by an allowed continuation (only the public barrel `@unveiled/design-system";` or `@unveiled/design-system/styles/global.css";` — both of which are reachable through the package's `exports` map)
- **AND** no match points at `@unveiled/design-system/lib/*`, `@unveiled/design-system/atoms/*`, `@unveiled/design-system/molecules/*`, `@unveiled/design-system/organisms/*`, `@unveiled/design-system/layouts/*`, or `@unveiled/design-system/pages/*`.

### Requirement: Landing package consumes the design system, not its internals

The landing package SHALL consume UI surfaces — atoms, molecules, organisms, layouts, semantic CSS classes, and the `cn` helper — exclusively from `@unveiled/design-system` (the public barrel). Every file under `packages/landing/src/**` (Astro pages, Astro layouts, and any future React island) MUST import those surfaces from `@unveiled/design-system` and MUST NOT import from `@unveiled/design-system/lib/*` (the internal path), `@unveiled/design-system/<layer>/<file>` (the per-folder deep imports that skip the barrel), `@nextui-org/react`, `@heroui/*`, `lucide-react`, `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`, `@chakra-ui/*`, or any other third-party UI library.

The rule is enforced by:

1. The existing `bun run check:styling-ownership` script (the raw-Tailwind-utility and reverse-import gate).
2. A new `R-LANDING-NO-LOCAL-UI` rule added to `packages/design-system/scripts/check-styling-ownership.ts`: the rule walks every `.tsx`, `.ts`, and `.astro` file in `packages/landing/src/**` and fails if any file imports from a relative path that resolves under `packages/landing/src/components/landing/`. The rule is a forward-looking regression guard; the path no longer exists after the change lands, so the rule has no hits in the current source tree.
3. A new permanent unit test under `tests/unit/landing-design-system-import-boundary.test.ts` that greps every `.tsx`, `.astro`, and `.ts` file in `packages/landing/src/**` for `from "@unveiled/design-system/` followed by a forbidden continuation, for `from "@nextui-org/"`, `from "@heroui/"`, `from "lucide-react"`, `from "@radix-ui/"`, `from "@headlessui/"`, `from "react-aria"`, `from "@mui/"`, `from "@chakra-ui/"`, and for any import whose path resolves under `packages/landing/src/components/landing/`.

#### Scenario: Landing imports flow through the public design-system barrel

- **WHEN** `tests/unit/landing-design-system-import-boundary.test.ts` greps `packages/landing/src/**/*.{ts,tsx,astro}` for `from "@unveiled/design-system/`
- **THEN** every match is followed by an allowed continuation (only the public barrel `@unveiled/design-system";` or `@unveiled/design-system/styles/global.css";` — both of which are reachable through the package's `exports` map)
- **AND** no match points at `@unveiled/design-system/lib/*`, `@unveiled/design-system/atoms/*`, `@unveiled/design-system/molecules/*`, `@unveiled/design-system/organisms/*`, `@unveiled/design-system/layouts/*`, or `@unveiled/design-system/pages/*`.

### Requirement: HeroUI is a private implementation detail of the design system

The design system MUST be the only package in the repo that imports from `@nextui-org/react` or `@nextui-org/*`. The boundary is enforced by a permanent unit test under `tests/unit/` that walks every `.ts` / `.tsx` / `.astro` file in the repo and fails if any file outside `packages/design-system/**` imports `@nextui-org/react`, `@nextui-org/*`, or `@heroui/*`. The unit test runs as part of `bun run test:unit` and is wired into `bun run check`.

The `packages/design-system/src/heroui-replica/provider.tsx` re-export shim (added in change `2026-06-25-heroui-provider-becomes-design-system`) is no longer needed once the replica is deleted in change `retire-heroui-replica`; the file is removed as part of that change, and the `UnveiledThemeProvider` is the sole owner of the theme context. The `// @ladle-only` exemption in AGENTS.md §4 was the only remaining policy supporting the replica folder and is removed at the same time.

#### Scenario: No HeroUI import escapes the design system

- **WHEN** `bun run test:unit` is invoked
- **THEN** the new test (e.g. `tests/unit/design-system-hero-ui-boundary.test.ts`) passes
- **AND** it asserts that no `.ts` / `.tsx` / `.astro` file outside `packages/design-system/**` matches `from "@nextui-org/react"`, `from "@nextui-org/...`, or `from "@heroui/..."`.

### Requirement: All UI lives in `packages/design-system` and downstream packages consume the design system

The system SHALL treat `packages/design-system/src/` as the single source of UI. The `app/` package and the `landing/` package SHALL consume the design system via its public barrel (`@unveiled/design-system`) and SHALL NOT import from `@unveiled/design-system/lib/*`, from `@nextui-org/*`, from `@heroui/*`, or from `lucide-react`. The design system's private dependencies (HeroUI, the design-token CSS, the semantic-class CSS, the Tailwind v4 theme) SHALL NOT leak into downstream packages' import graphs. The boundary is enforced by the `check:atomic-layers` and `check:styling-ownership` gate scripts wired into `bun run check`.

The `packages/design-system/src/` directory tree SHALL contain the layered design-system folders (atoms, molecules, organisms, layouts, pages, providers, lib, styles). The `heroui-replica/` folder is NOT part of the directory tree (it was deleted in change `retire-heroui-replica`); the production atoms/molecules/pages are the visual source of truth.

#### Scenario: AGENTS.md documents the boundary as a hard rule

- **WHEN** a new contributor reads `AGENTS.md` end to end
- **THEN** §2 (tech stack) calls out atomic-design layering, HeroUI as a private dependency of the design system, and the gate scripts that enforce the boundary
- **AND** §3 (file layout) shows the layered design-system directory tree (atoms, molecules, organisms, layouts, pages, providers, lib, styles) — the tree MUST NOT include a `heroui-replica/` entry (the directory is deleted)
- **AND** §4 (conventions) forbids raw Tailwind utility classes in `app/` and `landing/` outside the design-system semantic classes — the `// @ladle-only` exemption for `src/components/ui/heroui-replica/` MUST NOT appear (the folder is deleted)
- **AND** §7 (toolchain commands) lists `bun run check:atomic-layers` and `bun run check:styling-ownership` as gate scripts — the entries for `bun run heroui-design-system-replica:check` and `bun run check:heroui-replica` MUST NOT appear (the gate is retired), and the `tests/unit/no-ladle-replica-in-production.test.ts` reference MUST NOT appear (the test is deleted)
- **AND** §8 (definition of done) requires a Ladle page for every UI change in `app/` or `landing/`
- **AND** §9 (what NOT to do) treats the design-system boundary as a hard rule.

