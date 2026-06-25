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

The package MUST NOT re-export the following primitives in this version: `Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`, and the `Button.asChild` API. They are removed under iteration-13 proposal 02 (atoms layer); their replacements are documented in the "Removed components and their HeroUI / plain-element replacements" requirement below. After this change lands, `packages/design-system/src/_legacy.tsx` and `packages/design-system/src/unveiled-primitives.tsx` MUST be deleted from the source tree, and no other file (inside or outside the package) MAY re-export the removed names. The six single-file atoms / molecules that proposals 02 and 03 moved into the `atoms/` and `molecules/` folders (`packages/design-system/src/button.tsx`, `packages/design-system/src/drawer.tsx`, `packages/design-system/src/menu.tsx`, `packages/design-system/src/modal.tsx`, `packages/design-system/src/tabs.tsx`, `packages/design-system/src/toast.tsx`) MUST also be deleted from the source tree; their content lives in the `atoms/` and `molecules/` folders and is the only source of truth.

The `StatePanel` molecule (which used to compose the removed `Panel` atom) MUST be rewritten to compose the `Card` atom instead. Its public prop surface is reduced to the props `Card` actually accepts; the removed `tone` and `shadow` props are dropped. Existing call sites that passed `tone` / `shadow` MUST be migrated as part of proposal 07 (app) and proposal 08 (landing); neither package ships with a `StatePanel tone="…"` call site after this change lands.

In addition to the flat re-export of every atom and the `Atoms` namespace export introduced in proposal 02, the package barrel MUST also re-export every molecule (`Field`, `StatePanel`, `StatPanel`, `SelectInput`, `Toast`, `Drawer`, `Modal`, `Menu`/`MenuTrigger`/`MenuContent`/`MenuItem`/`MenuSection`) as a `Molecules` namespace export (`export { Molecules } from "./molecules"`). The flat re-exports of the molecules that proposal 07 (app migration) and proposal 08 (landing migration) previously relied on are removed from the barrel at the same time `_legacy.tsx` is deleted.

The package barrel MUST also re-export the `cn` helper from `./lib/utils` and the `StatusColor` type from `./lib/design-tokens`. The `cn` re-export is the canonical public entry point; consumers MUST import `cn` from `@unveiled/design-system`, never from `@unveiled/design-system/lib/utils`.

In addition to the primitives above, the package barrel MUST re-export the `UnveiledThemeProvider` component (defined at `packages/design-system/src/providers/theme-provider.tsx`) as a flat named export AND as a `Providers` namespace export (`export * as Providers from "./providers"`). The provider wraps HeroUI's `NextUIProvider` and is the only theme provider the app and landing packages may mount around HeroUI-context islands. The previous production provider at `packages/app/src/components/providers/heroui-provider.tsx` (exporting `HeroUIProvider`) MUST be deleted from the source tree once every consumer is rewired; the design-system barrel MUST NOT re-export the `HeroUIProvider` name because it leaks the HeroUI implementation detail into consumer surfaces.

#### Scenario: All production primitives are re-exported

- **WHEN** a downstream package (e.g. `@unveiled/app`, `@unveiled/landing`) imports a production primitive from `@unveiled/design-system`
- **THEN** the import resolves to a module under `packages/design-system/src/` that composes the same HeroUI component the previous `src/components/ui/<primitive>.tsx` file composed
- **AND** the public prop surface (`variant`, `size`, `interactive`, `state`, `loading`, `open`, `onClose`, `title`, `label`, `hint`, `error`, `value`, `onChange`, `disabled`, …) is preserved exactly for the surviving primitives.
- **AND** `tone` and `shadow` are NOT part of the surviving primitives' prop surface (the removed `Badge.tone`, `Panel.tone`, `Panel.shadow`, and `StatePanel.tone` / `StatePanel.shadow` props are dropped at the molecule level when the molecule is rewritten to compose `Card`).

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

#### Scenario: Legacy shims are deleted from the source tree

- **WHEN** the design-system source tree is listed after this change lands
- **THEN** `packages/design-system/src/_legacy.tsx` and `packages/design-system/src/unveiled-primitives.tsx` do not exist.
- **AND** the six single-file atoms / molecules `packages/design-system/src/{button,drawer,menu,modal,tabs,toast}.tsx` do not exist (their content is in `packages/design-system/src/atoms/` and `packages/design-system/src/molecules/`).
- **AND** `bun run --filter @unveiled/design-system typecheck` and `bun run --filter @unveiled/design-system build` succeed without any of those files.

#### Scenario: cn is re-exported from the barrel

- **WHEN** a downstream package writes `import { cn } from "@unveiled/design-system";`
- **THEN** the import resolves to the `cn` helper at `packages/design-system/src/lib/utils.ts` via a flat re-export in `packages/design-system/src/index.ts`.
- **AND** the barrel also re-exports the `StatusColor` type from `./lib/design-tokens`.

#### Scenario: UnveiledThemeProvider is re-exported from the barrel

- **WHEN** a downstream package writes `import { UnveiledThemeProvider } from "@unveiled/design-system";`
- **THEN** the import resolves to the provider at `packages/design-system/src/providers/theme-provider.tsx`.
- **WHEN** a downstream package writes `import { Providers } from "@unveiled/design-system"; Providers.UnveiledThemeProvider`
- **THEN** the namespace resolves via the design-system's `Providers` namespace export.
- **AND** `@unveiled/design-system` does NOT export a `HeroUIProvider` name; any consumer importing `HeroUIProvider` from `@unveiled/design-system` fails with "no exported member".

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

The package MUST ship the generated design-token CSS at `packages/design-system/src/styles/generated/tokens.css` (relocated from `src/styles/generated/tokens.css`) and MUST export it under `./styles/generated/tokens.css` in its `exports` map. `bun run tokens:gen` MUST write into the package, and `bun run tokens:check` MUST continue to fail on drift. Downstream apps (`@unveiled/app`, `@unveiled/landing`) MUST import tokens exclusively through `@unveiled/design-system/styles/global.css`, which in turn imports `./generated/tokens.css`; they MUST NOT import `./styles/generated/tokens.css` directly in their own `global.css`.

