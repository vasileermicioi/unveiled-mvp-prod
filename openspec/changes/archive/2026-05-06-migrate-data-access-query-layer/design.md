## Context

The legacy app used Firebase snapshot listeners and `_old_app/store.ts` to keep UI state current. The target app now has Better Auth, Drizzle/Postgres domain tables, Astro Actions, and TanStack Query, but it only demonstrates client querying through the workbench health-check example.

Existing server-side mutation modules already use Drizzle directly for auth profile, booking, payment, admin, and job workflows. This change adds the missing read side: typed repositories/loaders, view-model mapping, SSR prefetch/hydration, and query invalidation rules for the migrated product pages.

## Goals / Non-Goals

**Goals:**

- Provide typed server loaders for public, member, partner, and admin product surfaces.
- Define stable TanStack Query keys and invalidation helpers shared by Astro Actions/API routes and React islands.
- Support Astro SSR route loading and hydrated island initial data without exposing database row shapes to UI components.
- Enforce session, role, and ownership checks before protected rows are queried.
- Replace realtime listener assumptions with explicit stale-time, refetch, and invalidation behavior.

**Non-Goals:**

- Add missing database tables or rewrite the domain schema.
- Implement business mutations beyond returning or consuming query invalidation hints.
- Redesign UI components or change visible product behavior except where loading/error states need data access support.
- Add a broad typed RPC framework before the route/action fetcher approach proves insufficient.

## Decisions

1. Use server-owned repositories plus route loaders.

   Repository modules will group Drizzle reads by domain surface, while route loaders compose repositories with auth and mapping. This keeps database access on the server and lets Astro pages own the data they render. Alternative considered: call Drizzle directly from pages and API handlers. Rejected because authorization, mapping, and query semantics would drift across routes.

2. Keep client query hooks behind fetcher endpoints, not direct DB access.

   React islands will use TanStack Query hooks that call server endpoints or receive SSR-provided initial data. Mutations remain Astro Actions/API routes. Alternative considered: introduce a generated RPC/client layer now. Rejected for this migration because simple route fetchers are enough and reduce framework commitment.

3. Define query keys centrally by surface and entity ownership.

   Query keys will live in a shared module and encode scope such as public discovery filters, member user ID, partner ID, admin dashboard filters, and entity IDs. Actions will return invalidation hints using these keys. Alternative considered: local string keys inside each component. Rejected because mutation invalidation would be incomplete and hard to audit.

4. Map rows to display view models at the loader boundary.

   Loaders will return UI-facing models aligned with `display-data` requirements. Database rows and relation shapes stay internal to repositories. Alternative considered: return raw joined rows to components. Rejected because it couples UI to schema details and makes legacy visual parity harder to preserve.

5. Prefer SSR data for first route render and hydrate only interactive islands.

   Astro pages should load initial public/member/admin/partner data server-side when the route owns that surface. React islands receive stable initial data for interactive filtering, saved state, booking/profile panels, or admin tables. Alternative considered: client-only loading for all surfaces. Rejected because it regresses first render, authorization handling, and route-level ownership.

## Risks / Trade-offs

- Stale data after booking or admin edits -> Mitigation: define explicit invalidation hints for event detail, discovery lists, bookings, credits, partner guest lists, and admin dashboards.
- Over-fetching admin data -> Mitigation: add surface-specific loaders with filter/pagination inputs instead of one large admin snapshot.
- Authorization mistakes in reusable repositories -> Mitigation: route loaders perform session/role/ownership checks before calling protected read functions, and tests cover unauthorized requests.
- Hydration mismatch between SSR initial data and client query data -> Mitigation: use stable query keys, serializable view models, and matching loader/fetcher outputs.
- Stale-time choices may be imperfect at first -> Mitigation: use conservative defaults for credits, capacity, booking state, and admin operations; allow longer stale time for public discovery metadata.

## Migration Plan

1. Add the shared query key and invalidation hint contracts.
2. Add repository/read modules and mappers for the public discovery, member, booking, profile, partner, and admin surfaces.
3. Add route loaders and fetcher endpoints for hydrated islands.
4. Wire pages and React islands to SSR initial data and TanStack Query hooks.
5. Update Astro Actions/API mutation responses to return invalidation hints and client helpers to consume them.
6. Remove runtime dependence on `_old_app/store.ts`, Firebase listeners, and the health-check-only query example as product data access becomes available.

Rollback is scoped by surface: if a migrated loader or query hook fails, the affected page can temporarily keep static/mock display data while the server repository or authorization issue is corrected.

## Open Questions

- Which public discovery filters should be SSR-owned versus client-owned after the initial route render?
- Should admin tables introduce pagination immediately, or only after the initial dashboard data is migrated?
- What exact stale times should be used for discovery, saved events, credit balance, event capacity, and booking state?
