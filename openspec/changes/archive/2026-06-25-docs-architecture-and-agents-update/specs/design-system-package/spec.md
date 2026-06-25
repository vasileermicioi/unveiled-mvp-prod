## ADDED Requirements

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