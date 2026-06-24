# Capability: design-system-package

## Purpose

Define `@unveiled/design-system` as a Bun workspace package that owns the
production UI primitives, the Ladle-only HeroUI replica, the Ladle
harness, and the generated design-token CSS. The package is the single
source of truth for everything a downstream Astro app or landing page
imports under the `@unveiled/design-system` alias.
## Requirements
### Requirement: `@unveiled/design-system` is a Bun workspace package

The system MUST ship `@unveiled/design-system` as a Bun workspace member under `packages/design-system/`. The package MUST be `private: true`, declare `"name": "@unveiled/design-system"`, and ship the scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `ladle`, `ladle:build`, `ladle:coverage`, `check:atomic-layers`, and `heroui-design-system-replica:check`.

#### Scenario: Package is discoverable as a workspace member

- **WHEN** `bun pm ls` (or the Bun workspace equivalent) is run from the repo root
- **THEN** `@unveiled/design-system` appears in the workspace list with `private: true`
- **AND** its `package.json` `exports` map exposes `.` for runtime primitives, `./heroui-replica` for the Ladle-only replica, `./styles/generated/tokens.css` for the design-token CSS, and `./styles/atom-chrome.css` for the hand-written atom visual-chrome CSS.

#### Scenario: Package scripts exist and resolve

- **WHEN** a contributor runs `bun --filter @unveiled/design-system run <script>` for each of `dev`, `build`, `typecheck`, `lint`, `test:unit`, `ladle`, `ladle:build`, `ladle:coverage`, `check:atomic-layers`, `heroui-design-system-replica:check`
- **THEN** the package's `package.json` defines a script under that name and the filter invocation exits with code zero.

### Requirement: `@unveiled/design-system` exposes the production UI primitives

The package's main entry (`packages/design-system/src/index.ts`) MUST re-export every production primitive that previously lived under `src/components/ui/` (`Button`, `Card`, `StatPanel`, `Divider`, `StatePanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`, `Notification`, `Skeleton`, `UnveiledPrimitives`), preserving their public prop surface and HeroUI-backed implementation.

The TextInput primitive MUST render the design-system 4px solid `unveiled-brand-dark` border defined by `design-tokens.json:258-272`. It MUST use HeroUI `variant="flat"` and the `inputWrapper` className MUST apply the `unveiled-text-input-wrapper` class (defined in `packages/design-system/src/styles/atom-chrome.css`). The chrome CSS MUST set `border: 4px solid #202621 !important`, `border-style: solid !important`, and `border-color: #202621 !important` on that class (all three of border width, border style, and border color are required for the border to render).

The package MUST NOT re-export the following primitives in this version: `Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`, and the `Button.asChild` API. They are removed under iteration-13 proposal 02 (atoms layer); their replacements are documented in the "Removed components and their HeroUI / plain-element replacements" requirement below. During the migration window, the removed names are re-exported from `packages/design-system/src/_legacy.tsx` so consumers keep compiling; proposals 07 (app) and 08 (landing) delete the shim and replace every call site.

In addition to the flat re-export of every atom and the `Atoms` namespace export introduced in proposal 02, the package barrel MUST also re-export every molecule (`Field`, `StatePanel`, `StatPanel`, `SelectInput`, `Toast`, `Drawer`, `Modal`, `Menu`/`MenuTrigger`/`MenuContent`/`MenuItem`/`MenuSection`) as both a flat re-export (temporary, removed in proposal 07/08) AND a `Molecules` namespace export (`export { Molecules } from "./molecules"`).

#### Scenario: All production primitives are re-exported

- **WHEN** a downstream package (e.g. `@unveiled/app`, `@unveiled/landing`) imports a production primitive from `@unveiled/design-system`
- **THEN** the import resolves to a module under `packages/design-system/src/` that composes the same HeroUI component the previous `src/components/ui/<primitive>.tsx` file composed
- **AND** the public prop surface (`variant`, `size`, `tone`, `shadow`, `interactive`, `state`, `loading`, `open`, `onClose`, `title`, `label`, `hint`, `error`, `value`, `onChange`, `disabled`, …) is preserved exactly for the surviving primitives.

#### Scenario: No legacy alias remains for the old location

- **WHEN** the repo is searched for a non-test, non-doc file that imports a primitive from `@/components/ui/`
- **THEN** zero hits are returned (the legacy `@/components/ui/...` alias is removed by change 04; until then, no production file may import a primitive that has been moved into the package).

#### Scenario: TextInput renders the design-system border

