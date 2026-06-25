## Context

Iteration 13 splits every UI primitive in the repo across four
layers — atoms (`@nextui-org/react` compositions, owned by the
design system), molecules (atom compositions, owned by the design
system), organisms (data-aware presentational shells, owned by the
design system), and layouts (frames that compose organisms, owned by
the design system). Proposals 02 (atoms), 03 (molecules), 04
(organisms), 05 (layouts), and 06 (styling ownership) land each layer
in turn and rewrite the design-system barrel, the global CSS chain,
the Tailwind theme block, and the semantic-class catalogue.

By the end of proposal 06 the design system owns every atom,
molecule, organism, layout, semantic CSS class, and `cn` composition.
Two shim files remain: `packages/design-system/src/unveiled-primitives.tsx`
(legacy flat re-exports for every primitive, kept through proposal 06
so proposal 07 and 08 do not have to coordinate their rewires) and
`packages/design-system/src/_legacy.tsx` (the per-component
back-compat shim for the six removed non-HeroUI components
`Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`,
`Button.asChild`). The six single-file atoms / molecules
(`button.tsx`, `drawer.tsx`, `menu.tsx`, `modal.tsx`, `tabs.tsx`,
`toast.tsx`) also remain — proposals 02 and 03 moved their content
into the `atoms/` and `molecules/` folders but kept the legacy
single-file copies as back-compat shims.

The app package (`packages/app/`) still imports from `@unveiled/design-system`
in 16 container files in `packages/app/src/components/unveiled/**`.
Every container imports the design-system presentational through one
of two paths:

1. **Direct presentational re-exports** — the design-system barrel
   already flat-re-exports `<Organism>Presentational` from the
   barrel; the import compiles because the barrel re-export
   predates the proposal-07 migration window.
2. **Legacy shim re-exports** — many containers still import the
   presentational indirectly via `unveiled-primitives.tsx` or
   `_legacy.tsx`. These shims exist solely so that proposal 07 and
   08 can land independently; once both land, the shims have no
   consumers and must be deleted.

The migration window closes in this change. After this change lands,
the design-system barrel no longer carries the legacy flat re-exports,
the two shim files are deleted, the six single-file atoms/molecules
are deleted, every app container imports its presentational
directly from the barrel, and the `cn` import path is canonicalised
to the public barrel. The `StatePanel` molecule (which composed the
removed `Panel` atom) is rewritten to compose `Card` instead.

## Goals / Non-Goals

**Goals:**

- Every container in `packages/app/src/components/unveiled/**` (and
  the `auth/` and `payments/` sub-trees) imports the canonical
  `<Organism>Presentational` symbol from `@unveiled/design-system`
  and composes the data hooks via extracted `mapSessionToProps` /
  `mapMutationToProps` helpers.
- Every Astro page under `packages/app/src/pages/**` switches its
  inline `<div class="grid ...">` wrappers to the semantic CSS
  classes defined in proposal 06 and imports organisms through the
  design-system barrel.
- `packages/app/src/layouts/base-layout.astro` mounts the
  design-system `AppLayout` via `<slot />` projection.
- Every `<Panel>`, `<Badge>`, `<SafeImage>`, `<TableShell>`,
  `<TableRow>`, and `<Button asChild>` consumer is migrated to the
  documented HeroUI / plain-element replacement.
- `packages/design-system/src/_legacy.tsx`,
  `packages/design-system/src/unveiled-primitives.tsx`, and the six
  single-file atoms/molecules (`button.tsx`, `drawer.tsx`,
  `menu.tsx`, `modal.tsx`, `tabs.tsx`, `toast.tsx`) are deleted.
- `packages/design-system/src/index.ts` adds flat re-exports for
  `cn` and `StatusColor`.
- Every `cn` import in `packages/app/src/**` is rewritten to use
  the public barrel (`@unveiled/design-system`), not the internal
  path (`@unveiled/design-system/lib/utils`).
