## MODIFIED Requirements

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

## ADDED Requirements

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

## REMOVED Requirements

> The previous version of this proposal introduced an `Icon` molecule as a documented extreme case. The strict reading of the iteration-13 prompt rejects this: HeroUI 2.x has no `Icon` primitive, and the design system does not ship non-HeroUI components. App/landing consumers inline `<svg>` directly with a `// source: lucide-static` (or `// source: lucide-react`) comment for licence traceability; proposals 07 (app) and 08 (landing) own the full inline-`<svg>` convention. No prior version of the `design-system-package` capability spec actually committed an `Icon` molecule requirement, so there is nothing to remove from the live spec; this note is included for completeness so a future contributor who finds the `Icon` molecule language in an older draft or design doc does not reintroduce it.
