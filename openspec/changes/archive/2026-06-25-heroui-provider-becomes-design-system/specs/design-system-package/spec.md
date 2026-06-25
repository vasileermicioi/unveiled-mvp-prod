## MODIFIED Requirements

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

## ADDED Requirements

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