- `check-styling-ownership.ts` gains the `R-CN-IMPORT-PATH` rule
  and a permanent unit test under `tests/unit/` enforces the
  boundary.
- The optional rename `packages/app/src/components/unveiled/` →
  `packages/app/src/containers/` is performed if and only if it is
  mechanical (one `git mv` + one barrel update, no Ladle story
  reference update required).

**Non-Goals:**

- Replacing the app's Better Auth wiring, Stripe calls, or React
  Query cache. Those stay.
- Migrating the landing surface. That is proposal 08.
- Touching the API package or the orchestrator.
- Changing the Astro wrapper on the landing side (proposal 08 owns
  that).
- Renaming any atom or molecule.
- Refreshing visual-regression baselines (rendered DOM must match).
- Visual redesign.

## Decisions

### Decision 1: Container shape is `<Name>Container` + extracted mapping helpers

Every container in `packages/app/src/components/unveiled/` follows
the same shape:

```tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { SomeOrganismPresentational } from "@unveiled/design-system";
import type { SomeOrganismProps } from "@unveiled/design-system";
import { authClient } from "@/lib/auth-client";
import { mapSessionToProps, mapMutationToProps } from "./some-organism.mappers";

export function SomeOrganismContainer() {
  const session = authClient.useSession();
  const mutation = useMutation({ /* ... */ });
  return (
    <SomeOrganismPresentational
      {...mapSessionToProps(session.data)}
      {...mapMutationToProps(mutation)}
    />
  );
}
```

The mapping helpers (`mapSessionToProps`, `mapMutationToProps`) are
extracted to a co-located `*.mappers.ts` file and unit-tested. This
shape:

- keeps the JSX tree free of data-layer logic,
- lets the presentational be tested with mock data by Ladle (it is
  the design-system `<Name>Presentational`),
- lets the mapping helpers be tested with `bun:test` directly,
- preserves the existing consumer contract (every Astro page that
  mounts `<SomeOrganismContainer>` continues to work).

**Alternatives considered:**

- *Inline data wiring in the container.* Rejected: mixes JSX with
  data-mapping logic and makes the presentational-only path (Ladle
  stories, storybooks, visual regression) require a data mock layer.
- *Co-locate the presentational and the container in the design
  system.* Rejected: the design system is data-free by contract;
  containers need `@/lib/auth-client` and `@/lib/stripe`, both of
  which are app-internal paths. The boundary is preserved by keeping
  containers in `packages/app/src/components/unveiled/`.

### Decision 2: The barrel removes the legacy flat re-exports and the two shim files are deleted

`packages/design-system/src/index.ts` currently carries legacy
flat-re-exports for every molecule (`Field`, `StatePanel`,
`StatPanel`, `SelectInput`, `Toast`, `Drawer`, `Modal`, `Menu` and
its sub-components). These are removed in this change because
proposal 07 (this change) and proposal 08 (landing) both rely on
the canonical namespace exports (`Molecules.<Name>`,
`Organisms.<Name>`) and the explicit `<Name>Presentational`
flat-exports from the design-system barrel. The legacy flat-re-export
of every molecule is redundant once both proposals land.

`_legacy.tsx` and `unveiled-primitives.tsx` are deleted from the
source tree at the same time. Their consumers are all in the app
(and the landing, owned by proposal 08) and are migrated before the
deletions.

The six single-file atoms/molecules (`button.tsx`, `drawer.tsx`,
`menu.tsx`, `modal.tsx`, `tabs.tsx`, `toast.tsx`) are also deleted.
Their content lives in `atoms/` and `molecules/` already (proposals
02 and 03) and the barrel currently re-exports both the single-file
copies and the new layer folders; deleting the single-file copies
forces the barrel to carry the layer-folder re-export as the
canonical source.

**Alternatives considered:**

- *Keep the legacy flat-re-exports as back-compat.* Rejected: the
  iteration-13 goal is to land the design-system boundary in
  production code, not to maintain two re-export paths. Back-compat
  re-exports invite drift.
