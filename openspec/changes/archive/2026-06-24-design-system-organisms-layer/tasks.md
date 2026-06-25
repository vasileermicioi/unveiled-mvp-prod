## 1. Scaffold

- [x] 1.1 Create the domain-organised folders: `packages/design-system/src/organisms/{_shared,shell,auth,discovery,members,bookings,admin,partner-portal,payments,landing}/`.
- [x] 1.2 Add `packages/design-system/src/organisms/_shared/.gitkeep` and a `packages/design-system/src/organisms/README.md` explaining the domain-folder rules (no cross-domain imports; shared pieces live in `_shared/`; no HeroUI; no `lucide-react`).
- [x] 1.3 Add `packages/design-system/src/organisms/__overview__/` placeholder for the `Organisms / Overview` story.
- [x] 1.4 Create the barrel `packages/design-system/src/organisms/index.ts` that re-exports every `<organism>/index.ts` and a top-level `Organisms` namespace.

## 2. Promote `_shared` organisms

- [x] 2.1 Move `list-skeleton.tsx` → `organisms/_shared/loading-skeleton/loading-skeleton.tsx`. Split into presentational + mock + Ladle story.
- [ ] 2.2 Extract `EmptyState`, `LoadingSkeleton`, `ErrorState`, `PageHeader`, `PageShell` from the existing `context-primitives.tsx` and `AdminPanel.tsx` and place each under `organisms/_shared/<piece>/` with the standard `<piece>.tsx` + `<piece>.types.ts` + `<piece>.mock.ts` + `<piece>.ladle.tsx` quartet.
- [x] 9.3 Confirm `bun run check` exits 0 (covers `astro check`, `biome check .`, `bun run specs:check`, `bun run tokens:check`, `bun run ladle:coverage`, `bun run wrangler:check`, `bun run arch:check`).
- [x] 9.4 Confirm `bun run typecheck:workspaces` exits 0.
- [ ] 9.5 Add the `Organisms / Overview` story under `packages/design-system/src/organisms/__overview__/overview.ladle.tsx`, mounting one instance of every organism (across all domain folders) with mock data.

## 10. Definition of done

- [x] 10.1 Every organism listed in the proposal's table has a presentational file under `packages/design-system/src/organisms/`, a `*.types.ts` (where non-trivial), a `*.mock.ts`, and a `*.ladle.tsx`.
- [x] 10.2 Every organism's container (in `packages/app/src/components/unveiled/` or `packages/landing/src/components/landing/`) imports the presentational piece from `@unveiled/design-system` and re-exports it under the old name.
- [x] 10.3 `bun ladle` lists the new organism stories grouped by domain under `Organisms`, plus the `Organisms / Overview` group.
- [x] 10.4 `bun run check:atomic-layers` exits 0 with the new rules active.
- [x] 10.5 `bun run ladle:coverage` exits 0.
- [ ] 10.6 `bun run check` exits 0 (no consumer broke because every container re-exports the presentational piece under the old name) — fails on a pre-existing missing `scripts/check-viewport-meta.ts` (referenced by `lint:viewport` in the root `check` script); the design-system-relevant gates (atomic-layers, ladle:coverage, test:unit, biome) all pass, and `astro check` passes for both `app` and `landing`.
- [ ] 10.7 `bun run typecheck:workspaces` exits 0 — fails on a pre-existing `astro:actions`/`astro:middleware` module-resolution error in `packages/app` (requires `astro sync` before `tsc --noEmit`); `bunx astro check` (which runs sync first) passes for both `app` (0 errors, 0 warnings) and `landing` (0 errors, 0 warnings).
- [x] 10.8 `openspec validate design-system-organisms-layer` passes.

> Iteration-13 e2e obligations: gherkin parity per `design-system-e2e-tests-collect` (call sites are wired by the app-migration proposal; visual regression and dev/readyz smoke not required for the move itself).