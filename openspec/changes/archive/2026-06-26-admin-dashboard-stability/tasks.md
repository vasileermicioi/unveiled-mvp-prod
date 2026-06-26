## 1. Design-system organism

- [x] 1.1 Create `packages/design-system/src/organisms/_shared/table-skeleton/` with `index.ts`, `table-skeleton.tsx`, `table-skeleton.mock.tsx`, and `table-skeleton.ladle.tsx`.
- [x] 1.2 Re-export the new organism from `packages/design-system/src/organisms/index.ts` and the top-level `packages/design-system/src/index.ts` barrel under `Organisms.TableSkeleton`.
- [x] 1.3 Build the skeleton from the existing `Card` and `Skeleton` atoms with a `motion-safe` shimmer keyframe, honouring `prefers-reduced-motion: reduce`, and accept `columns`, `rows`, and an optional `density` prop.
- [x] 1.4 Add a Ladle page under `packages/design-system/src/pages/admin/table-skeleton.page.tsx` mounting the new story with a `@ladle(component="TableSkeleton", story="default")` tag.
- [x] 1.5 Run `bun run check:atomic-layers` and `bun run ladle:coverage` to confirm the new organism stays inside the atomic-design layer rules.

## 2. Admin context plumbing

- [x] 2.1 In `packages/app/src/components/unveiled/context.tsx`, add a `useAdminTabStatus(tab: "events" | "partners" | "members")` hook that returns `{ data, isPending, isError, refetch }` sourced from the existing TanStack Query for that tab.
- [x] 2.2 Export the new hook from the context module barrel so `AdminPanel.tsx` and the gherkin step definitions can import it via the existing `@/` alias.

## 3. AdminPanel rendering

- [x] 3.1 In `packages/app/src/components/unveiled/AdminPanel.tsx`, compute `isPending = isFetching && !data` and `isError` per active tab using `useAdminTabStatus`.
- [x] 3.2 Render `<TableSkeleton />` inside the active tab body whenever `isPending` is true, replacing the empty-table placeholder on first paint and during refetches without cached data.
- [x] 3.3 Render a `<ShellStatusBanner type="error">` above the active tab body whenever `isError` is true, with a "Retry" action wired to the hook's `refetch()`.
- [x] 3.4 Render a `<Badge tone="warning">Stale data</Badge>` next to the page title whenever `isError && data` is true so operators see a stale-data label even when the banner is below the fold.
- [x] 3.5 Ensure no raw Tailwind utility classes are introduced — render only through the design-system semantic classes imported from `@unveiled/design-system/styles/global.css`, then run `bun run check:styling-ownership`.

## 4. Tests

- [x] 4.1 Add `tests/features/admin/loading-state/feature.feature` with two scenarios: first paint renders a skeleton, and a 5xx surfaces a `ShellStatusBanner` with a working "Retry" action.
- [x] 4.2 Co-locate `tests/features/admin/loading-state/table-skeleton.ladle.tsx` mounting the new organism with `@ladle(component="TableSkeleton", story="default")` tags so the feature and Ladle scenarios stay in sync.
- [x] 4.3 Add `tests/unit/table-skeleton.test.ts` that snapshots the Ladle story, asserts the skeleton host renders `aria-busy="true"`, and asserts the shimmer `animation` resolves to `none` under `prefers-reduced-motion: reduce`.
- [x] 4.4 Run `bun run test:e2e`, `bun run test:ladle`, `bun run test:unit`, and `bun run ladle:coverage` and confirm they pass.

## 5. Documentation

- [x] 5.1 Update `docs/operations.md` with the new loading-skeleton + retry + stale-data contract, referencing the new organism and the `useAdminTabStatus` hook.
- [x] 5.2 Run `bun run check` end-to-end (TypeScript, Biome, specs, tokens, atomic layers, styling ownership, Ladle coverage) and resolve any drift before opening the PR.