- *Delete the shims first, then migrate.* Rejected: the migration
  touches 16+ files; deleting the shims first turns every consumer
  into a compile error before the rewiring lands. The order is
  rewire first, then delete, enforced by a feature branch.

### Decision 3: `StatePanel` composes `Card`, not `Panel`

The `StatePanel` molecule (defined in
`packages/design-system/src/molecules/state-panel/`) currently
composes the removed `Panel` atom plus text. After the
`Panel`-removal, the molecule is rewritten to compose `Card`
(the design-system atom, which wraps `HeroUICard`) plus text. The
public prop surface shrinks to the props `Card` accepts. The
removed `tone` (`dark`, `yellow`, `white`, `grey`, `success`,
`error`) and `shadow` props are dropped. Consumers use
`HeroUICard`'s `shadow` and `classNames` props (passed via
`<StatePanel>`'s `className` prop) instead.

**Alternatives considered:**

- *Keep `StatePanel` as a molecule and pass-through the `Panel`
  props.* Rejected: `Panel` is gone. A pass-through to a removed
  atom is a bug factory.
- *Inline the molecule at every call site (delete `StatePanel`).*
  Rejected: every call site currently composes `StatePanel` with
  one-line headlines and bodies; inlining duplicates the
  composition logic in 4+ files. The molecule is the right level of
  abstraction; it just composes a different atom now.

### Decision 4: `cn` is imported from the public barrel, never from `lib/utils`

`packages/design-system/src/lib/utils.ts` is the source of `cn`.
Today consumers can import `cn` from either
`@unveiled/design-system` (if the barrel re-exports it) or from
`@unveiled/design-system/lib/utils` (a deep import that bypasses
the barrel). The barrel currently does not flat-re-export `cn`; the
canonical entry point is the deep import.

This change flips the policy: the barrel flat-re-exports `cn`, the
deep import is forbidden by the `R-CN-IMPORT-PATH` rule in
`check-styling-ownership.ts`, and a permanent unit test under
`tests/unit/` greps every file in `packages/app/src/**` and fails
on `from "@unveiled/design-system/lib/utils"` matches.

**Why the deep import is forbidden:**

- The design-system's `exports` map declares a single public entry
  point (`"."`). Any path under `lib/` is reachable through the
  `exports` map only because of TypeScript path mapping; consumers
  that bypass the barrel couple to the design-system's internal
  file layout.
- A future refactor (e.g. splitting `lib/utils.ts` into
  `lib/cn.ts` + `lib/types.ts`) would silently break every consumer
  that imports the internal path. The barrel re-export is the
  contract.

**Alternatives considered:**

- *Mark `lib/utils.ts` as a sub-path export in the `exports` map.*
  Rejected: that formalises the deep-import path and makes it part
  of the public contract. The barrel is the only public entry point
  by design (the atoms / molecules / organisms / layouts / styles
  sub-paths are also private).
- *Move `cn` to a separate package.* Rejected: `cn` is one
  `clsx` + `twMerge` line. Extracting it is over-engineering for a
  ten-line helper.

### Decision 5: Gate rule `R-CN-IMPORT-PATH` extends `check-styling-ownership.ts`

The `R-CN-IMPORT-PATH` rule is added to the existing
`packages/design-system/scripts/check-styling-ownership.ts`
script (introduced in proposal 06 and wired into `bun run check`).
The rule walks every `.ts`, `.tsx`, and `.astro` file under
`packages/app/src/**` (and `packages/landing/src/**`, owned by
proposal 08) and fails if any file contains the substring
`from "@unveiled/design-system/lib/utils"` in any import statement.

The rule is implemented as a regex match in the existing gate
script. The allow-list is: the substring `"@unveiled/design-system/lib"`
is matched literally; the only continuation that is allowed is none
(because the barrel is the only valid path). A more permissive
match — allowing `@unveiled/design-system/lib/utils.css` — would
fail because no such path exists in the `exports` map.

