## Context

After proposals 02 (atoms) and 03 (molecules) land, the design system
owns the bottom two atomic layers but has nothing above molecules.
The app and landing packages carry the organism layer inline:
`packages/app/src/components/unveiled/{app-shell,AdminPanel,MemberFeed,PublicDiscover,PartnerPortal,BookingModal,DiscoveryFilterPanel,DiscoveryMap}.tsx` (mixing layout, behaviour, and styling in single files between 3 KB and 80 KB) and
`packages/landing/src/components/landing/{landing-header,landing-hero,landing-footer}.tsx`. These components are organism-level — they compose molecules into recognisable, self-contained UI sections — but they live outside the design system, cannot be viewed in Ladle, and the design system has no organism layer to enforce the "compose atoms, not HeroUI" rule at the highest tier.

The `R-ORGANISMS-NO-HEROUI` rule laid down in proposal 03 is forward-looking
(no organism exists yet, so nothing fails). This proposal adds the first
real organisms, so the rule becomes live. The `R-MOLECULES-NO-LUCIDE`
rule from proposal 03 already enforces "no `lucide-react` anywhere
under `molecules/`" — this proposal extends it across the design
system (no `lucide-react` anywhere in `packages/design-system/src/`)
because HeroUI 2.x has no `Icon` primitive and the iteration-13
prompt forbids the design system from depending on a third-party UI
library.

The constraint set:

- The design system has no third-party UI dependencies
  (`@nextui-org/react` / `@heroui/*` only).
- Molecules compose atoms; organisms compose atoms + molecules;
  organisms MUST NOT import from `@nextui-org/react` or `@heroui/*`
  directly.
- HeroUI 2.x has no `Icon` primitive; consumers inline `<svg>` with a
  `// source: lucide-static` licence-traceability comment.
- App-side data hooks (`useMutation`, `useQuery`, `authClient`,
  Stripe calls) must keep working — only the presentational half
  moves into the design system.
- Astro hydration semantics: containers stay in `"use client"`
  islands in the app package; the presentational piece is plain React
  and renders identically whether imported by Ladle or by a container.

## Goals / Non-Goals

**Goals:**

- Move every organism-shaped component out of `packages/app/src/components/unveiled/`
  and `packages/landing/src/components/landing/` into
  `packages/design-system/src/organisms/<domain>/<organism>/`.
- Introduce a presentational / container split: the presentational
  half moves into the design system; the container stays in the app
  package and re-exports the presentational piece under the original
  component name so every call site keeps compiling.
- Ship a Ladle story + mock fixture for every presentational organism
  so every form/section is viewable without spinning the app server.
- Activate the `R-ORGANISMS-NO-HEROUI`, `R-ORGANISMS-NO-LUCIDE`,
  `R-ORGANISMS-NO-CROSS-DOMAIN`, and `R-ORGANISMS-HAS-STORY` gate
  rules.
- Add an `Organisms` namespace export to the design-system barrel.
- Break the 80 KB `AdminPanel.tsx` into per-section sub-organisms
  (`AdminPanelHeader`, `AdminPanelStatGrid`,
  `AdminPanelActionList`, etc.) co-located under
  `organisms/admin/`.

**Non-Goals:**

- Migrating the data hooks (TanStack Query, Better Auth, Stripe) into
  the design system. The container keeps them; only the
  presentational half moves. Proposal 07 owns the consumer-side
  rewiring.
- Building layouts and pages. Proposal 05 owns the `layouts/` and
  `pages/` layers.
- Replacing the data hooks inside each organism. This proposal only
  moves the presentational half; the container keeps its current
  behaviour bit-for-bit.
- Changing the markup or class names of any organism. Tailwind
  utility classes stay where they are; only the *ownership* changes
  (the design system owns them via the gate).
- Icon extraction at the consumer level beyond what proposal 03
  already does (the 5 inline `<svg>` blocks in `app-shell.tsx` got
  the `// source: lucide-static` comment there). The full inline-`<svg>`
  convention for every consumer-owned icon is owned by proposals 07
  and 08.

## Decisions

### Decision: domain-organised `organisms/` subfolders

The organisms layer is organised by product surface, one folder per
domain. Each domain folder holds the organisms for that surface
(`shell/`, `auth/`, `discovery/`, `members/`, `bookings/`, `admin/`,
`partner-portal/`, `payments/`, `landing/`) plus the `_shared/` folder
for cross-domain pieces.

- **Rationale:** domain folders make the boundary between organisms
  visible at the filesystem level and let the gate enforce
  `R-ORGANISMS-NO-CROSS-DOMAIN` mechanically. Without this, contributors
  routinely couple two surfaces through a "shared" file that drifts.
