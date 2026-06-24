## MODIFIED Requirements

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

- **WHEN** `packages/design-system/src/unveiled-primitives.tsx` (or the future `packages/design-system/src/molecules/select-input/select-input.tsx` once proposal 03 lands) is inspected at the `SelectInput` and `TextArea` definitions
- **THEN** both continue to use HeroUI `variant="bordered"` and do NOT carry the `unveiled-text-input-wrapper` chrome (HeroUI renders their borders natively via its own `bordered` variant).

#### Scenario: Removed primitives are not re-exported from atoms

- **WHEN** a downstream package imports `Badge`, `Panel`, `TableShell`, `TableRow`, or `SafeImage` from `@unveiled/design-system` once proposals 07 and 08 have landed
- **THEN** the build fails with "no exported member" because none of those names are re-exported from the package barrel.
- **WHEN** a downstream package imports `Button` with an `asChild` prop
- **THEN** TypeScript fails with "unknown prop 'asChild'" because the prop is removed from the `Button` atom.

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

## ADDED Requirements

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