- **WHEN** `packages/design-system/src/atoms/text-input/text-input.tsx` is inspected at the `TextInput` definition
- **THEN** HeroUI `Input` is rendered with `variant="flat"`
- **AND** the `inputWrapper` className contains `unveiled-text-input-wrapper` (the chrome class defined in `packages/design-system/src/styles/atom-chrome.css`)
- **AND** the rules in `atom-chrome.css` set `border: 4px solid #202621 !important; border-style: solid !important; border-color: #202621 !important` on the `unveiled-text-input-wrapper` class
- **AND** the rendered DOM in any consumer (e.g. `packages/app/src/components/unveiled/auth/LoginForm.tsx`) shows a visible 4px solid `unveiled-brand-dark` border around the input.

#### Scenario: SelectInput and TextArea retain HeroUI bordered variant

- **WHEN** `packages/design-system/src/molecules/select-input/select-input.tsx` is inspected at the `SelectInput` definition (and analogously `packages/design-system/src/atoms/text-area/text-area.tsx` for `TextArea`)
- **THEN** both continue to use HeroUI `variant="bordered"` and do NOT carry the `unveiled-text-input-wrapper` chrome (HeroUI renders their borders natively via its own `bordered` variant).

#### Scenario: Molecules are re-exported from the barrel

- **WHEN** a downstream package imports a molecule (`Field`, `StatePanel`, `StatPanel`, `SelectInput`, `Toast`, `Drawer`, `Modal`, `Menu`/`MenuTrigger`/`MenuContent`/`MenuItem`/`MenuSection`) from `@unveiled/design-system`
- **THEN** the import resolves to a module under `packages/design-system/src/molecules/<molecule>/` that composes the corresponding atom(s) and HeroUI primitives via the same composition the previous top-level file used
- **AND** the public prop surface (`label`, `hint`, `error`, `open`, `onClose`, `title`, `variant`, …) is preserved exactly for the surviving molecules.

#### Scenario: Molecules namespace is reachable

- **WHEN** a downstream package writes `import { Molecules } from "@unveiled/design-system"; Molecules.Field`
- **THEN** the namespace resolves via the design-system's `Molecules` namespace export, parallel to the existing `Atoms` namespace export.

#### Scenario: Removed primitives are not re-exported from atoms

- **WHEN** a downstream package imports `Badge`, `Panel`, `TableShell`, `TableRow`, or `SafeImage` from `@unveiled/design-system` once proposals 07 and 08 have landed
- **THEN** the build fails with "no exported member" because none of those names are re-exported from the package barrel.
- **WHEN** a downstream package imports `Button` with an `asChild` prop
- **THEN** TypeScript fails with "unknown prop 'asChild'" because the prop is removed from the `Button` atom.

### Requirement: `@unveiled/design-system` owns the Ladle-only HeroUI replica

The package MUST ship `packages/design-system/src/heroui-replica/` as the Ladle-only HeroUI replica, re-exported via `packages/design-system/src/heroui-replica/index.ts`. The replica's import-isolation contract MUST remain identical to the previous `src/components/ui/heroui-replica/` contract: every file carries the `// @ladle-only` header, no production code outside the package imports it, and the `heroui-design-system-replica:check` script (now runnable as `bun --filter @unveiled/design-system run heroui-design-system-replica:check`) still enforces the gate.

#### Scenario: Replica is reachable only through the Ladle-only export