- **Alternatives considered:**
  - Flat `organisms/` (one folder, every organism side by side):
    rejected — the gate cannot tell two unrelated organisms apart
    from a legitimate shared chunk, so cross-domain coupling sneaks
    back in.
  - One folder per organism, no domain grouping: rejected — the
    filesystem becomes a flat list of ~25 folders with no visible
    product-surface boundaries.

### Decision: presentational / container split, enforced by convention

Each organism is split into:

- `<X>.tsx` in the design system — the **presentational** half.
  - Props are typed by an exported `<X>Props` interface (in
    `<x>.types.ts`).
  - No data fetching, no `useEffect`, no
    `useQuery`/`useMutation`, no `fetch`, no `authClient` calls, no
    event handlers wired to server actions.
  - Optional callbacks are passed in as props
    (`onSubmit`, `onConfirm`, etc.).
- `<X>.tsx` in the app package — the **container** half.
  - Imports `<X>Presentational` from `@unveiled/design-system`.
  - Calls the data hooks, passes the props down.
  - Re-exports the presentational piece under the original
    component name so call sites keep compiling.

- **Rationale:** the container stays where the data lives; the
  presentational piece becomes a Ladle target. This is the only way
  the app keeps its SSR + Better Auth + Stripe wiring while the
  organism becomes demoable with mock props.
- **Alternatives considered:**
  - Move the whole organism (no split): rejected — the organism
    imports `useMutation` and `authClient`, which do not render in
    Ladle and would either need a mock server or a long list of
    conditional no-ops.
  - HOC-based split (`withDataHOC(Presentational)`): rejected — adds
    a layer of indirection that the design system (which has no
    HOC tradition) does not need; the function-component split is
    the convention the codebase already uses for non-organism
    compositions.

### Decision: mock fixtures live next to the organism

Each organism folder ships a `<organism>.mock.ts` file with a
`makeMock<Organism>Props()` helper. The Ladle story imports the
helper and feeds the presentational piece its output.

- **Rationale:** co-located mocks make the story self-contained and
  prevent fixtures from drifting into a "shared mocks" module that
  every organism eventually imports (which would create the same
  coupling problem the domain-folder rule solves for components).
- **Alternatives considered:**
  - One shared `mocks/` folder at the design-system root: rejected —
  - Hand-rolled mock data inside the story file: rejected — the
    same story eventually wants multiple variants
    (loading, error, empty), and copy-pasting the fixture into each
    story variant is unmaintainable.

### Decision: DiscoveryMap opted out of SSR via Ladle `parameters`

`DiscoveryMap` imports Leaflet and depends on browser-only APIs
(`window`, `document`). Its Ladle story declares
`parameters: { chromatic: { disable: true }, serverSide: false }` so
Ladle does not try to render it server-side (which would crash on
the missing `window`).

- **Rationale:** the organism is still a valid presentational
  component — it just needs a browser. Ladle's per-story
  `serverSide: false` opt-out is the canonical escape hatch.
- **Alternatives considered:**
  - Mock Leaflet inside the Ladle story with `vi.mock`: rejected —
  - Move DiscoveryMap to a separate `organisms/browser-only/`
    folder: rejected — over-engineered for one organism; the per-story
    opt-out is enough.

### Decision: AdminPanel broken into per-section sub-organisms

`AdminPanel.tsx` is 80 KB and contains a header, stat grid, action
list, and several other distinct sections. Rather than promote a
single 80 KB organism, this change breaks it into the existing
sub-components already exported from `AdminPanel.tsx` (`AdminPanelHeader`,
`AdminPanelStatGrid`, `AdminPanelActionList`, etc.) and promotes each
to its own organism folder under `organisms/admin/`. The
`AdminPanel` itself becomes a container that composes them.

- **Rationale:** a single 80 KB presentational component is
  unmovable in practice (no Ladle story can show the whole thing
  meaningfully) and the design system should ship sections, not
  pages.
- **Alternatives considered:**
  - Promote `AdminPanel` as one organism and add a single Ladle
    story: rejected — the result is unmaintainable and the Ladle
    story is unusable (too much chrome in one viewport).
  - Move `AdminPanel` to the `pages/` layer (proposal 05): rejected
    — the sub-sections are reused across admin pages, so they
    belong in `organisms/`, not `pages/`.

### Decision: forward-looking gate rules from proposal 03 become live

Proposal 03 laid down `R-ORGANISMS-NO-HEROUI` and `R-MOLECULES-NO-LUCIDE`
as forward-looking rules. This change is the first to add real
organism files, so the rules start failing on drift immediately
rather than staying dormant.

- **Rationale:** without an active consumer, the rules do nothing.
  Promoting organisms activates them and proves the gate catches the
  next regression.
- **Alternatives considered:** leave the rules dormant until 05/07
  land: rejected — leaves the gate untested for two more proposals.

