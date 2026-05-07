## Context

Astro product routes already call server loaders such as `loadPublicDiscoveryData`, `loadMemberData`, `loadCurrentPartnerData`, and `loadAdminData`, then pass the result into `VisualSystemApp` as `initialDiscovery`. The React island currently ignores that prop, imports production-visible rows from `src/lib/unveiled-view-models.ts`, and therefore renders fixture state even when the database has real events, partners, bookings, wallet entries, guests, members, and admin records.

The data-access layer has typed loaders, repositories, TanStack Query keys, fetchers, and hooks. This change uses those pieces as the data ownership boundary and keeps `/workbench` as the place where demo view-model fixtures can remain useful.

## Goals / Non-Goals

**Goals:**

- Render production product routes from authorized server loader output instead of demo fixtures.
- Preserve route SSR by passing serializable initial surface data from Astro pages into hydrated islands.
- Reuse data-access mappers and repository return types as the UI display-data contract.
- Use TanStack Query `initialData` with existing query keys so client refetches match the SSR surface.
- Invalidate or refetch affected query keys after Astro Actions mutate saved state, bookings, profile/preferences, partner guests, admin rows, or other visible data.
- Keep demo fixtures isolated to `/workbench` and explicit examples.

**Non-Goals:**

- Introduce websocket, Firebase snapshot, or other realtime subscriptions.
- Replace TanStack Query or Astro Actions.
- Redesign the visual system.
- Add unrelated business mutations beyond the wiring needed for existing actions and surfaces.
- Change the database schema unless a missing display field cannot be derived from existing tables.

## Decisions

1. Use a typed route surface prop instead of one generic `initialDiscovery` value.

   `VisualSystemApp` should accept an initial data object that records the surface identity, viewer scope where relevant, filters, and data payload. Public, member, partner, and admin routes can still pass route-specific data from Astro, but the React side should be able to select the correct hook and query key without guessing from `unknown`.

   Alternative considered: keep the existing `initialDiscovery?: unknown` prop and cast inside page branches. That preserves fewer call sites but makes cache keys, viewer ownership, and route-specific fields easier to mismatch.

2. Keep one product island for this change, but introduce surface-specific data adapter helpers.

   A full split into route-owned islands would reduce branch weight in `VisualSystemApp`, but it is a larger structural change. For this wiring pass, keep visual behavior stable and concentrate the conversion in small helpers that turn `PublicDiscoveryData`, `MemberData`, `PartnerData`, and `AdminData` into the values each view consumes.

   Alternative considered: split public, member, partner, and admin islands immediately. That is cleaner long term, but it increases risk by combining data migration with component extraction.

3. Treat data-access repository outputs as the display-data boundary.

   Production views should read event cards, partner cards, booking rows, ledger rows, profile values, guest rows, and admin rows from loader/hook results. Static option labels can remain shared when they are intentionally non-database values. Fixture arrays from `unveiled-view-models.ts` must move behind workbench/example-only usage or be replaced at product imports.

   Alternative considered: map database rows directly inside UI components. That duplicates formatting and authorization-sensitive assumptions in the presentation layer.

4. Use TanStack Query `initialData` and existing invalidation hints after hydration.

   Each hydrated view should seed the same query key it will refetch later. Actions should continue returning invalidation hints, and React forms should invalidate/refetch those keys before presenting stale dependent values as current.

   Alternative considered: force full page reloads after every mutation. That is simpler but loses the existing client interaction model and makes local state transitions feel inconsistent.

5. Keep discovery filters local first and compatible with URL query parameters.

   The implementation should normalize filters through `normalizeDiscoveryFilters` and include them in query keys. The current scope can preserve existing local filter controls; URL synchronization can be added where pages already provide query parameters or when needed for direct-link behavior.

   Alternative considered: require URL-backed filters for all discovery views now. That broadens the change into navigation and history behavior.

## Risks / Trade-offs

- Route data shape drift between SSR loaders and client fetchers -> Use shared repository types, query keys, and adapter tests or type checks for every surface.
- Stale capacity, credit, or check-in state after mutations -> Keep conservative stale times for capacity-sensitive keys and invalidate all affected keys from action results.
- One large `VisualSystemApp` remains difficult to reason about -> Limit this change to wiring and add route/surface adapters that make later island extraction straightforward.
- Demo imports may remain indirectly reachable -> Audit product route and island imports, then move or rename fixture-only exports so production usage is explicit.
- Missing database fields may surface late during wiring -> Prefer deriving display values in mappers; only extend repositories or schema when an existing visible requirement cannot otherwise be met.

## Migration Plan

1. Add typed initial surface data and adapter helpers for public, member, partner, and admin payloads.
2. Update Astro pages to pass route-specific surface identity, filters, viewer identifiers where appropriate, and server-loaded initial data.
3. Update `VisualSystemApp` to seed and consume TanStack Query hooks using the initial surface data.
4. Replace production reads from demo fixture arrays with data from the current surface query result.
5. Keep `/workbench` fixture imports working by moving fixtures to an example/demo boundary if needed.
6. Wire mutation success paths to invalidate/refetch affected data-access query keys.
7. Verify public, member, partner, admin, and workbench routes with type checks and focused route/component tests.

Rollback is to restore production routes to the previous fixture-backed rendering while leaving data-access loaders intact. Because this change does not introduce a data migration, rollback is code-only.

## Open Questions

- Should URL query parameters become the canonical source for public discovery filters in the implementation pass, or should that remain a follow-up after live data wiring lands?
- Are there any production routes that should be split out of `VisualSystemApp` during implementation because fixture removal becomes too invasive?