- **WHEN** a file outside `packages/design-system/src/heroui-replica/` imports from `@unveiled/design-system/heroui-replica`
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` fails and names the offending file and import line.

#### Scenario: Replica isolation guard passes in CI

- **WHEN** CI runs `bun run check`
- **THEN** the unit test `packages/design-system/src/heroui-replica/isolation.test.ts` (relocated from `src/components/ui/heroui-replica/replica-not-imported.test.ts`) passes, asserting the import graph of every production entry point in `packages/app/src/**`, `packages/landing/src/**`, and the package's own runtime export never reaches a module under `packages/design-system/src/heroui-replica/`.

### Requirement: `@unveiled/design-system` owns the Ladle harness

The package MUST own the Ladle config at `packages/design-system/.ladle/config.mjs` (Ladle v5's canonical config path; Ladle loads `<configFolder>/config.mjs`, the scripts pass `--config .ladle` from the package root). The config MUST be a `.mjs` module that exports an object with at least a non-empty `stories` array and a `base` field. The config MUST resolve every replica story under `packages/design-system/src/heroui-replica/*.ladle.tsx`, every co-located production-primitive story under `packages/design-system/src/**/*.ladle.tsx`, every gherkin `@ladle` story under `tests/features/**/*.ladle.tsx`, and every smoke story under `tests/ladle/**/*.ladle.tsx`. The config MUST declare `base: "/ladle/"` so the static build matches the orchestrator's served path, and MUST point `viteConfig` at `packages/design-system/vite.config.mjs` which wires the cross-package `@unveiled/*` and `~` resolve aliases that Ladle cannot derive from the design-system's own `tsconfig.json` (because those aliases point at `packages/<other>/src`), mounts the `@tailwindcss/vite` plugin so Tailwind utilities (`bg-brand-*`, `unveiled-shadow`, etc.) compile for stories that import `~/styles/global.css` or `@unveiled/design-system/styles/generated/tokens.css`, AND declares `resolve.dedupe: ["react", "react-dom"]` so the dev server resolves React from a single copy (otherwise the workspace-pinned `react@19.2.5` co-exists with `@ladle/react`'s transitively-pinned `react@19.2.7` and the resulting "Invalid hook call" / "Cannot read properties of null (reading 'useContext')" error in `<NextUI.Input>` crashes the story tree). The legacy `.ladle/config.mjs` at the repo root MUST NOT exist; the package-local config is the only source of truth. The package MUST also ship a `packages/design-system/public/app` symlink that resolves to `packages/app/public` so Ladle's default `publicDir` exposes the app's `logos/unveiled-logo-{black,white}.svg` and `fonts/EKNoticeSans-Black.{woff2,woff,otf}` under the production `/app/...` URL prefix that `app-shell.tsx` and `global.css` already hard-code; without that symlink Vite's HTML-fallback middleware returns the Ladle SPA HTML (status 200, `text/html`) for every `/app/...` URL and the browser renders broken-image glyphs. Running `bun --filter @unveiled/design-system run ladle` MUST serve the harness on port 6006 and list every story resolved by the config, and `bun --filter @unveiled/design-system run ladle:build` MUST write the static build to `packages/design-system/dist/ladle/` whose `index.html` references all of those stories.

#### Scenario: Package-local Ladle config exists with discoverable stories

- **WHEN** `packages/design-system/.ladle/config.mjs` is read at runtime
- **THEN** it is a `.mjs` module whose default export has a non-empty `stories` array
- **AND** that array contains a glob covering `packages/design-system/src/**/*.ladle.tsx`, a glob covering `tests/features/**/*.ladle.tsx`, and a glob covering `tests/ladle/**/*.ladle.tsx`
- **AND** the config exports `base: "/ladle/"` so the static build matches the orchestrator's served path.

#### Scenario: Legacy root Ladle config is removed

- **WHEN** the repo is searched for `.ladle/config.mjs` at the root
- **THEN** no such file exists
- **AND** the regression test `tests/unit/no-legacy-ladle-config.test.ts` passes
- **AND** no file under `packages/` or `tests/` references `.ladle/config.mjs` by path.

#### Scenario: Ladle dev server lists every resolved story

- **WHEN** `bun --filter @unveiled/design-system run ladle` boots
- **THEN** the served `index.html` and `/stories.json` enumerate the 18 replica stories under `packages/design-system/src/heroui-replica/`, the gherkin `@ladle` components under `tests/features/**`, and the smoke stories under `tests/ladle/**`.

#### Scenario: Ladle dev server ships exactly one React copy

- **WHEN** `packages/design-system/vite.config.mjs` is read at Ladle config-load time
- **THEN** its `resolve` block declares `dedupe: ["react", "react-dom"]`
- **AND** the resolved Vite bundle includes `react` (and `react-dom`) from a single workspace location, so opening any HeroUI story in the browser does NOT emit "Invalid hook call" / "Cannot read properties of null (reading 'useContext')" and the sidebar story list is NOT empty.

#### Scenario: Ladle dev server compiles Tailwind utilities for stories

- **WHEN** `packages/design-system/vite.config.mjs` is read at Ladle config-load time
- **THEN** its `plugins` array mounts `@tailwindcss/vite`
- **AND** `packages/design-system/package.json` `devDependencies` declares `"@tailwindcss/vite": "^4.2.4"` so the plugin resolves from the package's own devDeps
- **AND** the rebuilt `packages/design-system/dist/ladle/assets/*.css` includes Tailwind utilities (e.g. `bg-brand-yellow`, `bg-brand-grey`, `unveiled-shadow`) and the `--unveiled-color-brand-*` CSS variables, so stories that import `~/styles/global.css` or `@unveiled/design-system/styles/generated/tokens.css` render with brand chrome instead of plain text.

#### Scenario: Ladle dev server serves the app's public assets under `/app/...`

- **WHEN** `bun ladle` boots and a story requests `/app/logos/unveiled-logo-black.svg` (or any file under `packages/app/public/`)
- **THEN** Vite returns the actual SVG bytes (not the Ladle SPA HTML)
- **AND** the file is reachable because `packages/design-system/public/app` is a symlink whose target is `packages/app/public`, so Ladle's default `publicDir` (`packages/design-system/public/`) exposes the app's logos and fonts under the production URL prefix `app-shell.tsx` and `global.css` already use
- **AND** the rebuilt `packages/design-system/dist/ladle/app/logos/` and `packages/design-system/dist/ladle/app/fonts/` directories contain the originals so the static build serves them the same way.

#### Scenario: Loading-state spinner renders with the right colour and margin

- **WHEN** the design-system `Button` is rendered with `loading`
- **THEN** the rebuilt `packages/design-system/dist/ladle/assets/*.css` includes both `.border-current{border-color:currentColor}` AND `.border-t-transparent{border-top-color:#0000}` so the rotating border is visible against the button background (because Tailwind v4's `@source` directives now scan `packages/design-system/src/**/*.{ts,tsx}` and the inline source list opts in `border-current`)
- **AND** the spinner span sits clearly to the left of the label (`mr-2` on the span and on HeroUI's `classNames.spinner` slot) so the rotating icon does not crowd or visually cross the text.

#### Scenario: HeroUI replica Loading story has explicit padding so the spinner never clips the label

- **WHEN** `HeroButton.ladle.tsx` `Loading` story is rendered
- **THEN** the `<Button>` element declares `px-5 py-3` (matching the design-system `Button` default size) so the spinner and the label have the same horizontal gap as in the production `Button` story
- **AND** the spinner (HeroUI's default 20×20 dual-`<i>` `<Spinner>`) does not visually overlap or clip the first character of the "Loading" label.

#### Scenario: Ladle static build produces a deployable bundle

- **WHEN** `bun --filter @unveiled/design-system run ladle:build` completes
- **THEN** `packages/design-system/dist/ladle/index.html` exists
- **AND** every story id registered in the dev server is referenced from the static `index.html` (or its referenced chunks)
- **AND** the directory is excluded from Biome formatting in the package's `biome.json`.

#### Scenario: Regression guards fail loudly when the config drifts

- **WHEN** `bun run test:unit` runs
- **THEN** `tests/unit/ladle-config-exists.test.ts` fails if `packages/design-system/.ladle/config.mjs` is missing, exports an empty `stories` array, or omits `base: "/ladle/"`
- **AND** `tests/unit/no-legacy-ladle-config.test.ts` fails if `.ladle/config.mjs` is re-introduced at the repo root.

### Requirement: `@unveiled/design-system` owns design-token CSS

The package MUST ship the generated design-token CSS at `packages/design-system/src/styles/generated/tokens.css` (relocated from `src/styles/generated/tokens.css`) and MUST export it under `./styles/generated/tokens.css` in its `exports` map. `bun run tokens:gen` MUST write into the package, and `bun run tokens:check` MUST continue to fail on drift.

#### Scenario: Tokens are generated into the package

- **WHEN** `bun run tokens:gen` runs
- **THEN** `packages/design-system/src/styles/generated/tokens.css` is written with the same `--unveiled-*` CSS custom properties that previously lived in `src/styles/generated/tokens.css`.

#### Scenario: Tokens check still detects drift

- **WHEN** `bun run tokens:check` runs after `design-tokens.json` is edited without regenerating
- **THEN** it fails and names the drifted file (`packages/design-system/src/styles/generated/tokens.css`).

#### Scenario: Downstream apps consume tokens through the package

- **WHEN** `packages/app/src/styles/global.css` (or `packages/landing/src/styles/global.css` in change 05) imports `@unveiled/design-system/styles/generated/tokens.css`
- **THEN** the Tailwind v4 `@theme inline` block resolves the same `--unveiled-*` variables the Astro app's `global.css` previously resolved.

### Requirement: Atoms are the only layer that may import HeroUI directly

The package MUST organize its production primitives under `packages/design-system/src/atoms/` (one folder per atom) and MUST organize higher-level compositions under `packages/design-system/src/{molecules,organisms,layouts,pages}/`. The `atoms/` layer is the only layer that MAY import from `@nextui-org/react` or `@heroui/*`; every higher layer MUST consume atoms (or other higher layers), never HeroUI directly. The rule is enforced by the `check-atomic-layers` gate script that runs in `bun run check` (root + per-package).

The atoms/ layer MAY import only from:
- `./lib/*` (shared design-system utilities such as `cn` and `StatusColor`),
- `react`, `react-dom`, and other framework primitives,
- `@nextui-org/react` and `@heroui/*` (the HeroUI base),
- `./styles/generated/tokens.css` (the design-token CSS — never the `@nextui-org/theme` runtime),
- nothing else in the design-system package, and nothing from any other third-party UI library.

#### Scenario: Atoms import only from allowed sources

- **WHEN** `bun run check:atomic-layers` runs across `packages/design-system/src/atoms/**/*.tsx`
- **THEN** every file's import list matches the allow-list above.
- **AND** any atom importing from `./molecules/...`, `./organisms/...`, `./layouts/...`, `./pages/...`, `./heroui-replica/...`, or any third-party UI library (e.g. `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`) causes the gate to fail with the offending file path.

#### Scenario: Higher layers do not import HeroUI directly

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/{molecules,organisms,layouts,pages}/**/*.tsx`
- **THEN** no file contains `from "@nextui-org/react"` or `from "@heroui/..."`.
- **AND** no file imports from a sibling atom's internals (the atom's barrel re-export is the only allowed entry point).

