## ADDED Requirements

### Requirement: Organisms compose atoms and molecules only

The design system MUST organise its organism layer under `packages/design-system/src/organisms/`, with one domain-organised subfolder per product surface (`_shared`, `shell`, `auth`, `discovery`, `members`, `bookings`, `admin`, `partner-portal`, `payments`, `landing`). Every organism in this layer MUST compose atoms and/or molecules only — no file under `organisms/**` may import from `@nextui-org/react`, `@heroui/*`, `@nextui-org/*`, or any other `@nextui-org/*` package directly. The rule is enforced by `R-ORGANISMS-NO-HEROUI` in `check-atomic-layers.ts` and is the first live consumer of the forward-looking rule laid down in proposal 03.

A file under `organisms/<domain>/` MAY import only from:

- `../../atoms/...` (the production atoms laid down in proposal 02),
- `../../molecules/...` (the production molecules laid down in proposal 03),
- `../../lib/...` (shared design-system utilities such as `cn` and `StatusColor`),
- `react`, `react-dom`, and other framework primitives,
- `../../styles/generated/tokens.css` (the design-token CSS).

A file under `organisms/<domain>/` MUST NOT import from:

- `@nextui-org/react`, `@heroui/*`, or any other `@nextui-org/*` package (`R-ORGANISMS-NO-HEROUI`),
- `lucide-react`, `react-icons`, or any other third-party icon package (`R-ORGANISMS-NO-LUCIDE`),
- `lucide-react` or any other third-party UI library anywhere in the design system,
- `./<other-domain>/...` — cross-domain coupling is forbidden; if two domains share a chunk, that chunk moves to `organisms/_shared/` (`R-ORGANISMS-NO-CROSS-DOMAIN`).

#### Scenario: Organisms do not import HeroUI directly

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/organisms/**/*.tsx`
- **THEN** no file contains `from "@nextui-org/react"`, `from "@nextui-org/..."`, or `from "@heroui/..."`.
- **AND** the gate fails with the offending file path if any organism imports HeroUI directly. Organisms that need a HeroUI primitive that no atom exposes MUST grow a new atom first; this rule is deliberate and not relaxed in any proposal.

#### Scenario: Organisms do not import lucide-react

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/organisms/**/*.tsx` (and `packages/design-system/src/**` more broadly)
- **THEN** no file imports from `lucide-react`. The design system has no `Icon` molecule; app/landing consumers inline `<svg>` directly with a `// source: lucide-static` comment for licence traceability (proposal 03).

#### Scenario: Organisms do not import across domain boundaries

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/organisms/<domain>/**/*.tsx`
- **THEN** no file contains `from "../../<other-domain>/...` where `<other-domain>` is a sibling of the current `<domain>`.
- **AND** the gate fails with the offending file path if any organism imports across domain boundaries.
- **AND** cross-domain pieces (e.g. `EmptyState`, `LoadingSkeleton`, `PageHeader`, `PageShell`) live under `organisms/_shared/` and are imported as `from "../../_shared/<piece>/..."` from any domain.

#### Scenario: Organisms may import from lower layers

- **WHEN** a file under `packages/design-system/src/organisms/` imports a component from `./atoms/...`, `./molecules/...`, `./lib/...`, or `./_shared/...`
- **THEN** the gate passes — organisms are allowed to import from any lower layer.
- **AND** the gate fails if the file imports from a sibling organism's internals (the organism's barrel re-export is the only allowed entry point, mirroring the atom-molecule rule).

### Requirement: Every organism has a Ladle story fed by a mock fixture

Every organism folder under `packages/design-system/src/organisms/<domain>/<organism>/` MUST ship a co-located presentational file (`<organism>.tsx`), a prop-types file (`<organism>.types.ts` when prop types are non-trivial), a mock fixture (`<organism>.mock.ts`) with a `makeMock<Organism>Props()` helper, and a Ladle story (`<organism>.ladle.tsx`) that mounts the presentational piece with the mock fixture's defaults and exercises at least one variant (loading, error, empty, or interactive variant). The rule is enforced by `R-ORGANISMS-HAS-STORY` in `check-atomic-layers.ts`.

