## Why

The migrated app has Drizzle-backed domain data and TanStack Query available, but it still lacks the data access layer needed to replace Firebase snapshot listeners and the legacy singleton store. This change defines the server loaders, query keys, hydration behavior, and invalidation contracts needed for SSR pages and React islands to load product data safely.

## What Changes

- Add a typed data access capability for server-side repositories, route loaders, TanStack Query keys, and client hooks across migrated product surfaces.
- Add explicit authorization boundaries for member, partner, and admin reads before protected rows are queried.
- Add SSR prefetch and hydration conventions for pages that render initial route data and pass stable initial data into React islands.
- Add invalidation conventions so Astro Actions/API mutations refresh affected query data without Firebase realtime listeners.
- Map Drizzle rows to existing display view models instead of exposing persistence shapes directly to UI components.
- Cover public discovery, member discovery and saved events, bookings, profile/wallet/preferences, partner guest lists, and admin dashboard/events/partners/members.
- Keep business mutations in Astro Actions/API routes; client hooks may call fetchers and invalidate queries but must not call the database directly.

## Capabilities

### New Capabilities

- `data-access`: Typed server data loaders, repository/query modules, TanStack Query key conventions, SSR hydration, authorization checks, view-model mapping, and query invalidation behavior.

### Modified Capabilities

- `display-data`: Display contracts will be supplied by mapped data access view models rather than legacy store/Firebase document shapes.
- `pages`: Page requirements will distinguish server-rendered route data from hydrated React island data and require route-level ownership of loaders.

## Impact

- Affected code areas include `src/lib`, `src/pages`, `src/components/providers/query-provider.tsx`, React islands that use TanStack Query, Astro Actions/API routes, and display-data mappers.
- The old references are `_old_app/store.ts`, `_old_app/queryClient.ts`, Firebase snapshot listener behavior, and the legacy custom singleton app store.
- The change depends on the Drizzle schema/domain model and auth/session/role helpers being available for authorized reads.
- Runtime behavior shifts from implicit realtime synchronization to explicit SSR loading, stale-time choices, refetching, and query invalidation.