### Requirement: Atoms are restyled HeroUI components (no documented extreme cases)

The iteration-13 prompt is strict: every atom MUST be a HeroUI primitive (or a HeroUI pass-through re-export). "Extreme cases" do NOT cover plain-React components (a `<span>` with brand chrome, a plain `<div>` with brand chrome) and do NOT cover third-party UI dependencies (Radix, Headless UI, React Aria, MUI, etc.). If HeroUI has no equivalent for a primitive the package wants, the primitive is REMOVED from the design system and consumers use a HeroUI primitive or a plain element at the call site.

Every file under `packages/design-system/src/atoms/<atom>/<atom>.tsx` MUST satisfy both:
- contains at least one `import .* from "@nextui-org/react"` (or a HeroUI pass-through re-export), and
- has no non-HeroUI third-party UI dependency in its imports.

The 6 components that violated this rule in the legacy `src/` (Button.asChild, Badge, Panel, TableShell, TableRow, SafeImage) are REMOVED in this change. Proposals 07 (app) and 08 (landing) own the migration of every consumer.

#### Scenario: Every atom has a HeroUI base

- **WHEN** the gate walks `packages/design-system/src/atoms/<atom>/<atom>.tsx`
- **THEN** each file imports at least one binding from `@nextui-org/react` (or is a HeroUI pass-through re-export file).

