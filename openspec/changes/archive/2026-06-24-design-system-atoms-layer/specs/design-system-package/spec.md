## MODIFIED Requirements

### Requirement: `@unveiled/design-system` exposes the production UI primitives

The package's main entry (`packages/design-system/src/index.ts`) MUST re-export every production primitive that previously lived under `src/components/ui/` (`Button`, `Card`, `StatPanel`, `Divider`, `StatePanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`, `Notification`, `Skeleton`, `UnveiledPrimitives`), preserving their public prop surface and HeroUI-backed implementation.

The TextInput primitive MUST render the design-system 4px solid `unveiled-brand-dark` border defined by `design-tokens.json:258-272`. It MUST use HeroUI `variant="flat"` and its `inputWrapper` className MUST include all three of `!border-4`, `!border-solid`, and `!border-brand-dark` (border width, border style, and border color — all three are required for the border to render).

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
- **AND** the `inputWrapper` className contains `!border-4`, `!border-solid`, and `!border-brand-dark` (in that order or any order — all three required)
- **AND** the rendered DOM in any consumer (e.g. `packages/app/src/components/unveiled/auth/LoginForm.tsx`) shows a visible 4px solid `unveiled-brand-dark` border around the input.

#### Scenario: SelectInput and TextArea retain HeroUI bordered variant

- **WHEN** `packages/design-system/src/unveiled-primitives.tsx` (or the future `packages/design-system/src/molecules/select-input/select-input.tsx` once proposal 03 lands) is inspected at the `SelectInput` and `TextArea` definitions
- **THEN** both continue to use HeroUI `variant="bordered"` and do NOT carry the `!border-4 !border-solid !border-brand-dark` triple (HeroUI renders their borders natively).

#### Scenario: Removed primitives are not re-exported from atoms

- **WHEN** a downstream package imports `Badge`, `Panel`, `TableShell`, `TableRow`, or `SafeImage` from `@unveiled/design-system` once proposals 07 and 08 have landed
- **THEN** the build fails with "no exported member" because none of those names are re-exported from the package barrel.
- **WHEN** a downstream package imports `Button` with an `asChild` prop
- **THEN** TypeScript fails with "unknown prop 'asChild'" because the prop is removed from the `Button` atom.

## ADDED Requirements

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

#### Scenario: Each atom has a Ladle story

- **WHEN** `bun ladle` boots and Ladle walks the design-system stories
- **THEN** every `packages/design-system/src/atoms/<atom>/<atom>.ladle.tsx` is discoverable, and the story group for the atom lists at least one default story and at least one variant story that exercises a `tone`, `variant`, or `size` prop.
- **AND** the `Atoms / Overview` group renders `packages/design-system/src/atoms/__overview__/overview.ladle.tsx`, which mounts one instance of every atom with mock data.

#### Scenario: Companion file is required for every atom

- **WHEN** the gate walks `packages/design-system/src/atoms/<atom>/`
- **THEN** each `<atom>.tsx` has either a sibling `<atom>.ladle.tsx` or a sibling `<atom>.test.tsx` (or both). An atom with neither companion fails the gate.

#### Scenario: Ladle coverage script still passes

- **WHEN** `bun run ladle:coverage` runs after the new atom stories are added
- **THEN** the script reports no drift: every atom story has a matching `@ladle(component=…, story=…)` reference or an explicit opt-out annotation.
