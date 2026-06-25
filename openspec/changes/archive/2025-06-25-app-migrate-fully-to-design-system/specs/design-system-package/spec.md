## MODIFIED Requirements

### Requirement: `@unveiled/design-system` exposes the production UI primitives

The package's main entry (`packages/design-system/src/index.ts`) MUST re-export every production primitive that previously lived under `src/components/ui/` (`Button`, `Card`, `StatPanel`, `Divider`, `StatePanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`, `Notification`, `Skeleton`, `UnveiledPrimitives`), preserving their public prop surface and HeroUI-backed implementation.

The TextInput primitive MUST render the design-system 4px solid `unveiled-brand-dark` border defined by `design-tokens.json:258-272`. It MUST use HeroUI `variant="flat"` and the `inputWrapper` className MUST apply the `unveiled-text-input-wrapper` class (defined in `packages/design-system/src/styles/atom-chrome.css`). The chrome CSS MUST set `border: 4px solid #202621 !important`, `border-style: solid !important`, and `border-color: #202621 !important` on that class (all three of border width, border style, and border color are required for the border to render).

The package MUST NOT re-export the following primitives in this version: `Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`, and the `Button.asChild` API. They are removed under iteration-13 proposal 02 (atoms layer); their replacements are documented in the "Removed components and their HeroUI / plain-element replacements" requirement below. After this change lands, `packages/design-system/src/_legacy.tsx` and `packages/design-system/src/unveiled-primitives.tsx` MUST be deleted from the source tree, and no other file (inside or outside the package) MAY re-export the removed names. The six single-file atoms / molecules that proposals 02 and 03 moved into the `atoms/` and `molecules/` folders (`packages/design-system/src/button.tsx`, `packages/design-system/src/drawer.tsx`, `packages/design-system/src/menu.tsx`, `packages/design-system/src/modal.tsx`, `packages/design-system/src/tabs.tsx`, `packages/design-system/src/toast.tsx`) MUST also be deleted from the source tree; their content lives in the `atoms/` and `molecules/` folders and is the only source of truth.

The `StatePanel` molecule (which used to compose the removed `Panel` atom) MUST be rewritten to compose the `Card` atom instead. Its public prop surface is reduced to the props `Card` actually accepts; the removed `tone` and `shadow` props are dropped. Existing call sites that passed `tone` / `shadow` MUST be migrated as part of proposal 07 (app) and proposal 08 (landing); neither package ships with a `StatePanel tone="…"` call site after this change lands.

In addition to the flat re-export of every atom and the `Atoms` namespace export introduced in proposal 02, the package barrel MUST also re-export every molecule (`Field`, `StatePanel`, `StatPanel`, `SelectInput`, `Toast`, `Drawer`, `Modal`, `Menu`/`MenuTrigger`/`MenuContent`/`MenuItem`/`MenuSection`) as a `Molecules` namespace export (`export { Molecules } from "./molecules"`). The flat re-exports of the molecules that proposal 07 (app migration) and proposal 08 (landing migration) previously relied on are removed from the barrel at the same time `_legacy.tsx` is deleted.

The package barrel MUST also re-export the `cn` helper from `./lib/utils` and the `StatusColor` type from `./lib/design-tokens`. The `cn` re-export is the canonical public entry point; consumers MUST import `cn` from `@unveiled/design-system`, never from `@unveiled/design-system/lib/utils`.

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

## ADDED Requirements

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