#### Scenario: Non-HeroUI UI dependencies are forbidden

- **WHEN** the gate walks `packages/design-system/src/atoms/**/*.tsx`
- **THEN** no file imports from `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`, `@chakra-ui/*`, `react-aria-components`, or any other third-party UI library.
- **AND** `packages/design-system/package.json` does not list any of those packages in `dependencies` or `devDependencies`.

#### Scenario: No documented "extreme case" allows a plain-React atom

- **WHEN** a contributor proposes adding a new atom to `packages/design-system/src/atoms/`
- **THEN** the gate rejects any `<atom>.tsx` that does not import from `@nextui-org/react` (or is a HeroUI pass-through re-export), regardless of whether the contributor documents an "extreme case". The prompt is read strictly.

### Requirement: Removed components and their HeroUI / plain-element replacements

The iteration-13 atoms-layer change removes six components from the design system. Each removal has a documented HeroUI or plain-element replacement; consumers (app and landing) own the migration of every call site in proposals 07 and 08. The package barrel and atoms layer MUST NOT re-export the removed components after proposals 07 and 08 land, and the design-system MUST NOT ship `Button.asChild` or the `@radix-ui/react-slot` dependency after this change lands.

| Removed component | Replacement |
| --- | --- |
| `Button.asChild` | None. HeroUI 2.x has no `asChild` API. Consumers that need a `<Button>` rendered as an `<a>` use a styled `<a>` or `HeroUIButton` directly. |
| `Badge` | `HeroUIBadge` or `HeroUIChip` from `@nextui-org/react`, used directly at the call site. The custom `tone` variants (`dark`, `yellow`, `white`, `grey`, `success`, `error`) are dropped. |
| `Panel` | The design-system `Card` atom (which wraps `HeroUICard`), or a plain `<section>` styled at the call site. The custom `tone` variants (`white`, `yellow`, `cream`, `dark`, `grey`) and the `shadow` prop are dropped. The `StatePanel` molecule (which composes `Panel` + text) becomes a 4-line molecule that composes `Card` + text. |
| `TableShell` | `HeroUITable` directly from `@nextui-org/react`, or a plain `<div>` styled at the call site. |
| `TableRow` | `HeroUITableRow` inside `HeroUITable`, or a plain `<div>` styled at the call site. |
| `SafeImage` | Plain `<img>` with an `onError` handler that sets a `src` fallback. The `fadeIn` opacity transition and the `event` / `partner` / `avatar` placeholder URLs are dropped. |

#### Scenario: Removed components do not appear in the barrel after migration

- **WHEN** the package barrel (`packages/design-system/src/index.ts`) is read after proposals 07 and 08 have landed
- **THEN** the names `Badge`, `Panel`, `TableShell`, `TableRow`, and `SafeImage` are NOT exported, and `Button` is exported without an `asChild` prop.
- **AND** `packages/design-system/src/_legacy.tsx` is deleted.
- **AND** no atom file under `packages/design-system/src/atoms/` defines those components.

#### Scenario: App and landing consumers switch to the documented replacements