#### Scenario: Tokens are generated into the package

- **WHEN** `bun run tokens:gen` runs
- **THEN** `packages/design-system/src/styles/generated/tokens.css` is written with the same `--unveiled-*` CSS custom properties that previously lived in `src/styles/generated/tokens.css`.

#### Scenario: Tokens check still detects drift

- **WHEN** `bun run tokens:check` runs after `design-tokens.json` is edited without regenerating
- **THEN** it fails and names the drifted file (`packages/design-system/src/styles/generated/tokens.css`).

#### Scenario: Downstream apps consume tokens through global CSS

- **WHEN** `packages/app/src/styles/global.css` (or `packages/landing/src/styles/global.css`) is read
- **THEN** it contains only `@import "@unveiled/design-system/styles/global.css";`
- **AND** the imported global CSS resolves the same `--unveiled-*` variables the apps previously resolved via a direct tokens import and local `@theme` block.

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

### Requirement: Layouts are layout shells with no page-specific data

The `packages/design-system/src/layouts/` layer MUST expose layout shells
(`AppLayout` and `LandingLayout`) that compose existing shell and landing
organisms into a frame (header + main + footer). Layouts MUST NOT fetch
data, MUST NOT import from `@nextui-org/react` or `@heroui/*` directly
(they consume organisms), and MUST NOT import from `./pages/`. The gate
`bun run check:atomic-layers` enforces all three rules.

#### Scenario: Layouts consume organisms only

- **WHEN** `packages/design-system/src/layouts/<layout>/<layout>.tsx` is
  inspected
- **THEN** its imports include at least one organism from
  `../../organisms/...` (e.g. `AppShellPresentational`,
  `LandingHeaderPresentational`, `LandingHeroPresentational`,
  `LandingFooterPresentational`, `PageShell`)
- **AND** no import targets `@nextui-org/react`, `@nextui-org/...`, or
  `@heroui/...` directly.

#### Scenario: Layouts do not import from pages

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/layouts/**/*.tsx`
- **THEN** no file contains `from "./pages/..."` or any equivalent
  cross-layer import.
- **AND** the gate fails with the offending file path if any layout
  reaches into the pages layer.

#### Scenario: `AppLayout` composes shell organisms

- **WHEN** `packages/design-system/src/layouts/app-layout/app-layout.tsx`
  is read
- **THEN** `AppLayout` accepts props for `header` (ReactNode),
  `pageHeader` (ReactNode), `pageBody` (ReactNode), and `pageAside`
  (ReactNode, optional)
- **AND** the rendered tree composes `AppShellPresentational` (with
  `header`) wrapping a slot grid (`pageHeader` + `pageBody` +
  optional `pageAside`).

#### Scenario: `LandingLayout` composes landing organisms

- **WHEN** `packages/design-system/src/layouts/landing-layout/landing-layout.tsx`
  is read
- **THEN** `LandingLayout` accepts props for `authenticated` (boolean,
  default false), `hero` (boolean, default false), and `children`
  (ReactNode)
- **AND** the rendered tree composes `LandingHeaderPresentational`
  (with `authenticated`), optionally `LandingHeroPresentational`
  (with `authenticated`), the `children` as the page `<main>`, and
  `LandingFooterPresentational`.

#### Scenario: Each layout has a co-located Ladle story

- **WHEN** `bun ladle` boots and Ladle walks the design-system stories
- **THEN** `packages/design-system/src/layouts/app-layout/app-layout.ladle.tsx`
  and
  `packages/design-system/src/layouts/landing-layout/landing-layout.ladle.tsx`
  are discoverable, each exporting at least one `StoryObj` that renders
  the layout with mock data and no organisms inside the body
  (`pageBody` / `children` are simple placeholder content).

#### Scenario: Each layout has a mock fixture

- **WHEN** `packages/design-system/src/layouts/app-layout/app-layout.mock.ts`
  (or the equivalent `landing-layout.mock.ts`) is read
- **THEN** it exports a `makeMockAppLayoutProps(overrides?)` (or
  `makeMockLandingLayoutProps(overrides?)`) factory with sensible
  defaults (a mock header ReactNode, a placeholder `pageBody`,
  `authenticated: false`, `hero: false`) that callers can override
  field-by-field.

### Requirement: Every page surface has a demo page viewable in Ladle with mock data

The design system MUST expose demo pages for every user-facing surface
under `packages/design-system/src/pages/<domain>/<surface>.page.ladle.tsx`.
Pages are Ladle stories only; they MUST NOT ship as a runtime export
from the design-system barrel. The pages layer MUST be import-isolated
from production: no production entry point outside
`packages/design-system/src/pages/` may reach into the folder.

#### Scenario: Demo pages exist for every user-facing surface

- **WHEN** `packages/design-system/src/pages/` is listed
- **THEN** it contains at least the following `*.page.ladle.tsx` files:
  `auth/login.page.ladle.tsx`, `auth/signup.page.ladle.tsx`,
  `auth/password-recovery.page.ladle.tsx`,
  `discovery/discover.page.ladle.tsx`,
  `members/member-feed.page.ladle.tsx`,
  `bookings/booking-modal.page.ladle.tsx`,
  `admin/admin-panel.page.ladle.tsx`,
  `partner/partner-portal.page.ladle.tsx`,
  `payments/admin-freeze-unfreeze.page.ladle.tsx`,
  `payments/credit-ledger.page.ladle.tsx`,
  `payments/stripe-checkout.page.ladle.tsx`,
  `payments/subscription-portal.page.ladle.tsx`, and
  `landing/landing.page.ladle.tsx`.

#### Scenario: Demo pages render at fullscreen in Ladle

- **WHEN** `bun ladle` boots and a contributor opens any
  `*.page.ladle.tsx` story
- **THEN** the story renders with the layout's full viewport (the
  `Default` story's `parameters.layout` is `"fullscreen"`)
- **AND** the demo page composes `AppLayout` (or `LandingLayout`) with
  the relevant organism(s) and a mock fixture, not real data.
- **AND** for surfaces whose "page" organism is composed of multiple
  sub-organisms (e.g. `AdminPanelHeaderPresentational` +
  `AdminPanelTabBarPresentational` + `AdminPanelActionListPresentational`),
  the demo page composes the sub-organisms in a vertical stack inside
  the layout's `pageBody` slot.

#### Scenario: Demo pages must use mock data

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/pages/**/*.tsx`
- **THEN** every file imports at least one `*.mock` helper (the gate
  greps for `from .*\.mock"` in each file).
