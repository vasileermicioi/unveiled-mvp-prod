## 1. Shared Query Contracts

- [x] 1.1 Create shared data-access module structure for repositories, loaders, mappers, query keys, fetchers, and hooks.
- [x] 1.2 Define typed TanStack Query key factories for public discovery, member discovery/saved events, bookings, profile/wallet/preferences, partner guests, and admin dashboard/events/partners/members.
- [x] 1.3 Define invalidation hint types and helpers that Astro Actions/API routes can return and React islands can consume.
- [x] 1.4 Add default query stale-time conventions for public metadata, capacity-sensitive data, credit state, booking state, partner guest state, and admin data.

## 2. Server Repositories And Mappers

- [x] 2.1 Implement public discovery repository reads for featured events, active partners, stats, filter options, and category data.
- [x] 2.2 Implement member repository reads for personalized discovery state, saved events, bookings, profile, wallet, and preferences.
- [x] 2.3 Implement partner repository reads for partner identity, event options, guest lists, redemption/check-in state, and exports.
- [x] 2.4 Implement admin repository reads for dashboard overview, events, partners, members, booking/credit summaries, and operational rows.
- [x] 2.5 Implement display view-model mappers for event, booking, profile, wallet, preference, partner guest, admin event, admin partner, and admin member data.

## 3. Authorized Loaders And Fetchers

- [x] 3.1 Implement public route loaders that return display-ready public discovery and partner preview data without requiring a session.
- [x] 3.2 Implement member route loaders that verify session/role before reading member-owned rows.
- [x] 3.3 Implement partner route loaders that verify partner role and partner ownership before reading guest or venue rows.
- [x] 3.4 Implement admin route loaders that verify admin role before reading administrative rows.
- [x] 3.5 Add API/route fetchers for hydrated islands that reuse loader/repository output shapes and return safe unauthorized errors.

## 4. React Query Integration

- [x] 4.1 Add TanStack Query hooks for public discovery, member discovery/saved events, bookings, profile/wallet/preferences, partner guests, and admin data.
- [x] 4.2 Wire SSR initial data into hydrated islands using the same query keys and response shapes as client refetches.
- [x] 4.3 Replace the health-check-only query example pattern with product query usage where migrated surfaces need client refetching.
- [x] 4.4 Ensure loading, refetching, empty, stale, and unauthorized states render stable display data.

## 5. Pages And Mutation Invalidation

- [x] 5.1 Update public pages to load initial discovery, partner, stats, and filter display data through route-level loaders.
- [x] 5.2 Update member pages/islands to load and refresh saved events, bookings, credit/profile/preference data through shared query hooks.
- [x] 5.3 Update partner portal pages/islands to load and refresh guest lists, event options, and check-in state through shared query hooks.
- [x] 5.4 Update admin pages/islands to load and refresh dashboard, event, partner, and member data through shared query hooks.
- [x] 5.5 Update Astro Actions/API mutation responses for saves, bookings, profile/preferences, check-in, admin events, partners, and members to include affected invalidation hints.
- [x] 5.6 Update client action helpers to invalidate or refetch all returned query hints after successful mutations.

## 6. Verification

- [x] 6.1 Add unit tests for query key factories, invalidation hint mapping, and view-model mappers.
- [x] 6.2 Add authorization tests proving member, partner, and admin loaders reject unauthorized requests before protected reads.
- [x] 6.3 Add integration tests or route-level checks for SSR initial data and hydrated query refetch behavior on representative public, member, partner, and admin surfaces.
- [x] 6.4 Run typecheck, build, and relevant test suites.
- [x] 6.5 Confirm migrated data access code does not import `_old_app/store.ts`, `_old_app/queryClient.ts`, Firebase listeners, Firestore, Firebase Functions, or Firebase Auth runtime modules.