- **WHEN** the app and landing packages import the removed components from `@unveiled/design-system`
- **THEN** proposals 07 and 08 replace every consumer with the documented HeroUI primitive or plain element before this change is archived.

### Requirement: Every atom must be demoable in Ladle

The atoms layer is the contract for the smallest indivisible UI primitives. Every atom folder under `packages/design-system/src/atoms/<atom>/` MUST ship a co-located Ladle story at `<atom>.ladle.tsx` so that `bun ladle` lists the atom under the `Atoms` group. Atoms with non-trivial behaviour MAY additionally ship a co-located `*.test.tsx` unit test.

The following utility and overview folders under `packages/design-system/src/atoms/` are explicitly exempt from the companion-file rule and MUST NOT be treated as atoms by the gate:
- `backdrop/` — a shared `AtomStoryBackdrop` React component used by every atom story to wrap renders in a `NextUIProvider` and import the `atom-chrome.css` rules. It is not an atom and does not need a `<backdrop>.ladle.tsx` or `<backdrop>.test.tsx` companion.
- `__overview__/` — the `Atoms / Overview` Ladle story that mounts one instance of every atom. Its `overview.ladle.tsx` IS the companion file for the folder.

Atom `.ladle.tsx` files that re-render an existing atom (rather than introducing a new HeroUI import) MUST carry the `// @atoms-re-export` marker on their first non-blank line. The `check:atomic-layers` gate accepts the marker as a substitute for the `import .* from "@nextui-org/react"` rule because the story re-exports the same HeroUI-backed atom it imports, so no new HeroUI surface is introduced.

#### Scenario: Each atom has a Ladle story

- **WHEN** `bun ladle` boots and Ladle walks the design-system stories
- **THEN** every `packages/design-system/src/atoms/<atom>/<atom>.ladle.tsx` is discoverable, and the story group for the atom lists at least one default story and at least one variant story that exercises a `tone`, `variant`, or `size` prop.
- **AND** the `Atoms / Overview` group renders `packages/design-system/src/atoms/__overview__/overview.ladle.tsx`, which mounts one instance of every atom with mock data.

#### Scenario: Companion file is required for every atom

- **WHEN** the gate walks `packages/design-system/src/atoms/<atom>/`
- **THEN** each `<atom>.tsx` has either a sibling `<atom>.ladle.tsx` or a sibling `<atom>.test.tsx` (or both). An atom with neither companion fails the gate.
- **AND** the `backdrop/` and `__overview__/` folders are exempt from the companion-file rule (they are utility / overview folders, not atoms).
- **AND** the gate's `EXCLUDED_ATOM_DIRS` set MUST list exactly `["__overview__", "backdrop"]`. Any other folder under `atoms/` that lacks a `<dir>.ladle.tsx` or `<dir>.test.tsx` companion file is treated as an atom and fails the gate.

#### Scenario: Ladle coverage script still passes

- **WHEN** `bun run ladle:coverage` runs after the new atom stories are added
- **THEN** the script reports no drift: every atom story has a matching `@ladle(component=…, story=…)` reference or an explicit opt-out annotation.

### Requirement: `@unveiled/design-system` owns the atom-chrome CSS

The package MUST ship a hand-written CSS file at `packages/design-system/src/styles/atom-chrome.css` that is the source of truth for the visual chrome applied to HeroUI primitives in the atoms layer. The file MUST define explicit class names of the form `unveiled-{atom}-{slot}` (for example, `unveiled-text-input-wrapper`, `unveiled-tab`, `unveiled-table-th`, `unveiled-select-popover`) with concrete CSS values — not Tailwind v4 utility classes. The file MUST be exported under `./styles/atom-chrome.css` in the package's `exports` map, MUST be re-imported by every atom `.tsx` file that uses the chrome classes, and MUST NOT depend on Tailwind v4's `@source` scanning machinery (the file is processed by Vite as a normal CSS module and is therefore not subject to the per-story tree-shaking that strips `!`-prefix utility classes from per-chunk imports).

The chrome classes MUST use `!important` on visual properties (background-color, border, color, padding, font-size, font-weight, text-transform, letter-spacing, box-shadow, transform, text-align) so they reliably override HeroUI's default styles regardless of cascade order.

#### Scenario: Atom-chrome CSS is exported and re-imported

- **WHEN** a contributor runs `bun pm ls` (or the Bun workspace equivalent) from the repo root
- **THEN** `packages/design-system/package.json` `exports["./styles/atom-chrome.css"]` resolves to `./src/styles/atom-chrome.css`.
- **AND** every atom `.tsx` file under `packages/design-system/src/atoms/<atom>/` that uses chrome classes imports `../../styles/atom-chrome.css` at the top of the file.

#### Scenario: Atom-chrome CSS uses concrete values not utility classes