- **AND** the gate fails with the offending file path if any page
  hard-codes its data instead of going through a fixture.

#### Scenario: Pages are Ladle-only files

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/pages/**`
- **THEN** every `.tsx` file ends in `.page.ladle.tsx`; no
  `pages/<name>.tsx` runtime file exists.
- **AND** the design-system barrel (`packages/design-system/src/index.ts`)
  does NOT re-export a runtime `Pages` namespace; the pages folder
  exists only as Ladle stories.

#### Scenario: Pages are import-isolated from production

- **WHEN** `bun run test:unit` runs
- **THEN** the permanent unit test
  `tests/unit/design-system-pages.test.ts` passes, asserting that no
  production file under `packages/app/src/**`,
  `packages/landing/src/**`, or the design-system's own runtime
  barrel imports from `packages/design-system/src/pages/`.
- **AND** the existing
  `tests/unit/no-ladle-replica-in-production.test.ts` policy continues
  to pass; the pages folder is treated as a Ladle-only folder under
  the same import-isolation policy.

#### Scenario: Layouts namespace is reachable from the barrel

- **WHEN** a downstream package writes
  `import { Layouts } from "@unveiled/design-system"; Layouts.AppLayout`
  (or `Layouts.LandingLayout`)
- **THEN** the namespace resolves via the design-system's `Layouts`
  namespace export, parallel to the existing `Atoms`, `Molecules`, and
  `Organisms` namespace exports.
- **AND** the flat re-exports `AppLayout` and `LandingLayout` from
  `@unveiled/design-system` also resolve to the same React components.

### Requirement: Astro layouts project the React layouts via `<slot />`

The Astro layouts `packages/app/src/layouts/base-layout.astro` and `packages/landing/src/layouts/landing-layout.astro` MUST import the corresponding React layout from `@unveiled/design-system/layouts/<layout>` and MUST project it via the existing `<slot />`. The Astro layer MUST keep ownership of the HTML document and meta tags. The Astro layouts MUST import `@unveiled/design-system/styles/global.css` (via each package's one-line `global.css` shim) exactly once per surface. The Astro wrapper change MUST NOT alter the visible output of any page that consumes the layout.

#### Scenario: App Astro layout mounts AppLayout

- **WHEN** `packages/app/src/layouts/base-layout.astro` is read
- **THEN** the file imports `AppLayout` from `@unveiled/design-system/layouts/app-layout`
- **AND** the `<body>` contains an `<AppLayout>` element wrapping `<slot />` (rendered without a `header` prop, so the layout does not duplicate the page's own `AppShell`).

#### Scenario: Landing Astro layout mounts LandingLayout

- **WHEN** `packages/landing/src/layouts/landing-layout.astro` is read
- **THEN** the file imports `LandingLayout` from `@unveiled/design-system/layouts/landing-layout`
- **AND** the `<body>` contains a `<LandingLayout>` element wrapping `<slot />` (rendered without a `hero` prop, so the layout does not duplicate the page's own landing composition).

#### Scenario: AppLayout supports a header-less slot-only mode

- **WHEN** `AppLayout` is rendered without a `header` prop
- **THEN** the layout renders the page-body grid (or whatever the layout's children render) without the `AppShellPresentational` chrome, so the Astro wrapper can mount the layout around pages that emit their own shell without double-rendering the shell.

#### Scenario: Astro pages still render unchanged

- **WHEN** every Astro page under `packages/app/src/pages/` and `packages/landing/src/pages/` is rendered with `bun run dev` or `bun run build` after the wrapper update
- **THEN** the visible output is byte-equivalent (or visually equivalent) to the output before the styling-ownership change; the only change is that CSS rules and semantic classes are owned by the design system.

### Requirement: Design tokens are the only styling source

The design system package MUST be the sole owner of every CSS rule, custom utility, Tailwind `@theme` override, semantic layout class, and `cn()` composition catalogue. Packages `@unveiled/app` and `@unveiled/landing` MUST NOT declare bespoke `@layer` rules, Tailwind theme blocks, or raw Tailwind utility strings on JSX/TSX/Astro/HTML elements. The boundary is enforced by `bun run check:styling-ownership`, which runs as part of `bun run check`.

#### Scenario: Gate rejects raw Tailwind utilities in app source

- **WHEN** a file under `packages/app/src/**` contains a `className` string with a forbidden Tailwind utility (for example `grid`, `flex`, `gap-4`, `min-h-screen`, `border-4`, `p-4`, `px-6`, `py-8`, `text-[10px]`, `bg-[*]`, or `space-y-6`)
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending file and utility token.

#### Scenario: Gate rejects raw Tailwind utilities in landing source

- **WHEN** a file under `packages/landing/src/**` contains a `className` string with a forbidden Tailwind utility
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending file and utility token.

#### Scenario: Gate rejects bespoke CSS in consumer styles directories

- **WHEN** `packages/app/src/styles/` or `packages/landing/src/styles/` contains any file other than `global.css`, or `global.css` contains anything other than `@import` lines pointing at `@unveiled/design-system/styles/...`
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending path.

#### Scenario: Gate rejects reverse imports into the design system

- **WHEN** any file under `packages/design-system/src/styles/**` imports from `packages/app/**` or `packages/landing/**`
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending import.

#### Scenario: Styling ownership check is part of bun run check

- **WHEN** a contributor runs `bun run check`
- **THEN** `bun run check:styling-ownership` runs as one of its steps
- **AND** if any forbidden styling pattern is present, `bun run check` exits non-zero.

### Requirement: `@unveiled/design-system` owns global CSS and semantic layout classes

The package MUST ship `packages/design-system/src/styles/global.css` as the single global stylesheet entry point. The file MUST import `./generated/tokens.css`, `./tailwind-theme.css`, and the Tailwind v4 layers (`@tailwind base`, `@tailwind components`, `@tailwind utilities`), then declare every bespoke class previously scattered across consumer `global.css` files and every semantic layout class used by app and landing surfaces. The file MUST be exported under `./styles/global.css` in the package `exports` map.

The initial semantic-class catalogue MUST include at minimum: `.app-page`, `.app-page-header`, `.app-page-toolbar`, `.content-shell`, `.page-shell`, `.form-shell`, `.grid-shell`, `.auth-page`, `.auth-card`, `.auth-stack`, `.discover-layout`, `.discover-sidebar`, `.discover-main`, `.member-feed-list`, `.member-feed-row`, `.member-feed-empty`, `.admin-panel-grid`, `.admin-panel-section`, `.admin-panel-stats`, `.landing-page`, `.landing-section`, and `.landing-footer-grid`. Every semantic class MUST support `--{variant}` modifier suffixes for at least `interactive`, `loading`, `error`, `empty`, `success`, and `disabled` where stateful surfaces require them.

#### Scenario: Global CSS exports from the package

- **WHEN** `packages/design-system/package.json` `exports` is read
- **THEN** `./styles/global.css` resolves to `./src/styles/global.css`.

#### Scenario: Global CSS chain imports tokens and theme before Tailwind layers

- **WHEN** `packages/design-system/src/styles/global.css` is read
- **THEN** it `@import`s `./generated/tokens.css` and `./tailwind-theme.css` before the `@tailwind` directives
- **AND** it declares the moved bespoke classes (`headline-*`, `unveiled-shadow`, `unveiled-card-hover`, `page-shell`, `content-shell`, `unveiled-meta`, `grid-shell`, and any other classes previously in `packages/app/src/styles/global.css`).

#### Scenario: Semantic classes replace inline utility compositions

- **WHEN** a layout in `packages/app/src/**` or `packages/landing/src/**` previously used `className="min-h-screen flex flex-col bg-white text-brand-dark"` (or equivalent utility strings from the catalogue)
- **THEN** after this change the wrapping element uses the corresponding semantic class (for example `app-page`) defined in `packages/design-system/src/styles/global.css`
- **AND** the visual output is unchanged per the visual-regression baselines in `tests/visual/`.

#### Scenario: Variant modifiers compose with semantic base classes

- **WHEN** an organism renders an interactive member-feed row
- **THEN** it composes `cn("member-feed-row", isInteractive && "member-feed-row--interactive")` using classes defined in the design-system global CSS
- **AND** no additional raw Tailwind utilities are added in the app or landing package.

### Requirement: `@unveiled/design-system` owns the Tailwind v4 theme overrides

The package MUST ship `packages/design-system/src/styles/tailwind-theme.css` containing the sole `@theme` block for Tailwind v4 color, font, and shadow overrides derived from `design-tokens.json`. No `@theme` block MAY remain in `packages/app/src/styles/global.css` or `packages/landing/src/styles/global.css`.

#### Scenario: Theme file is the only @theme source

- **WHEN** `packages/design-system/src/styles/tailwind-theme.css` is read
- **THEN** it declares `@theme` with brand colors (`brand-dark`, `brand-yellow`, `brand-cream`, `brand-grey`), display and sans font families, and the `shadow-unveiled` token
- **AND** neither `packages/app/src/styles/global.css` nor `packages/landing/src/styles/global.css` contains an `@theme` block.

#### Scenario: Theme is imported through global CSS

- **WHEN** `packages/design-system/src/styles/global.css` is read
- **THEN** it `@import`s `./tailwind-theme.css` before the `@tailwind` directives
- **AND** Tailwind utilities in design-system stories and downstream apps resolve brand tokens to the same values as before the move.

### Requirement: App package consumes the design system, not its internals

Every file under `packages/app/src/**` (Astro pages, Astro layouts, React islands, server-side data hooks, action handlers, view-model mappers) MUST import UI surfaces — atoms, molecules, organisms, layouts, semantic CSS classes, and the `cn` helper — exclusively from `@unveiled/design-system` (the public barrel). The app MUST NOT import from `@unveiled/design-system/lib/*` (the internal path), `@unveiled/design-system/<layer>/<file>` (the per-folder deep imports that skip the barrel), `@nextui-org/react`, `@heroui/*`, `lucide-react`, `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`, `@chakra-ui/*`, or any other third-party UI library. App-internal paths (`@/lib/auth-client`, `@/lib/stripe`, `@/lib/data-access/*`, `@/lib/unveiled-view-models`, `@/lib/app-shell-view-models`) are still allowed because they are not UI surfaces.

The containers in `packages/app/src/components/unveiled/` (or, optionally after this change lands, `packages/app/src/containers/`) own the data wiring (`useQuery`, `useMutation`, `authClient`, `fetch("/api/...")`, Stripe calls). They compose the data hooks with the canonical `<Organism>Presentational` symbol from the design-system barrel. The container file structure is:

```tsx
"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SomeOrganismPresentational } from "@unveiled/design-system";
import type { SomeOrganismProps } from "@unveiled/design-system";
import { authClient } from "@/lib/auth-client";
```

The mapping helpers (`mapSessionToProps`, `mapMutationToProps`) are extracted per container and unit-tested. The container exports `<Name>Container` (the data-wired component) and does NOT re-export the presentational; consumers that want the presentational with mock data import the design-system `<Name>Presentational` directly.

The rule is enforced by `bun run check:styling-ownership` (existing) plus a new permanent unit test under `tests/unit/` that greps every `.tsx` / `.astro` / `.ts` file in `packages/app/src/**` and fails if it imports from any forbidden path or module. The unit test allow-list is: `@unveiled/design-system`, `@unveiled/app/lib/*` (the app-internal paths), `react`, `react-dom`, framework primitives (`@tanstack/react-query`, `@stripe/stripe-js`, `lucide-static` comments inside `<svg>` tags only), and `@unveiled/*` cross-package imports.

#### Scenario: No deep imports into the design system

- **WHEN** `tests/unit/app-design-system-import-boundary.test.ts` greps `packages/app/src/**/*.{ts,tsx,astro}` for `from "@unveiled/design-system/`
- **THEN** every match is followed by an allowed continuation (only the public barrel `@unveiled/design-system";` or `@unveiled/design-system/styles/global.css`;` — both of which are reachable through the package's `exports` map)
- **AND** no match points at `@unveiled/design-system/lib/*`, `@unveiled/design-system/atoms/*`, `@unveiled/design-system/molecules/*`, `@unveiled/design-system/organisms/*`, `@unveiled/design-system/layouts/*`, `@unveiled/design-system/pages/*`, or `@unveiled/design-system/heroui-replica/*`.

#### Scenario: No third-party UI imports in app source

- **WHEN** `tests/unit/app-design-system-import-boundary.test.ts` greps `packages/app/src/**/*.{ts,tsx,astro}` for `from "@nextui-org/"`, `from "@heroui/"`, `from "lucide-react"`, `from "@radix-ui/"`, `from "@headlessui/"`, `from "react-aria`, `from "@mui/"`, `from "@chakra-ui/"`
- **THEN** zero hits are returned (the only `lucide-*` string allowed is the literal comment `// source: lucide-static` inside an inlined `<svg>` tag, enforced by a separate allow-list match in the test).

#### Scenario: Containers compose the design-system presentational

- **WHEN** a container file under `packages/app/src/components/unveiled/<surface>/` is read
- **THEN** it imports the data hooks from `@tanstack/react-query`, `authClient`, and app-internal data-access modules
- **AND** it imports `<Surface>Presentational` from `@unveiled/design-system`
- **AND** the default export is `<Surface>Container`, a React component that wires the data hooks to the presentational's props via extracted `mapSessionToProps` / `mapMutationToProps` helpers.

#### Scenario: Mapping helpers are unit-tested

- **WHEN** `bun run test:workspaces` runs
- **THEN** every container that has a non-trivial data mapping ships a co-located `<surface>.test.ts` (or `.test.tsx`) file that exercises the mapping helpers with at least one happy-path and one error-path fixture.

### Requirement: `cn()` is imported from the public design-system barrel

Every file under `packages/app/src/**` (and, by symmetry in proposal 08, `packages/landing/src/**`) that uses the `cn()` helper MUST import it from `@unveiled/design-system` (the public barrel). Importing `cn` from the internal path `@unveiled/design-system/lib/utils` is forbidden because that path is private to the package and is not part of the `exports` map's runtime contract.

The design-system barrel (`packages/design-system/src/index.ts`) MUST re-export `cn` as a flat export so the consumer's import resolves. The barrel also MUST NOT keep `cn` as a sub-path re-export at the top level (the consumers do not want to write `Atoms.cn` or `Lib.cn` — they want a top-level `cn`).

The rule is enforced by:
1. A new `R-CN-IMPORT-PATH` rule added to
   `packages/design-system/scripts/check-styling-ownership.ts` (the
   existing gate wired into `bun run check`). The rule walks every
   `.tsx` / `.ts` / `.astro` file in `packages/app/src/**` (and
   `packages/landing/src/**` for proposal 08) and fails if any file
   imports `cn` from a path other than `@unveiled/design-system`.
2. A new permanent unit test under `tests/unit/app-cn-import-path.test.ts`
   that greps every file in `packages/app/src/**` for
   `from "@unveiled/design-system/lib/utils"` (and the landing
   equivalent, owned by proposal 08) and fails if any match is found.

#### Scenario: App consumer imports cn from the public barrel

- **WHEN** a file under `packages/app/src/**` uses the `cn` helper
- **THEN** it imports `cn` via `import { cn } from "@unveiled/design-system";`
- **AND** it does NOT import `cn` from `@unveiled/design-system/lib/utils` (which is the internal path; the package's `exports` map exposes the helper only through the barrel).

#### Scenario: cn is re-exported from the public barrel

- **WHEN** `packages/design-system/src/index.ts` is read
- **THEN** it contains a flat re-export `export { cn } from "./lib/utils";`
- **AND** the same file does NOT re-export `cn` from any internal sub-path (`./lib/utils` is the source; the barrel is the only public entry point).

#### Scenario: Styling-ownership gate rejects internal cn imports

- **WHEN** a contributor edits a file in `packages/app/src/**` to import `cn` from `@unveiled/design-system/lib/utils`
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending file and import line.
- **AND** `bun run check` exits non-zero as a result.

#### Scenario: Permanent unit test fails on internal cn imports

- **WHEN** `bun run test:unit` runs
- **THEN** `tests/unit/app-cn-import-path.test.ts` greps every `.ts`, `.tsx`, and `.astro` file under `packages/app/src/**`
- **AND** the test fails if any file contains `from "@unveiled/design-system/lib/utils"` (the `cn` internal path).

### Requirement: Landing package consumes the design system, not its internals

The landing package SHALL consume UI surfaces — atoms, molecules, organisms, layouts, semantic CSS classes, and the `cn` helper — exclusively from `@unveiled/design-system` (the public barrel). Every file under `packages/landing/src/**` (Astro pages, Astro layouts, and any future React island) MUST import those surfaces from `@unveiled/design-system` and MUST NOT import from `@unveiled/design-system/lib/*` (the internal path), `@unveiled/design-system/<layer>/<file>` (the per-folder deep imports that skip the barrel), `@nextui-org/react`, `@heroui/*`, `lucide-react`, `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`, `@chakra-ui/*`, or any other third-party UI library. The landing package MUST NOT import from a local `packages/landing/src/components/landing/...` path because that path is deleted; any future re-introduction of the folder SHALL be rejected by the gate.

The rule is enforced by:

1. The existing `bun run check:styling-ownership` script (the
   raw-Tailwind-utility and reverse-import gate).
2. A new `R-LANDING-NO-LOCAL-UI` rule added to
   `packages/design-system/scripts/check-styling-ownership.ts`:
   the rule walks every `.tsx`, `.ts`, and `.astro` file in
   `packages/landing/src/**` and fails if any file imports from
   a relative path that resolves under
   `packages/landing/src/components/landing/`. The rule is a
   forward-looking regression guard; the path no longer exists
   after the change lands, so the rule has no hits in the
   current source tree.
3. A new permanent unit test under
   `tests/unit/landing-design-system-import-boundary.test.ts`
   that greps every `.tsx`, `.astro`, and `.ts` file in
   `packages/landing/src/**` for `from "@unveiled/design-system/`
   followed by a forbidden continuation, for
   `from "@nextui-org/"`, `from "@heroui/"`,
   `from "lucide-react"`, `from "@radix-ui/"`,
   `from "@headlessui/"`, `from "react-aria"`, `from "@mui/"`,
   `from "@chakra-ui/"`, and for any import whose path resolves
   under `packages/landing/src/components/landing/`.

#### Scenario: Landing imports flow through the public design-system barrel

- **WHEN** `tests/unit/landing-design-system-import-boundary.test.ts` greps `packages/landing/src/**/*.{ts,tsx,astro}` for `from "@unveiled/design-system/`
- **THEN** every match is followed by an allowed continuation (only the public barrel `@unveiled/design-system";` or `@unveiled/design-system/styles/global.css";` — both of which are reachable through the package's `exports` map)
- **AND** no match points at `@unveiled/design-system/lib/*`, `@unveiled/design-system/atoms/*`, `@unveiled/design-system/molecules/*`, `@unveiled/design-system/organisms/*`, `@unveiled/design-system/layouts/*`, `@unveiled/design-system/pages/*`, or `@unveiled/design-system/heroui-replica/*`.

#### Scenario: Landing has no third-party UI imports

- **WHEN** `tests/unit/landing-design-system-import-boundary.test.ts` greps `packages/landing/src/**/*.{ts,tsx,astro}` for `from "@nextui-org/"`, `from "@heroui/"`, `from "lucide-react"`, `from "@radix-ui/"`, `from "@headlessui/"`, `from "react-aria"`, `from "@mui/"`, `from "@chakra-ui/"`
- **THEN** zero hits are returned.

#### Scenario: Landing has no local landing/ component imports

- **WHEN** `tests/unit/landing-design-system-import-boundary.test.ts` greps `packages/landing/src/**/*.{ts,tsx,astro}` for any import whose resolved path is under `packages/landing/src/components/landing/`
- **THEN** zero hits are returned (the folder is deleted).

#### Scenario: Styling-ownership gate rejects re-introduced landing-local UI

- **WHEN** a contributor re-creates `packages/landing/src/components/landing/landing-header.tsx` (or any file under `packages/landing/src/components/landing/`) and a consumer imports from it
- **THEN** the `R-LANDING-NO-LOCAL-UI` rule in `packages/design-system/scripts/check-styling-ownership.ts` exits non-zero and names the offending file
- **AND** `bun run check:styling-ownership` exits non-zero as a result
- **AND** `bun run check` exits non-zero as a result.

#### Scenario: Styling-ownership check is part of bun run check

- **WHEN** a contributor runs `bun run check`
- **THEN** `bun run check:styling-ownership` runs as one of its steps and the `R-LANDING-NO-LOCAL-UI` rule is part of the script's checks
- **AND** if any forbidden landing-import pattern is present, `bun run check` exits non-zero.

### Requirement: `@unveiled/design-system` owns the theme provider

The design system MUST be the sole owner of the HeroUI theme provider. The provider MUST live at `packages/design-system/src/providers/theme-provider.tsx`, MUST be named `UnveiledThemeProvider`, MUST wrap HeroUI's `NextUIProvider`, and MUST NOT accept a `theme` prop (the brand theme is fixed inside the design system; consumers cannot override it). No other file in the repo — in any package — may wrap `NextUIProvider` or define a parallel theme provider.

#### Scenario: Provider file lives in the design system

- **WHEN** the repo is searched for `from "@nextui-org/react"`
- **THEN** every match points at a file under `packages/design-system/**`.
- **AND** no file under `packages/app/src/**` or `packages/landing/src/**` matches.

#### Scenario: Provider is exported via both namespace and flat re-export

- **WHEN** `packages/design-system/src/index.ts` is read
- **THEN** it contains `export * as Providers from "./providers";`
- **AND** it contains `export { UnveiledThemeProvider } from "./providers/theme-provider";`
- **AND** `packages/design-system/src/providers/index.ts` re-exports `UnveiledThemeProvider` from `./theme-provider`.

#### Scenario: App and landing consumers import the new provider

- **WHEN** any Astro page or React island in `packages/app/src/**` or `packages/landing/src/**` mounts a HeroUI-context island
- **THEN** the mount wraps the island in `UnveiledThemeProvider` imported from `@unveiled/design-system`.
- **AND** no file in those trees imports `HeroUIProvider` from any path or imports `NextUIProvider` from `@nextui-org/react` directly.

#### Scenario: Legacy app provider file is deleted

- **WHEN** the source tree is listed after this change lands
- **THEN** `packages/app/src/components/providers/heroui-provider.tsx` does not exist.
- **AND** no file in the repo imports from `../components/providers/heroui-provider` or `~/components/providers/heroui-provider`.

### Requirement: HeroUI is a private implementation detail of the design system

The design system MUST be the only package in the repo that imports from `@nextui-org/react` or `@nextui-org/*`. The boundary is enforced by a permanent unit test under `tests/unit/` that walks every `.ts` / `.tsx` / `.astro` file in the repo and fails if any file outside `packages/design-system/**` imports `@nextui-org/react`, `@nextui-org/*`, or `@heroui/*`. The unit test runs as part of `bun run test:unit` and is wired into `bun run check`.

#### Scenario: No HeroUI import escapes the design system

- **WHEN** `bun run test:unit` is invoked
- **THEN** the new test (e.g. `tests/unit/design-system-hero-ui-boundary.test.ts`) passes
- **AND** it asserts that no `.ts` / `.tsx` / `.astro` file outside `packages/design-system/**` matches `from "@nextui-org/react"`, `from "@nextui-org/...`, or `from "@heroui/..."`.

#### Scenario: Boundary test runs as part of `bun run check`

- **WHEN** `bun run check` is invoked at the repo root
- **THEN** the HeroUI boundary test runs as part of the umbrella and exits 0.

#### Scenario: Replica provider is a re-export of the production provider

- **WHEN** `packages/design-system/src/heroui-replica/provider.tsx` is read
- **THEN** it re-exports `UnveiledThemeProvider` from `../providers/theme-provider` under the name `HeroUIReplicaProvider`.
- **AND** the file no longer imports `NextUIProvider` directly.
- **AND** the `// @ladle-only` header is preserved.
- **AND** the replica stories that import `HeroUIReplicaProvider` continue to work without modification.

### Requirement: All UI lives in `packages/design-system` and downstream packages consume the design system

The system SHALL treat `packages/design-system/src/` as the single
source of UI. The `app/` package and the `landing/` package SHALL
consume the design system via its public barrel
(`@unveiled/design-system`) and SHALL NOT import from
`@unveiled/design-system/lib/*`, from `@nextui-org/*`, from
`@heroui/*`, or from `lucide-react`. The design system's private
dependencies (HeroUI, the design-token CSS, the semantic-class CSS,
the Tailwind v4 theme) SHALL NOT leak into downstream packages'
import graphs. The boundary is enforced by the
`check:atomic-layers` and `check:styling-ownership` gate scripts
wired into `bun run check`.

#### Scenario: A downstream import never reaches a private design-system path

- **WHEN** `bun run test:unit` runs
- **THEN** the existing `tests/unit/design-system-hero-ui-boundary.test.ts`
  unit test passes, asserting that no file outside
  `packages/design-system/src/**` imports `@nextui-org/*` or
  `@heroui/*`
- **AND** the design-system barrel (`packages/design-system/src/index.ts`)
  is the only public entry point; `packages/app/src/**` and
  `packages/landing/src/**` import from `@unveiled/design-system`
  and never from `@unveiled/design-system/lib/*`.

#### Scenario: No raw Tailwind utility classes in app or landing

- **WHEN** `bun run check:styling-ownership` runs
- **THEN** every file under `packages/app/src/**` and
  `packages/landing/src/**` is checked for raw Tailwind utility
  classes (`grid`, `flex`, `gap-*`, etc.) outside the design-system
  semantic classes imported via `@unveiled/design-system/styles/global.css`
- **AND** the gate fails with the offending file path if any raw
  utility class is found outside the design-system semantic classes.

#### Scenario: Atomic layers enforce the import direction

- **WHEN** `bun run check:atomic-layers` runs
- **THEN** atoms import only from `./lib/*`, `react`/`react-dom`,
  `@nextui-org/react` / `@heroui/*`, and the design-token CSS
- **AND** molecules / organisms / layouts / pages import only from
  atoms / molecules / lib and never from `@nextui-org/react`,
  `@heroui/*`, or any other `@nextui-org/*` package directly
- **AND** the gate fails with the offending file path if the import
  direction is violated.

#### Scenario: AGENTS.md documents the boundary as a hard rule

- **WHEN** a new contributor reads `AGENTS.md` end to end
- **THEN** §2 (tech stack) calls out atomic-design layering,
  HeroUI as a private dependency of the design system, and the gate
  scripts that enforce the boundary
- **AND** §3 (file layout) shows the layered design-system directory
  tree (atoms, molecules, organisms, layouts, pages, providers,
  lib, styles, heroui-replica)
- **AND** §4 (conventions) forbids raw Tailwind utility classes in
  `app/` and `landing/` outside the design-system semantic classes
- **AND** §7 (toolchain commands) lists `bun run check:atomic-layers`
  and `bun run check:styling-ownership` as gate scripts
- **AND** §8 (definition of done) requires a Ladle page for every
  UI change in `app/` or `landing/`
- **AND** §9 (what NOT to do) treats the design-system boundary as a
  hard rule.

#### Scenario: `docs/architecture.md` documents the boundary

- **WHEN** a contributor opens `docs/architecture.md`
- **THEN** the doc contains a "Design system boundary" section
  covering the layer hierarchy, the presentational / container split,
  the CSS ownership rule, the Ladle demo obligation, and the
  gate-script enforcement
- **AND** the doc points at `AGENTS.md` and at the LikeC4 model under
  `architecture/` instead of embedding a hand-edited Mermaid diagram.

#### Scenario: LikeC4 model includes the design system as a first-party container

- **WHEN** `bun run arch:check` and `bun run arch:drift` run
- **THEN** the model under `architecture/` declares a
  `designSystem` container inside `unveiled` with `metadata.path`
  anchored under `packages/design-system`
- **AND** `designSystem` has components for `atoms`, `molecules`,
  `organisms`, `templates`, and `pages`, each with `metadata.path`
  anchored under `packages/design-system/src/<layer>/` (or omitted
  if the layer directory does not yet exist)
- **AND** `heroui` is declared as an external library element with
  `technology = "@nextui-org/react"` and is connected to `atoms`
  and `molecules` with `uses` relationships
- **AND** the `app` and `landing` containers declare explicit `uses`
  relationships to `designSystem`
- **AND** every `metadata.path` value is anchored under one of the
  live workspace roots (`packages/api`, `packages/app`,
  `packages/landing`, `packages/orchestrator`,
  `packages/design-system`) so the drift check stays green.

### Requirement: Organisms compose atoms and molecules only

The design system MUST organise its organism layer under
`packages/design-system/src/organisms/`, with one domain-organised
subfolder per product surface (`_shared`, `shell`, `auth`,
`discovery`, `members`, `bookings`, `admin`, `partner-portal`,
`payments`, `landing`). Every organism in this layer MUST compose
atoms and/or molecules only — no file under `organisms/**` may import
from `@nextui-org/react`, `@heroui/*`, `@nextui-org/*`, or any other
`@nextui-org/*` package directly. The rule is enforced by the
`check-atomic-layers` gate.

A file under `organisms/<domain>/` MAY import only from:
`../../atoms/...`, `../../molecules/...`, `../../lib/...`,
`react`/`react-dom`/framework primitives, and
`../../styles/generated/tokens.css`. A file under `organisms/<domain>/`
MUST NOT import from `@nextui-org/react`, `@heroui/*`,
`lucide-react`, or any other third-party UI library, and MUST NOT
import across domain boundaries; cross-domain pieces live under
`organisms/_shared/`.

#### Scenario: Organisms do not import HeroUI directly

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/organisms/**/*.tsx`
- **THEN** no file contains `from "@nextui-org/react"`,
  `from "@nextui-org/..."`, or `from "@heroui/..."`.
- **AND** the gate fails with the offending file path if any organism
  imports HeroUI directly. Organisms that need a HeroUI primitive that
  no atom exposes MUST grow a new atom first; this rule is deliberate
  and not relaxed in any proposal.

#### Scenario: Organisms do not import across domain boundaries

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/organisms/<domain>/**/*.tsx`
- **THEN** no file contains `from "../../<other-domain>/...` where
  `<other-domain>` is a sibling of the current `<domain>`.
- **AND** the gate fails with the offending file path if any organism
  imports across domain boundaries.
- **AND** cross-domain pieces (e.g. `EmptyState`, `LoadingSkeleton`,
  `PageHeader`, `PageShell`) live under `organisms/_shared/` and are
  imported as `from "../../_shared/<piece>/..."` from any domain.

### Requirement: Every organism has a Ladle story fed by a mock fixture

The design system SHALL ship every organism folder under
`packages/design-system/src/organisms/<domain>/<organism>/` with a
co-located presentational file (`<organism>.tsx`), a prop-types file
(`<organism>.types.ts` when prop types are non-trivial), a mock fixture
(`<organism>.mock.ts`) with a `makeMock<Organism>Props()` helper, and
a Ladle story (`<organism>.ladle.tsx`) that mounts the presentational
piece with the mock fixture's defaults and exercises at least one
variant (loading, error, empty, or interactive variant). The rule is
enforced by the `check-atomic-layers` gate. Stories for browser-only
organisms (e.g. `DiscoveryMap`, which imports Leaflet) MUST declare
`parameters: { chromatic: { disable: true }, serverSide: false }` so
Ladle does not attempt to render them server-side.

#### Scenario: Each organism folder has the four required files

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/organisms/<domain>/<organism>/`
- **THEN** the folder contains `<organism>.tsx`,
  `<organism>.types.ts` (if prop types are non-trivial),
  `<organism>.mock.ts`, and `<organism>.ladle.tsx`.
- **AND** the gate fails with the offending folder path if any of the
  four files is missing.

#### Scenario: Each Ladle story has a default and at least one variant

- **WHEN** `bun ladle` boots and Ladle walks the design-system stories
- **THEN** every
  `packages/design-system/src/organisms/<domain>/<organism>/<organism>.ladle.tsx`
  is discoverable
- **AND** the story group for the organism lists at least one `Default`
  story and at least one variant story that exercises a non-trivial prop
  (loading, error, empty, or interactive state).

#### Scenario: Organisms / Overview story exists

- **WHEN** `bun ladle` boots
- **THEN** the `Organisms / Overview` group renders
  `packages/design-system/src/organisms/__overview__/overview.ladle.tsx`,
  which mounts one instance of every organism (across all domain
  folders) with mock data, parallel to the existing `Atoms / Overview`
  and `Molecules / Overview` groups.

### Requirement: Presentational organisms split from data-wired containers

The design system MUST split each organism that has any of the
following — `useMutation`, `useQuery`, `useEffect`, `fetch`,
`authClient`, server actions, Stripe calls, or any other data-layer
side effect — into:

- a **presentational** component in
  `packages/design-system/src/organisms/<domain>/<organism>/<organism>.tsx`
  that takes its inputs as props and has no data-layer dependencies,
  exported under the name `<Organism>Presentational`;
- a **container** component in the app/landing package (typically
  `packages/app/src/components/unveiled/<path>/<organism>.tsx` or
  `packages/landing/src/components/landing/<organism>.tsx`) that
  imports the presentational piece, wires the data hooks, and
  re-exports it under the original component name so every existing
  call site continues to compile.

The presentational piece MUST export its props type from
`<organism>.types.ts`, and the container MUST import the same type so
the type-checker catches prop-surface drift between the two halves.

#### Scenario: Presentational piece has no data hooks

- **WHEN** `packages/design-system/src/organisms/<domain>/<organism>/<organism>.tsx`
  is inspected
- **THEN** the file does NOT contain `useMutation`, `useQuery`,
  `useEffect`, `fetch(`, `authClient`, or any import from
  `@/lib/data-access/`, `@/lib/auth-client`, `@/lib/stripe`, or any
  other data-layer module.
- **AND** `bun run check:atomic-layers` fails with the offending file
  path if the presentational piece reaches into a data layer.

#### Scenario: Container re-exports the presentational piece under the original name

- **WHEN** `packages/app/src/components/unveiled/auth/LoginForm.tsx` (or
  any other container) is read after this change lands
- **THEN** the file imports `LoginFormPresentational` from
  `@unveiled/design-system` (or from the `Organisms` namespace) and
  re-exports it as `LoginForm` so every existing call site
  (`<LoginForm />`, `import { LoginForm } from ...`, etc.) compiles
  without change.
- **AND** the container is the only place where the data hooks are
  wired.

