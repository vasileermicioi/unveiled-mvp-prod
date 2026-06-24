## Why

The app and landing packages currently carry the entire organism layer
inline: `packages/app/src/components/unveiled/{app-shell,AdminPanel,MemberFeed,PublicDiscover,PartnerPortal,BookingModal,DiscoveryFilterPanel,DiscoveryMap}.tsx` and `packages/landing/src/components/landing/{landing-header,landing-hero,landing-footer}.tsx`. These components are organism-level UI — they compose molecules into recognisable, self-contained sections — but they live outside the design system, import HeroUI indirectly, and have no Ladle story. They cannot be viewed without spinning the app or landing dev servers, and the design system has no organism layer to enforce the "compose atoms, not HeroUI" contract at the highest composition tier.

This proposal creates `packages/design-system/src/organisms/`, organised by product surface (`_shared`, `shell`, `auth`, `discovery`, `members`, `bookings`, `admin`, `partner-portal`, `payments`, `landing`), and moves every organism-shaped piece of UI there. Each organism is split into a presentational half (props-only, no data hooks) that lives in the design system and a thin container half that stays in the app/landing package and wires the hooks. Every presentational organism gets a Ladle story and a mock fixture so every form/section can be viewed without the app server.

This proposal is NOT about migrating the data hooks (TanStack Query, Better Auth, Stripe), which stay where they are — proposal 07 owns the consumer-side rewiring and proposal 05 owns layouts/pages.

## What Changes

- Create `packages/design-system/src/organisms/` with domain-organised
  subfolders: `_shared/`, `shell/`, `auth/`, `discovery/`, `members/`,
  `bookings/`, `admin/`, `partner-portal/`, `payments/`, `landing/`.
- For each organism listed in the table below: move the source file
  into `packages/design-system/src/organisms/<domain>/<organism>/`,
  split it into `<Organism>Presentational` (props-only) +
  `<organism>.types.ts` + `<organism>.mock.ts` + `<organism>.ladle.tsx`.
  The container stays in the app/landing package and re-exports the
  presentational piece under the original name so call sites do not
  break.
- Move `list-skeleton.tsx` and the shared context primitives
  (`EmptyState`, `LoadingSkeleton`, etc.) into `organisms/_shared/`.
- Add Ladle stories for every organism with at least a `Default`
  story and one variant story that exercises a non-trivial prop
  (loading state, error state, empty state, or interactive variant).
- Extend `packages/design-system/scripts/check-atomic-layers.ts` with:
  - `R-ORGANISMS-NO-HEROUI` (already laid down by proposal 03; this
    change adds the first real consumers — no `@nextui-org/*` /
    `@heroui/*` import anywhere in `organisms/`).
  - `R-ORGANISMS-NO-LUCIDE` (no `lucide-react` anywhere in the design
    system; consumer-side icons inline `<svg>` with a
    `// source: lucide-static` comment per proposal 03).
  - `R-ORGANISMS-NO-CROSS-DOMAIN` (no
    `import .* from .*organisms/<other-domain>/`; cross-domain pieces
    live in `_shared/`).
  - `R-ORGANISMS-HAS-STORY` (every organism has either a
    `<organism>.ladle.tsx` or `<organism>.test.tsx`).
- Update `packages/design-system/src/index.ts` to add an `Organisms`
  namespace export and re-export every presentational organism under
  its `<Organism>Presentational` name (the app containers import the
  presentational piece via the namespace).
- Wire the new gate rules into `bun run check:atomic-layers` and the
  `tests/unit/atomic-layers.test.ts` permanent unit test.
- App-side wiring: the `use client` container in
  `packages/app/src/components/unveiled/auth/LoginForm.tsx` (and
  every other auth/discovery/members/bookings/admin/partner-portal
  container) imports `<X>Presentational` from
  `@unveiled/design-system` and feeds it the data hooks' outputs.
  Container signature (props, default export) is unchanged so every
  existing call site compiles.
- Landing-side wiring: `landing-header`, `landing-hero`,
  `landing-footer` are re-exported from `@unveiled/design-system`
  and the landing consumes them through the barrel.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-package`: MODIFIED.
  - **ADDED** requirement `Organisms compose atoms and molecules
    only`. Enforced by `R-ORGANISMS-NO-HEROUI`,
    `R-ORGANISMS-NO-LUCIDE`, and `R-ORGANISMS-NO-CROSS-DOMAIN`. No
    file under `organisms/` may import from `@nextui-org/react`,
    `@heroui/*`, `lucide-react`, or a sibling domain's internals.
    Cross-domain pieces live in `organisms/_shared/`.
  - **ADDED** requirement `Every organism has a Ladle story fed by a
    mock fixture`. Every `<organism>/` folder ships a
    `<organism>.tsx`, a `<organism>.types.ts` (when prop types are
    non-trivial), a `<organism>.mock.ts`, and a
    `<organism>.ladle.tsx`. The story mounts the presentational piece
    with the mock fixture's defaults. Enforced by
    `R-ORGANISMS-HAS-STORY`.
  - **MODIFIED** requirement `Organisms, layouts, and pages compose
    atoms, not HeroUI directly`: the rule is now active for real
    organisms, not just forward-looking. The `R-ORGANISMS-NO-HEROUI`
    gate walks the actual files.
  - **MODIFIED** requirement `@unveiled/design-system` exposes the
    production UI primitives: the barrel adds an `Organisms`
    namespace export parallel to `Atoms` and `Molecules`. The
    presentational organisms are re-exported both as flat
    `<Organism>Presentational` named exports (so containers can
    import them by name) AND under the `Organisms` namespace.

## Impact

- Source: 13 organism files move from `packages/app/src/components/unveiled/`
  (and 3 from `packages/landing/src/components/landing/`) into
  `packages/design-system/src/organisms/<domain>/<organism>/`. Each
  destination folder gets `<organism>.tsx`,
  `<organism>.types.ts`, `<organism>.mock.ts`, `<organism>.ladle.tsx`.
- Tooling: `packages/design-system/scripts/check-atomic-layers.ts`
  is extended with `R-ORGANISMS-NO-HEROUI`,
  `R-ORGANISMS-NO-LUCIDE`, `R-ORGANISMS-NO-CROSS-DOMAIN`,
  `R-ORGANISMS-HAS-STORY`. `tests/unit/atomic-layers.test.ts` is
  updated to assert the new rules pass and that every organism has
  a companion story.
- Call sites: every consumer in `packages/app/src/**` and
  `packages/landing/src/**` continues to compile and run because
  the container keeps the original component name and re-exports the
  presentational piece. Proposals 07 (app) and 08 (landing) own the
  consumer migration to the `Organisms` namespace.
- Ladle: ~16 new organism stories appear under the `Organisms` group,
  grouped by domain (`Organisms / Shell`, `Organisms / Auth`,
  `Organisms / Discovery`, `Organisms / Members`, `Organisms / Bookings`,
  `Organisms / Admin`, `Organisms / Partner Portal`, `Organisms / Payments`,
  `Organisms / Landing`). `bun run ladle:coverage` must still pass.
- DiscoveryMap: depends on browser-only Leaflet APIs. The Ladle story
  sets `parameters: { chromatic: { disable: true }, serverSide: false }`
  to opt out of SSR for that one story.
- `AdminPanel` is 80 KB; this change breaks it into sub-organisms
  (`AdminPanelHeader`, `AdminPanelStatGrid`,
  `AdminPanelActionList`, etc.) inside `organisms/admin/`.