- **WHEN** `packages/design-system/src/styles/atom-chrome.css` is inspected
- **THEN** the file contains CSS rules that use concrete values (e.g. `background-color: #202621 !important`, `border: 4px solid #202621 !important`, `color: #fff !important`, `font-weight: 900 !important`).
- **AND** the file does not depend on Tailwind v4's `@source` directive (no `@source` rule in the file).
- **AND** every chrome class is `!important` on its visual properties so the rules reliably override HeroUI's defaults.

#### Scenario: Chrome rules apply when atoms render

- **WHEN** an atom story mounts in Ladle (e.g. `Atoms / TextInput / Default`)
- **THEN** the rendered DOM shows the chrome (e.g. 4px solid `unveiled-brand-dark` border on the input wrapper, dark header on the table, yellow selected tab with offset shadow).
- **AND** a hard-reload of the page (Cmd+Shift+R / Ctrl+Shift+R) is NOT required to see the chrome — the rules ship with the story chunk via the shared `atom-chrome.css` import or via an inline `<style>` tag in the story.

### Requirement: Molecules compose atoms, not HeroUI directly

The iteration-13 prompt is strict: "all components are based on HeroUI". The design system implements that rule as a layer contract — atoms are HeroUI compositions (each `<atom>.tsx` imports from `@nextui-org/react` or is a HeroUI pass-through re-export), and molecules are compositions of atoms. **Molecules MUST NOT import from `@nextui-org/react`, `@heroui/*`, or any other `@nextui-org/*` package directly.** If a molecule needs a HeroUI primitive that no atom exposes, the molecule MUST grow a new atom first; the rule is deliberate and is not relaxed in any proposal.

The molecules layer is organised under `packages/design-system/src/molecules/<molecule>/` with one folder per molecule. Each molecule folder MUST ship a `<molecule>.tsx`, a `<molecule>.types.ts` (when prop types are non-trivial), and a `<molecule>.ladle.tsx` with a default story and at least one variant story. Molecules with non-trivial logic MAY additionally ship a `<molecule>.test.tsx`.

The following 8 molecules are promoted in this change:

| Molecule | Composes |
| --- | --- |
| `Field` | `TextInput` / `TextArea` / `SelectInput` atom + label + helper/error span |
| `StatePanel` | `Card` atom + headline + body + action slot |
| `StatPanel` | `Card` atom + label + value + caption |
| `SelectInput` | `HeroUISelect` (via the `select-item` atom) + `SelectItem` atom |
| `Toast` | HeroUI `Alert` (via a dedicated `toast` atom in `atoms/`) + call/result helpers |
| `Drawer` | HeroUI `Drawer` primitives (via dedicated `drawer-trigger`/`drawer-content`/`drawer-body`/`drawer-header`/`drawer-footer` atoms) |
| `Modal` | HeroUI `Modal` primitives (via dedicated `modal-trigger`/`modal-content`/`modal-body`/`modal-header`/`modal-footer` atoms) |
| `Menu` (with `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuSection`) | HeroUI `Popover` primitives (via dedicated `menu-trigger`/`menu-content`/`menu-item`/`menu-section` atoms) |

The `Icon` molecule is NOT part of the design system. HeroUI 2.x has no `Icon` primitive, and the iteration-13 prompt does not allow the design system to ship non-HeroUI components. App/landing consumers inline `<svg>` directly; each inlined `<svg>` MUST carry a `// source: lucide-static` comment naming the source icon set for licence traceability (the Lucide icon set is ISC-licensed; the geometry is in the public domain, so the comment is a convention, not a licence requirement).

The `Field` molecule's `children` prop is typed
`ReactElement<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>`
so the gate can verify a `Field` always wraps an input-like atom
(`TextInput`, `TextArea`, or `SelectInput`). The type narrowing
preserves the existing call sites because every current `Field` user
already passes one of those three atoms.

#### Scenario: Molecules import only from atoms and lib

- **WHEN** `bun run check:atomic-layers` runs across `packages/design-system/src/molecules/**/*.tsx`
- **THEN** every file's import list matches the allow-list: `./atoms/...`, `./lib/...`, `react`, `react-dom`, framework primitives, and `./styles/generated/tokens.css`.
- **AND** any molecule importing from a sibling molecule, `./organisms/...`, `./layouts/...`, `./pages/...`, or `./heroui-replica/...` causes the gate to fail with the offending file path.

#### Scenario: Molecules do not import HeroUI directly

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/molecules/**/*.tsx`
- **THEN** no file contains `from "@nextui-org/react"`, `from "@nextui-org/..."`, or `from "@heroui/..."`.
- **AND** the gate fails with the offending file path if any molecule imports HeroUI directly. Molecules that need a HeroUI primitive that no atom exposes MUST grow a new atom first; this rule is deliberate and not relaxed in any proposal.

#### Scenario: Molecules do not import from above layers

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/molecules/**/*.tsx`
- **THEN** no file imports from `./organisms/...`, `./layouts/...`, or `./pages/...`.
- **AND** the gate fails with the offending file path if any molecule imports from a higher layer.

