## Context

`AdminPanel.tsx` (`packages/app/src/components/unveiled/AdminPanel.tsx`) assumes the initial admin dashboard payload is present on first render and only swaps to a loading state when the operator changes a filter. Two production-blocking gaps follow from that assumption:

1. When the API Worker returns a 5xx — for example a database cold start reported in iteration 09 — the admin UI keeps showing stale dashboard rows because the TanStack Query fetcher does not surface the error to the page shell.
2. When the admin first lands on `/app/admin`, the URL has no `eventsPage`, `membersPage`, or `partnersPage`; the `useEffect` in `context.tsx` issues the first fetch, but the UI renders an empty table for ~200 ms before the data arrives. On slow networks this flashes a "no rows" state that operators interpret as a real empty result and forces a manual refresh.

The change is constrained to the existing admin surface. The API Worker contract does not change, no Drizzle migration is required, and no new TypeSpec delta is needed. The work is split between the design system (a reusable `<TableSkeleton />` organism) and the app shell (`AdminPanel.tsx` + `context.tsx`), plus BDD coverage and a snapshot test.

## Goals / Non-Goals

**Goals:**

- Always render a deterministic loading skeleton for the active admin tab on first paint and during any refetch with no cached data.
- Surface every per-tab fetch failure as a `ShellStatusBanner` with a "Retry" action that re-issues the failed query through TanStack Query `refetch()`.
- Label cached data as stale in the page header when the most recent fetch failed but a prior success is still cached.
- Ship `<TableSkeleton />` as a presentational design-system organism with a Ladle story, an `aria-busy="true"` host, and a `prefers-reduced-motion` aware shimmer driven by the existing `motion-safe` design token.

**Non-Goals:**

- Optimistic UI for admin mutations (tracked separately).
- A new skeleton primitive or skeleton theming beyond the existing brand tokens (tracked separately per iteration 14 / proposal 10).
- Any API Worker, Drizzle, or TypeSpec contract change.
- Localisation changes — the new banner copy uses the same i18n keys already consumed by `ShellStatusBanner` and `Badge`.

## Decisions

- **Reuse the existing `Card` + `Skeleton` atoms for the new organism.** Introducing a parallel skeleton primitive would conflict with the atomic-design layer gate and the design-system barrel contract. Building the table skeleton from `Card` (host) + `Skeleton` (rows) keeps the primitive count flat and stays inside the existing visual language.
- **Surface errors in a `ShellStatusBanner` instead of replacing the table.** Replacing the table on failure destroys the operator's current context (filter, scroll position, selected row). Rendering the banner above the cached rows preserves that context and aligns with the existing `operations` requirement that "validation, conflict, business-rule, or authorization checks ... display a safe visible error and no stale success state remains".
- **Compute `isPending` as `isFetching && !data`.** This matches the gherkin scenario ("first paint", "pagination refetch without cached data") and avoids the TanStack Query default of `isPending = isLoading && isFetching`, which would flash the skeleton even when the operator already has rows on screen.
- **Add `useAdminTabStatus(tab)` to the admin context rather than calling `useQuery` directly in `AdminPanel.tsx`.** Centralising the hook keeps the loading/error contract testable in isolation and prevents drift across the three tabs.
- **Drive the shimmer animation through the `motion-safe` design token.** The design tokens already expose a motion-safety guard, so wrapping the shimmer keyframes with `@media (prefers-reduced-motion: reduce) { animation: none; }` reuses the existing primitive rather than introducing a parallel motion utility.
- **Reuse the existing `<Badge tone="warning">` for the "Stale data" label.** The badge is already exported from the design-system barrel; introducing a new `StaleDataBadge` atom would not pass `bun run check:atomic-layers`.

## Risks / Trade-offs

- Skeleton shimmer may trigger motion-sensitivity complaints. → Mitigated by honouring `prefers-reduced-motion` via the existing `motion-safe` token and asserting in the unit test that the shimmer falls back to a static render.
- `isPending = isFetching && !data` could leave a skeleton visible for an unusually long fetch if the API Worker is genuinely slow. → Mitigated by the existing 5 s "skeleton persists across slow fetches" scenario, which bounds the skeleton expectation and gives operators a known upper bound before content shifts in.
- The `useAdminTabStatus` hook duplicates TanStack Query state that the cache already tracks. → Acceptable trade-off: the hook is a thin, typed view-model over the existing query key and avoids threading `useQuery` results through three independent `AdminPanel` subtrees.
- Adding a "Stale data" badge changes the page header height on failure, which can shift sibling layout. → Mitigated by reserving header height via the existing `PageShell` header slot rather than a flex collapse.

## Migration Plan

1. Land the new `<TableSkeleton />` organism first (design-system only, behind its own Ladle story and snapshot test). No app surface changes yet, so this is a no-op for operators.
2. Land the `useAdminTabStatus` hook in the admin context with no consumer changes. Verified by `bun run check` (TypeScript + Biome).
3. Land the `AdminPanel.tsx` rendering changes — skeleton, banner, and stale-data badge — as a single commit so the three behaviours ship together and the gherkin parity suite can assert them in one run.
4. Land the gherkin feature + unit test in the same commit as the rendering change.
5. Update `docs/operations.md` in the final commit so the docs match the shipped contract.
6. Rollback: each commit is independently revertible. Reverting step 3 alone restores the legacy behaviour; reverting step 1 removes the new organism.