## Why

After the prior landing- and app-migration changes (`2026-06-25-landing-migrate-fully-to-design-system` and `2026-06-25-app-migrate-fully-to-design-system`), exactly one file in the production tree still imports `@nextui-org/react`: `packages/app/src/components/providers/heroui-provider.tsx`. The iteration-13 prompt is explicit — "landing and app packages only components from design-system package, no direct import from HeroUI" — so the provider must move into `@unveiled/design-system` and be renamed so the export no longer leaks the implementation detail.

A parallel `NextUIProvider` wrapper also exists at `packages/design-system/src/heroui-replica/provider.tsx` and is used only by Ladle replica stories. After this change there is one provider, owned by the design system, shared between production code and Ladle stories.

## What Changes

- Add `packages/design-system/src/providers/theme-provider.tsx` exporting `UnveiledThemeProvider` (wraps `NextUIProvider` from `@nextui-org/react`).
- Expose the new provider through `@unveiled/design-system`: a `Providers` namespace export and a flat named export.
- Rewire every consumer (`packages/app/src/components/unveiled/visual-system-app.tsx`, any other mount point discovered in the audit) to import `UnveiledThemeProvider` from `@unveiled/design-system`.
- Delete `packages/app/src/components/providers/heroui-provider.tsx`.
- Re-export `UnveiledThemeProvider` as `HeroUIReplicaProvider` from `packages/design-system/src/heroui-replica/provider.tsx` (kept for replica stories until a follow-up change retires the replica).
- Add a permanent unit test under `tests/unit/` that asserts no file outside `packages/design-system/**` imports `@nextui-org/react` / `@nextui-org/*` (the final boundary gate for this iteration).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-package`: formalise the requirement that the theme provider is owned by the design system, rename it from the production tree's `HeroUIProvider` to `UnveiledThemeProvider`, and add a permanent boundary gate that no file outside `packages/design-system/**` imports HeroUI directly.

## Impact

- `packages/app/src/components/providers/heroui-provider.tsx` deleted; `packages/app/src/components/unveiled/visual-system-app.tsx` updated to import `UnveiledThemeProvider` from `@unveiled/design-system`.
- `packages/design-system/src/providers/theme-provider.tsx` (new), `packages/design-system/src/index.ts` (new exports).
- `packages/design-system/src/heroui-replica/provider.tsx` re-exports the production provider under its previous name for backwards compatibility.
- `tests/unit/` gains a permanent boundary-gate test.
- `AGENTS.md` definition-of-done gains a "no file outside `packages/design-system/**` imports HeroUI directly" gate (enforced by the new unit test).