A second permanent unit test under `tests/unit/` runs alongside the
gate (defence in depth: the gate is the primary check; the unit
test is the regression net if the gate is ever accidentally
bypassed).

**Alternatives considered:**

- *Add the rule to a new, dedicated gate script.* Rejected: the
  styling-ownership gate is the canonical "app and landing never
  import design-system internals" boundary; `cn` is part of that
  boundary.
- *Implement the rule as an ESLint plugin.* Rejected: the repo
  uses Biome; introducing ESLint for one rule violates the
  toolchain policy in AGENTS.md.

### Decision 6: Optional rename `unveiled/` → `containers/` is performed only if mechanical

The folder `packages/app/src/components/unveiled/` holds the
data-wired wrappers around each design-system organism. The name
`unveiled/` made sense when the folder held a mix of organisms,
contexts, and Ladle harnesses; today it is purely containers. The
proposal considers renaming the folder to `packages/app/src/containers/`
to communicate the new role.

The rename is performed **only** if all of the following are true:

1. The rename is a single `git mv` plus a barrel update in
   `packages/app/src/components/index.ts` (or the equivalent barrel
   file).
2. No Ladle story reference (`tests/features/**/*.ladle.tsx`) needs
   to change (the coverage script reads the file basename, not the
   import path; Ladle stories import the design-system presentational,
   not the app container).
3. No Astro page reference (`packages/app/src/pages/**/*.astro`)
   needs to change.

If any of those checks fails, the rename is deferred to a follow-up
proposal and documented as "deferred" in this change's Definition of
done.

**Alternatives considered:**

- *Always rename.* Rejected: if a Ladle story has a hard-coded
  `from "@unveiled/app/components/unveiled/<surface>"` import, the
  rename turns the rewiring into two coupled changes (rewire +
  rename) instead of one. The conditional rename keeps the proposal
  scope narrow.

## Risks / Trade-offs

- **Coupling between rewiring and barrel deletion.** The two happen
  in the same change. If the rewiring misses a consumer, deleting
  the shim files turns that consumer into a compile error. Mitigation:
  the rewiring is type-checked incrementally with `bun run --filter @unveiled/app typecheck`
  before the shims are deleted.

- **Visual-regression drift.** The `Panel` → `Card` migration
  changes the chrome (the brand chrome differs slightly between
  the two atoms). Mitigation: the visual-regression baselines
  catch the drift; proposal 06's codemod is conservative and
  preserves class names; the rendered DOM is expected to be
  visually equivalent.

- **`asChild` removal**. The `Button.asChild` consumer loses the
  capability. Mitigation: the consumer rewrites the call site to a
  styled `<a>` (or to `HeroUIButton` directly with an `onClick`
  handler that calls `navigate(...)`). The capability is gone
  forever — the design system does not ship `asChild`.

- **`cn` import path canonicalisation breaks consumers that use
  TypeScript path aliases.** Today some consumers use the
  `tsconfig.base.json` path alias to reach `lib/utils`. Mitigation:
  the `R-CN-IMPORT-PATH` rule and the unit test catch every
  offender; the migration is mechanical (search-replace
  `@unveiled/design-system/lib/utils` → `@unveiled/design-system`).

- **Ladle story references to the renamed `containers/` folder.**
  Ladle stories under `tests/features/**` import the
  design-system `<Name>Presentational` symbol, not the app
  container. The rename does not affect them. Mitigation: the
  `bun run ladle:coverage` check post-rename confirms zero drift.

- **StatePanel prop surface reduction breaks consumers.** The
  removed `tone` and `shadow` props on `StatePanel` break call
  sites that pass them. Mitigation: the rewiring replaces
  `<StatePanel tone="dark" shadow="unveiled">` with
  `<StatePanel className="shadow-unveiled">` (the `cn` call uses
  the design-system `cn` helper). The change is mechanical.

- **Optional rename deferred.** If the rename is not mechanical,
  the proposal ships without the rename and a follow-up proposal
  is created. The risk is purely cosmetic — the production code
  works the same either way.
