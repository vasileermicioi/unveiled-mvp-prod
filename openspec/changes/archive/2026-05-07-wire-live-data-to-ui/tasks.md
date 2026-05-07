## 1. Data Surface Contracts

- [x] 1.1 Define typed initial surface data props for public, member, partner, and admin route payloads.
- [x] 1.2 Add adapter helpers that expose production UI values from `PublicDiscoveryData`, `MemberData`, `PartnerData`, and `AdminData`.
- [x] 1.3 Ensure discovery filters are normalized consistently for server loaders, fetchers, and query keys.
- [x] 1.4 Fill any missing repository or mapper fields needed for featured events, partners, bookings, wallet, ledger, guests, profile, and admin rows.

## 2. Route SSR Wiring

- [x] 2.1 Update public Astro routes to pass public surface identity, filters, and initial discovery data into the React island.
- [x] 2.2 Update member Astro routes to pass member surface identity, viewer scope, filters, and initial member data into the React island.
- [x] 2.3 Update the partner route to pass partner surface identity, partner scope, and initial partner data into the React island.
- [x] 2.4 Update the admin route to pass admin surface identity and initial admin data into the React island.

## 3. React Query Hydration

- [x] 3.1 Update `VisualSystemApp` to consume the typed initial surface data instead of ignoring `initialDiscovery`.
- [x] 3.2 Seed public, member, partner, and admin TanStack Query hooks with `initialData` using matching data-access query keys.
- [x] 3.3 Ensure client refetches return the same payload shape as the SSR initial data for each surface.
- [x] 3.4 Render stable loading, error, empty, and partial-data states without falling back to demo rows.

## 4. Production Fixture Removal

- [x] 4.1 Replace production event card, category, partner option, partner card, and public stat reads with live public query data.
- [x] 4.2 Replace member saved state, visible discovery, booking, wallet, ledger, profile, and preference reads with live member query data.
- [x] 4.3 Replace partner detail, event option, guest row, guest count, and QR display reads with live partner query data.
- [x] 4.4 Replace admin dashboard count, event row, partner row, and member row reads with live admin query data.
- [x] 4.5 Move or isolate demo view-model fixtures so production product routes do not import user-facing fixture rows from `src/lib/unveiled-view-models.ts`.
- [x] 4.6 Verify `/workbench` continues to render fixture-backed examples after fixture isolation.

## 5. Mutation Refresh

- [x] 5.1 Audit existing Astro Actions that mutate saved events, bookings, wallet/ledger, profile/preferences, partner guests, and admin rows.
- [x] 5.2 Add or correct invalidation hints for each affected data-access query key after successful mutations.
- [x] 5.3 Ensure React form/action result handlers invalidate or refetch affected keys before displaying stale dependent data as current.
- [x] 5.4 Confirm mutation refresh code does not import legacy Firebase store, listeners, Functions, Firestore, or Auth runtime modules.

## 6. Verification

- [x] 6.1 Add focused tests or type-level checks for surface adapter output and SSR/client payload compatibility.
- [x] 6.2 Verify public, member, partner, and admin routes render database-backed data with seeded test data.
- [x] 6.3 Run `npm run check` and fix type, lint, or framework diagnostics.
- [x] 6.4 Run `npm run build` and fix production build regressions.