## Risks / Trade-offs

- **[Astro hydration regression]** — moving an organism could change
  how Astro hydrates a container if the import path changes shape.
  → **Mitigation:** the container keeps its current `"use client"`
  directive and current default-export name. The presentational
  piece is plain React (no `"use client"`), so Ladle and the
  container both import it as a regular React component. The
  hydration boundary does not change.

- **[Class-name parity]** — moving an organism should not change its
  markup or class names, but a refactor that accidentally drops a
  Tailwind class would be invisible to the type-checker. →
  **Mitigation:** the Ladle story renders the presentational piece
  with the mock fixture and Ladle visual regression
  (`bun run test:ladle`) catches class-name regressions on the next
  PR.

- **[Container / presentational drift]** — once a container and a
  presentational component live in different packages, the prop
  surface can drift (container passes a prop the presentational
  piece no longer accepts, or vice versa). →
  **Mitigation:** the presentational piece exports its
  `<X>Props` interface from `<x>.types.ts`; the container imports
  the same interface (`type { LoginFormProps } from
  "@unveiled/design-system"`); the design-system `tsc --noEmit`
  check catches drift on the design-system side and the
  `bun run typecheck:workspaces` check catches drift on the
  container side.

- **[AdminPanel refactor scope creep]** — breaking the 80 KB
  AdminPanel into sub-organisms is a substantial refactor inside a
  single change. → **Mitigation:** the per-section sub-organisms
  are extracted from the existing `AdminPanel.tsx` exports
  (`AdminPanelHeader`, `AdminPanelStatGrid`,
  `AdminPanelActionList`, etc.), which are already separate
  components. The refactor is "promote each existing export" not
  "redesign the admin panel". Task 6.1 is intentionally small.

- **[Cross-domain leakage]** — once two domains want to share a
  chunk (e.g. a loading skeleton used by both `members` and
  `admin`), the temptation is to import across domain boundaries.
  → **Mitigation:** `R-ORGANISMS-NO-CROSS-DOMAIN` fails the build
  if any organism imports from `organisms/<other-domain>/`. The
  shared piece MUST move to `organisms/_shared/` instead.

- **[Mock fixtures diverge from real data]** — the mock fixture
  shape can drift from the real data the container passes. →
  **Mitigation:** the mock factory's return type IS the
  `<X>Props` type, so a drift in the prop surface is a compile
  error in the story file, not a runtime mismatch.

## Migration Plan

This change ships in one PR. Steps in order:

1. Scaffold `organisms/` folders (task 1).
2. Promote `_shared` organisms (task 2).
3. Promote shell organisms (task 3) — keep `AppShell` container in
   app package.
4. Promote auth organisms (task 4) — update the 5 `auth/*.tsx`
   containers in the app package to import the presentational
   pieces.
5. Promote discovery, members, bookings organisms (task 5).
6. Promote admin, partner-portal, payments organisms (task 6) —
   break `AdminPanel` into sub-organisms.
7. Promote landing organisms (task 7) — re-export from
   `@unveiled/design-system`.
8. Extend `check-atomic-layers.ts` with the four new rules and
   update the design-system barrel (task 8).
9. Run `bun run check` and `bun run ladle:coverage` until both exit
   zero (task 8.3 / 8.4 / 9.3).
10. Open PR. No deployment happens until `bun run deploy:cloudflare`
    in a follow-up cycle (this is a code-shape change, no
    infrastructure change).

**Rollback:** revert the PR. No database migrations, no
infrastructure changes, no data backfill. The legacy
`packages/app/src/components/unveiled/` files are kept in git
history and the design-system barrel does not yet remove the
flat re-exports of the existing component names until proposals
07/08 land.

## Open Questions

- **Should the presentational pieces also be re-exported as
  `LoginForm` (without the `Presentational` suffix) from the
  design-system barrel?** The molecules layer re-exports both
  flat-named and under the namespace, so the analogous move here
  is to re-export `<Organism>Presentational` flat AND under
  `Organisms.<Organism>Presentational`. Containers import by the
  flat name today; consumers may eventually switch to the
  namespace (proposal 07). **Resolved:** re-export both, drop the
  flat re-export in proposal 07.

- **Where do `use client` directives live on a split organism?**
  The container is a `"use client"` island (it imports
  `useMutation`, `authClient`); the presentational piece is plain
  React and has no `"use client"`. Ladle imports the presentational
  piece as a regular React component, so this is correct. **Resolved.**

- **Should `AdminPanel`'s per-section sub-organisms live under
  `organisms/admin/` or `organisms/admin/admin-panel/`?** Per the
  layout in the proposal, `AdminPanel` becomes a container in the
  app package that composes the sub-organisms (each under their
  own folder inside `organisms/admin/`). **Resolved.**