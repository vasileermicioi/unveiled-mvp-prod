## Why

After the prior iteration-13 proposals (02 atoms, 03 molecules, 04 organisms, 05 layouts/pages, 06–08 app/landing migrations, 09 theme-provider ownership, 10 styling ownership), every HeroUI primitive previously mirrored by `packages/design-system/src/heroui-replica/` has a production-grade equivalent under `packages/design-system/src/atoms/` and `packages/design-system/src/molecules/` with its own Ladle story, its own demo page in `packages/design-system/src/pages/`, and its own gate (`check:atomic-layers`). The replica now exists only as a maintenance hazard: every HeroUI version bump forces a replica update unrelated to production, and the bespoke `heroui-design-system-replica:check` script exists solely to police a folder that no production code touches. Iteration-13 plan §11 (`retire-heroui-replica`) closes the loop by deleting the replica, its gate, and the production-import unit test whose invariant is now subsumed by the more general `check:atomic-layers` rules and the proposal-09 HeroUI-boundary test.

## What Changes

- **BREAKING** Delete `packages/design-system/src/heroui-replica/` in its entirety (37 files: 18 `Hero*.tsx` primitives, 18 co-located `Hero*.ladle.tsx` stories, the `design-system-overview.ladle.tsx`, the `provider.tsx` shim, the `index.ts` barrel, and the `story-backdrop.tsx` helper). The Ladle sidebar shrinks to atoms, molecules, organisms, layouts, and pages only.
- **BREAKING** Delete `packages/design-system/scripts/check-heroui-design-system-replica.ts` and remove the `heroui-design-system-replica:check` script from `packages/design-system/package.json` and the root `package.json`.
- **BREAKING** Remove the `./heroui-replica` export from `packages/design-system/package.json` `exports`.
- **BREAKING** Delete `tests/unit/no-ladle-replica-in-production.test.ts`. Its invariant ("no production entry point imports a `*-replica/` path") is now subsumed by `check:atomic-layers` (no higher layer may import from `./heroui-replica/...`) and `tests/unit/design-system-hero-ui-boundary.test.ts` (no file outside `packages/design-system/**` imports HeroUI directly).
- Update the `bun run check:heroui-replica` umbrella in the root `package.json` to drop the replica check; it now runs `bun run ladle:coverage && bun run check` only.
- Update `AGENTS.md` to remove the `// @ladle-only` policy in §4 (the exception existed only for the replica), the file-layout mention of `heroui-replica/` in §3, the script table entries for `heroui-design-system-replica:check` and `check:heroui-replica` in §7, and the `tests/unit/no-ladle-replica-in-production.test.ts` reference in §7's toolchain table. The replica gate's place in the definition-of-done (§8) is removed; `ladle:coverage` remains.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-package`: **REMOVE** the requirement "`@unveiled/design-system` owns the Ladle-only HeroUI replica" (the production atoms/molecules/pages are the visual source of truth). **MODIFY** the package exports map to drop `./heroui-replica`. **MODIFY** the Ladle-config requirement to no longer reference replica stories. **MODIFY** the package-scripts requirement to no longer reference `heroui-design-system-replica:check`. **MODIFY** the AGENTS.md-boundary scenario to remove the `heroui-replica` directory entry. **MODIFY** the boundary-import scenarios in the `App package consumes the design system` and `Landing package consumes the design system` requirements to remove the `@unveiled/design-system/heroui-replica/*` continuation from the forbidden path list.

## Impact

- `packages/design-system/src/heroui-replica/` (37 files) deleted.
- `packages/design-system/scripts/check-heroui-design-system-replica.ts` deleted.
- `tests/unit/no-ladle-replica-in-production.test.ts` deleted.
- `packages/design-system/package.json`: `heroui-design-system-replica:check` script removed, `./heroui-replica` export removed.
- `package.json` (root): `heroui-design-system-replica:check` script removed; `check:heroui-replica` umbrella simplified to `bun run ladle:coverage && bun run check`.
- `AGENTS.md` §3, §4, §7, §8: replica references removed.
- No production code change: no file outside `packages/design-system/src/heroui-replica/` (and the gate script + unit test) references the replica today, so the deletion is a pure cleanup.
- Ladle sidebar: 18 replica stories + the `design-system-overview.ladle.tsx` group are removed; remaining groups (Atoms, Molecules, Organisms, Layouts, Pages) are unaffected.