The story MUST declare its variants with named exports (e.g. `export const Default = ...`, `export const Loading = ...`, `export const Error = ...`) so `bun run ladle:coverage` can match the story against any `@ladle(component=…, story=…)` gherkin tag that references it. Stories for browser-only organisms (e.g. `DiscoveryMap`, which imports Leaflet) MUST declare `parameters: { chromatic: { disable: true }, serverSide: false }` so Ladle does not attempt to render them server-side.

#### Scenario: Each organism folder has the four required files

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/organisms/<domain>/<organism>/`
- **THEN** the folder contains `<organism>.tsx`, `<organism>.types.ts` (if prop types are non-trivial), `<organism>.mock.ts`, and `<organism>.ladle.tsx`.
- **AND** the gate fails with the offending folder path if any of the four files is missing.

#### Scenario: Each Ladle story has a default and at least one variant

- **WHEN** `bun ladle` boots and Ladle walks the design-system stories
- **THEN** every `packages/design-system/src/organisms/<domain>/<organism>/<organism>.ladle.tsx` is discoverable
- **AND** the story group for the organism lists at least one `Default` story and at least one variant story that exercises a non-trivial prop (loading, error, empty, or interactive state).

#### Scenario: Organisms / Overview story exists

- **WHEN** `bun ladle` boots
- **THEN** the `Organisms / Overview` group renders `packages/design-system/src/organisms/__overview__/overview.ladle.tsx`, which mounts one instance of every organism (across all domain folders) with mock data, parallel to the existing `Atoms / Overview` and `Molecules / Overview` groups.

#### Scenario: Browser-only organisms opt out of SSR

- **WHEN** `packages/design-system/src/organisms/discovery/discovery-map/discovery-map.ladle.tsx` is rendered
- **THEN** the story declares `parameters: { chromatic: { disable: true }, serverSide: false }` so Ladle does not attempt to render the Leaflet-backed map server-side.
- **AND** the `R-ORGANISMS-HAS-STORY` gate accepts the story as compliant even though it cannot be rendered headlessly.

#### Scenario: Mock fixture type matches the props type

- **WHEN** `packages/design-system/src/organisms/auth/login-form/login-form.mock.ts` exports `makeMockLoginFormProps(...)` and `packages/design-system/src/organisms/auth/login-form/login-form.types.ts` exports `LoginFormProps`
- **THEN** the return type of `makeMockLoginFormProps()` IS `LoginFormProps` (or `Partial<LoginFormProps>` with sensible defaults).
- **AND** `bun run --filter @unveiled/design-system typecheck` fails if the mock fixture's return type drifts from the props type.

#### Scenario: Ladle coverage script still passes

- **WHEN** `bun run ladle:coverage` runs after the new organism stories are added
- **THEN** the script reports no drift: every organism story has a matching `@ladle(component=…, story=…)` reference or an explicit opt-out annotation.

### Requirement: Presentational organisms split from data-wired containers

Each organism that has any of the following — `useMutation`, `useQuery`, `useEffect`, `fetch`, `authClient`, server actions, Stripe calls, or any other data-layer side effect — MUST be split into:

- a **presentational** component in `packages/design-system/src/organisms/<domain>/<organism>/<organism>.tsx` that takes its inputs as props and has no data-layer dependencies, exported under the name `<Organism>Presentational`;
- a **container** component in the app/landing package (typically `packages/app/src/components/unveiled/<path>/<organism>.tsx` or `packages/landing/src/components/landing/<organism>.tsx`) that imports the presentational piece, wires the data hooks, and re-exports it under the original component name so every existing call site continues to compile.

The presentational piece MUST export its props type from `<organism>.types.ts`, and the container MUST import the same type so the type-checker catches prop-surface drift between the two halves.

#### Scenario: Presentational piece has no data hooks

- **WHEN** `packages/design-system/src/organisms/<domain>/<organism>/<organism>.tsx` is inspected
- **THEN** the file does NOT contain `useMutation`, `useQuery`, `useEffect`, `fetch(`, `authClient`, or any import from `@/lib/data-access/`, `@/lib/auth-client`, `@/lib/stripe`, or any other data-layer module.
- **AND** `bun run check:atomic-layers` fails with the offending file path if the presentational piece reaches into a data layer.

#### Scenario: Container re-exports the presentational piece under the original name

- **WHEN** `packages/app/src/components/unveiled/auth/LoginForm.tsx` (or any other container) is read after this change lands
- **THEN** the file imports `LoginFormPresentational` from `@unveiled/design-system` (or from the `Organisms` namespace) and re-exports it as `LoginForm` so every existing call site (`<LoginForm />`, `import { LoginForm } from ...`, etc.) compiles without change.
- **AND** the container is the only place where the data hooks are wired.

#### Scenario: Prop type is shared between container and presentational

- **WHEN** the design-system exports `export type { LoginFormProps } from "./login-form.types"` and the container imports `import { LoginFormPresentational, type LoginFormProps } from "@unveiled/design-system"`
- **THEN** `bun run typecheck:workspaces` fails if the container passes a prop the presentational piece no longer accepts, or vice versa.

## MODIFIED Requirements

### Requirement: Organisms, layouts, and pages compose atoms, not HeroUI directly

The `organisms/`, `layouts/`, and `pages/` layers MUST share the same "compose atoms, not HeroUI" contract as the molecules layer. No file under `packages/design-system/src/{organisms,layouts,pages}/**` may import from `@nextui-org/react`, `@heroui/*`, or any other `@nextui-org/*` package directly. Files in these layers MAY import from `./atoms/...`, `./molecules/...`, `./lib/...`, and other higher layers (organisms may import from molecules and other organisms; layouts and pages may import from any lower layer). Files in these layers MUST NOT import from `lucide-react` or any other third-party UI library.

This rule is now active for real organisms in the `organisms/` layer (proposal 04 adds the first consumers); it remains forward-looking for the `layouts/` and `pages/` layers, which proposal 05 introduces.

#### Scenario: Higher layers do not import HeroUI directly

- **WHEN** `bun run check:atomic-layers` walks `packages/design-system/src/{organisms,layouts,pages}/**/*.tsx`
- **THEN** no file contains `from "@nextui-org/react"`, `from "@nextui-org/..."`, or `from "@heroui/..."`.
- **AND** the gate fails with the offending file path if any organism, layout, or page imports HeroUI directly.

#### Scenario: Higher layers may import from lower layers

- **WHEN** a file under `packages/design-system/src/organisms/` imports a component from `./molecules/...` or `./atoms/...`
- **THEN** the gate passes — organisms, layouts, and pages are allowed to import from any lower layer.
- **AND** the gate fails if the file imports from a sibling organism's internals (the organism's barrel re-export is the only allowed entry point, mirroring the atom-molecule rule).
- **AND** the gate fails if the file imports from a sibling organism's domain folder (`./<other-domain>/...`) — cross-domain pieces live in `_shared/`.

### Requirement: `@unveiled/design-system` exposes the production UI primitives

The package's main entry (`packages/design-system/src/index.ts`) MUST re-export every production primitive that previously lived under `src/components/ui/` (`Button`, `Card`, `StatPanel`, `Divider`, `StatePanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`, `Notification`, `Skeleton`, `UnveiledPrimitives`), preserving their public prop surface and HeroUI-backed implementation.

The TextInput primitive MUST render the design-system 4px solid `unveiled-brand-dark` border defined by `design-tokens.json:258-272`. It MUST use HeroUI `variant="flat"` and the `inputWrapper` className MUST apply the `unveiled-text-input-wrapper` class (defined in `packages/design-system/src/styles/atom-chrome.css`). The chrome CSS MUST set `border: 4px solid #202621 !important`, `border-style: solid !important`, and `border-color: #202621 !important` on that class (all three of border width, border style, and border color are required for the border to render).

The package MUST NOT re-export the following primitives in this version: `Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`, and the `Button.asChild` API. They are removed under iteration-13 proposal 02 (atoms layer); their replacements are documented in the "Removed components and their HeroUI / plain-element replacements" requirement below. During the migration window, the removed names are re-exported from `packages/design-system/src/_legacy.tsx` so consumers keep compiling; proposals 07 (app) and 08 (landing) delete the shim and replace every call site.

In addition to the flat re-export of every atom, the `Atoms` namespace export introduced in proposal 02, and the `Molecules` namespace export introduced in proposal 03, the package barrel MUST also re-export every presentational organism (`AppShellPresentational`, `ShellLogoPresentational`, `ShellIconButtonPresentational`, `ShellMobileDrawerPresentational`, `LoginFormPresentational`, `SignupFormPresentational`, `PasswordRecoveryFormPresentational`, `LogoutFlowPresentational`, `BetterAuthErrorMessagesLocalizedPresentational`, `PublicDiscoverPresentational`, `PublicDiscoverHeaderPresentational`, `PublicDiscoverLayoutPresentational`, `PublicDiscoverCardPresentational`, `DiscoveryFilterPanelPresentational`, `DiscoveryMapPresentational`, `MemberFeedPresentational`, `MemberFeedHeaderPresentational`, `MemberFeedListPresentational`, `MemberFeedItemPresentational`, `MemberFeedEmptyPresentational`, `MemberFeedErrorPresentational`, `BookingModalPresentational`, `BookingModalHeaderPresentational`, `BookingModalSummaryPresentational`, `BookingModalFormPresentational`, `BookingModalActionsPresentational`, `AdminPanelPresentational`, `AdminPanelHeaderPresentational`, `AdminPanelSectionPresentational`, `AdminPanelMetricGridPresentational`, `AdminPanelStatGridPresentational`, `AdminPanelActionListPresentational`, `PartnerPortalPresentational`, `PartnerPortalHeaderPresentational`, `PartnerPortalStatsPresentational`, `PartnerPortalListPresentational`, `AdminFreezeUnfreezeFormPresentational`, `CreditLedgerTablePresentational`, `StripeCheckoutRedirectButtonPresentational`, `SubscriptionPortalLinkPresentational`, `LandingHeaderPresentational`, `LandingHeroPresentational`, `LandingFooterPresentational`) as both a flat re-export (temporary, removed in proposal 07/08) AND an `Organisms` namespace export (`export { Organisms } from "./organisms"`).

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

#### Scenario: Organisms are re-exported from the barrel

- **WHEN** a downstream package imports a presentational organism (`LoginFormPresentational`, `AdminPanelPresentational`, `MemberFeedPresentational`, `BookingModalPresentational`, `PublicDiscoverPresentational`, `LandingHeaderPresentational`, etc.) from `@unveiled/design-system`
- **THEN** the import resolves to a module under `packages/design-system/src/organisms/<domain>/<organism>/<organism>.tsx` that composes atoms and molecules only (no direct HeroUI import).
- **AND** the public prop surface (`email`, `password`, `error`, `isSubmitting`, `onEmailChange`, `onPasswordChange`, `onSubmit`, etc.) is preserved exactly for the surviving organisms.

#### Scenario: Organisms namespace is reachable

- **WHEN** a downstream package writes `import { Organisms } from "@unveiled/design-system"; Organisms.LoginFormPresentational`
- **THEN** the namespace resolves via the design-system's `Organisms` namespace export, parallel to the existing `Atoms` and `Molecules` namespace exports.

#### Scenario: Removed primitives are not re-exported from atoms

- **WHEN** a downstream package imports `Badge`, `Panel`, `TableShell`, `TableRow`, or `SafeImage` from `@unveiled/design-system` once proposals 07 and 08 have landed
- **THEN** the build fails with "no exported member" because none of those names are re-exported from the package barrel.
- **WHEN** a downstream package imports `Button` with an `asChild` prop
- **THEN** TypeScript fails with "unknown prop 'asChild'" because the prop is removed from the `Button` atom.