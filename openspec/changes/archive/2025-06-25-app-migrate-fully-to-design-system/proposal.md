## Why

By the end of iteration-13 proposal 06 the design system owns every
atom, molecule, organism, layout, semantic class, and the global
CSS chain. The `packages/app/` containers in
`packages/app/src/components/unveiled/` still hold the data-wired
wrappers around each presentational organism — and those containers
still import the design-system presentationals through a layer of
legacy re-exports (`packages/design-system/src/unveiled-primitives.tsx`,
`packages/design-system/src/_legacy.tsx`, and the six removed
`button.tsx` / `drawer.tsx` / `menu.tsx` / `modal.tsx` / `tabs.tsx` /
`toast.tsx` files that proposals 02 and 03 already moved into the
`atoms/` and `molecules/` folders).

This change finishes the job in the app: every container rewires to
the canonical `<Organism>Presentational` symbol from
`@unveiled/design-system`, every page rewires to the
`@unveiled/design-system` layouts and semantic CSS classes, the
legacy flat re-exports and shim files are deleted, the six removed
non-HeroUI components (`Badge`, `Panel`, `TableShell`, `TableRow`,
`SafeImage`, `Button.asChild`) are migrated to their documented
HeroUI / plain-element replacements at every consumer, and a new
`R-CN-IMPORT-PATH` gate rule forces every consumer to import `cn`
from `@unveiled/design-system` (the public barrel) rather than the
internal `@unveiled/design-system/lib/utils` path.

## What Changes

- **Container rewiring**: every file under
  `packages/app/src/components/unveiled/**` (and the `auth/` and
  `payments/` sub-trees) imports the canonical design-system
  `<Organism>Presentational` symbol. The 16 files that today import
  `@unveiled/design-system` are switched to the new symbols;
  containers still own the data hooks (TanStack Query,
  `authClient`, Stripe), but the presentational surface is fully
  owned by the design system.
- **Page rewiring**: every Astro page under
  `packages/app/src/pages/**` switches its inline `<div class="grid ...">`
  wrappers to the semantic CSS classes defined in proposal 06, and
  imports the local organisms through the design-system barrel.
  `packages/app/src/layouts/base-layout.astro` mounts `<AppLayout>`
  from the design system via a `<slot />` projection.
- **Barrel cleanup**: the legacy flat re-exports are removed from
  `packages/design-system/src/index.ts`. `unveiled-primitives.tsx`
  and `_legacy.tsx` are deleted. The six single-file atoms /
  molecules (`button.tsx`, `drawer.tsx`, `menu.tsx`, `modal.tsx`,
  `tabs.tsx`, `toast.tsx`) — whose content already lives under
  `atoms/` and `molecules/` after proposals 02 and 03 — are deleted
  from the design-system source tree.
- **Removed-component migration**: every `<Panel>` consumer switches
  to the design-system `Card` atom or a plain `<section>`; every
  `<Badge>` consumer switches to `HeroUIBadge` / `HeroUIChip`; the
  two `<SafeImage>` consumers switch to plain `<img>` with an
  `onError` fallback; the `PartnerPortal.tsx` table consumers switch
  to `HeroUITable` / `HeroUITableRow`; the `<Button asChild>` consumer
  switches to a styled `<a>` or `HeroUIButton` directly. The `StatePanel`
  molecule (which composes `Panel`) is rewritten to compose `Card`.
- **`cn()` import policy**: every `import { cn } from "@unveiled/design-system/lib/utils";`
  in `packages/app/src/**` becomes `import { cn } from "@unveiled/design-system";`.
  The design-system barrel re-exports `cn` explicitly. The
  `check-styling-ownership.ts` gate gains a new `R-CN-IMPORT-PATH`
  rule; a permanent unit test under `tests/unit/` asserts no
  consumer imports from the internal path.
- **Verification**: `bun run check`, `bun run test:e2e`,
  `bun run test:ladle`, `bun run ladle:coverage`,
  `bun run check:atomic-layers`, and `bun run check:styling-ownership`
  all stay green. The visual-regression baselines under `tests/visual/`
  catch any rendered-DOM drift per the iteration-13 e2e contract
  codified in proposal 12.
- **Optional rename**: if `packages/app/src/components/unveiled/` →
  `packages/app/src/containers/` is mechanical (one `git mv` + one
  barrel update) and does not break any Ladle story reference, the
  rename is performed. Otherwise it is deferred.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `design-system-package`: the existing requirement `## @unveiled/design-system exposes the production UI primitives` is MODIFIED to assert that the legacy shims (`unveiled-primitives.tsx`, `_legacy.tsx`) and the six single-file atoms/molecules (`button.tsx`, `drawer.tsx`, `menu.tsx`, `modal.tsx`, `tabs.tsx`, `toast.tsx`) are deleted, the barrel no longer flat-re-exports `Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`, or `Button.asChild`, and the `StatePanel` molecule composes `Card` rather than the removed `Panel`. A new requirement is ADDED requiring the app to consume only the design-system barrel (`@unveiled/design-system`) for atoms, molecules, organisms, layouts, and `cn` — never `@unveiled/design-system/lib/*`, `@nextui-org/react`, `@heroui/*`, or `lucide-react`. A second new requirement is ADDED mandating that `cn` is imported from the public barrel (not the internal `lib/utils` path), enforced by the `R-CN-IMPORT-PATH` rule in `check-styling-ownership.ts` and a permanent unit test.

## Impact

- **App source tree**: `packages/app/src/components/unveiled/**`
  (≈16 files), `packages/app/src/pages/**`, `packages/app/src/layouts/**`
  change. No file outside `packages/app/src/**` is touched.
- **Design-system barrel**: `packages/design-system/src/index.ts`
  shrinks (removes legacy flat re-exports, adds `cn` and
  `StatusColor` exports). `packages/design-system/src/_legacy.tsx`,
  `packages/design-system/src/unveiled-primitives.tsx`, and the
  six single-file atoms/molecules are deleted from the source tree.
- **Gate scripts**: `packages/design-system/scripts/check-styling-ownership.ts`
  gains the `R-CN-IMPORT-PATH` rule; the gate is already wired into
  `bun run check`.
- **Test surface**: `tests/unit/` gains one new permanent unit test
  asserting no app consumer imports `cn` from the internal path.
  The visual-regression baselines under `tests/visual/` are not
  refreshed (rendered DOM must match).
- **Out of scope**: the landing surface (`packages/landing/**` —
  owned by proposal 08), the API package, the orchestrator, the
  Astro layout rewiring on the landing side, Better Auth wiring,
  Stripe wiring, React Query cache, design tokens, and the
  HeroUI provider move (proposal 09).