#### Scenario: Molecules do not import lucide-react

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/molecules/**/*.tsx`
- **THEN** no file imports from `lucide-react`. The design system has no `Icon` molecule; app/landing consumers inline `<svg>` directly with a `// source: lucide-static` comment.

#### Scenario: Field children type is input-like

- **WHEN** `packages/design-system/src/molecules/field/field.types.ts` is inspected at the `FieldProps` definition
- **THEN** `children` is typed `ReactElement<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>` (or the equivalent generic narrowing).
- **AND** `bun run --filter @unveiled/design-system typecheck` fails if a consumer passes a non-input element to `Field`.

#### Scenario: Each molecule has a Ladle story

- **WHEN** `bun ladle` boots and Ladle walks the design-system stories
- **THEN** every `packages/design-system/src/molecules/<molecule>/<molecule>.ladle.tsx` is discoverable, and the story group for the molecule lists at least one default story and at least one variant story that exercises a `variant`, `tone`, or `size` prop.

#### Scenario: Molecules / Overview story exists

- **WHEN** `bun ladle` boots
- **THEN** the `Molecules / Overview` group renders `packages/design-system/src/molecules/__overview__/overview.ladle.tsx`, which mounts one instance of every molecule with mock data.

### Requirement: No third-party UI dependencies in the design system

The design system MUST NOT declare any third-party UI library in `packages/design-system/package.json` `dependencies` or `devDependencies`. The only UI base library the design system uses is HeroUI (`@nextui-org/react`, `@heroui/*`). The design system has no `Icon` molecule and therefore does not declare `lucide-react`, `react-icons`, or any other icon package. The design system has no Radix / Headless UI / React Aria / MUI / Chakra / `react-aria-components` dependency — proposal 02 drops `@radix-ui/react-slot`, and proposal 03 confirms the design system ships with no other third-party UI dependency.

The `R-MOLECULES-NO-LUCIDE` rule in the gate covers the molecule layer; the existing `R-ATOMS-NO-THIRD-PARTY-UI` rule (proposal 02) covers the atom layer. The `package.json` allow-list is the package-level guarantee.

#### Scenario: No third-party UI dependency in package.json

- **WHEN** `packages/design-system/package.json` is read
- **THEN** `dependencies` and `devDependencies` do NOT contain `@radix-ui/*`, `@headlessui/*`, `react-aria`, `react-aria-components`, `@mui/*`, `@chakra-ui/*`, `lucide-react`, `react-icons`, or any other third-party UI library.
- **AND** `bun run check:atomic-layers` enforces the per-file allow-list in addition to the `package.json` allow-list.

#### Scenario: No documented "extreme case" allows a third-party UI dependency

- **WHEN** a contributor proposes adding a new third-party UI dependency to `packages/design-system/package.json`
- **THEN** the gate rejects the change because the design system has no third-party UI dependencies. The prompt is read strictly: "all components are based on HeroUI" means the HeroUI surface is the only UI surface the design system may depend on.

### Requirement: Organisms, layouts, and pages compose atoms, not HeroUI directly

The `organisms/`, `layouts/`, and `pages/` layers MUST share the same "compose atoms, not HeroUI" contract as the molecules layer. No file under `packages/design-system/src/{organisms,layouts,pages}/**` may import from `@nextui-org/react`, `@heroui/*`, or any other `@nextui-org/*` package directly. Files in these layers MAY import from `./atoms/...`, `./molecules/...`, `./lib/...`, and other higher layers (organisms may import from molecules and other organisms; layouts and pages may import from any lower layer). Files in these layers MUST NOT import from `lucide-react` or any other third-party UI library.

This rule is forward-looking: it is laid down in proposal 03 even though no organism, layout, or page exists yet, so proposals 04 (organisms) and 05 (layouts/pages) inherit a passing rule as a precondition.

#### Scenario: Higher layers do not import HeroUI directly

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/{organisms,layouts,pages}/**/*.tsx`
- **THEN** no file contains `from "@nextui-org/react"`, `from "@nextui-org/..."`, or `from "@heroui/..."`.
- **AND** the gate fails with the offending file path if any organism, layout, or page imports HeroUI directly.

#### Scenario: Higher layers may import from lower layers

- **WHEN** a file under `packages/design-system/src/organisms/` imports a component from `./molecules/...` or `./atoms/...`
- **THEN** the gate passes — organisms, layouts, and pages are allowed to import from any lower layer.
- **AND** the gate fails if the file imports from a sibling organism's internals (the organism's barrel re-export is the only allowed entry point, mirroring the atom-molecule rule).

