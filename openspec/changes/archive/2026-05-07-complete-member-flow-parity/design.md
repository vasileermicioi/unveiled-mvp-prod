## Context

The current product has backend primitives for auth, display data, forms/actions, bookings, and subscriptions, plus legacy React components that show the intended member experience. The parity gap is in the route-level wiring: member pages must load authorized data, pass it into hydrated islands, submit server actions, invalidate the right queries, and reflect membership/session state consistently.

This change spans member routes, shared shell state, server action schemas, repository view models, and booking transactions. It should reuse existing backend and UI patterns rather than introduce a new client state architecture or payment provider behavior.

## Goals / Non-Goals

**Goals:**

- Make onboarding, discovery, saved events, booking/waitlist, bookings, profile, membership, and language behavior work against live authorized data.
- Keep route loaders responsible for initial member data and hydrated islands responsible for interactive refinements.
- Preserve booking and membership constraints server-side, with client UI reflecting the same gates.
- Keep visible member copy and state consistent after mutations through explicit invalidation and refreshed route/query data.

**Non-Goals:**

- Rebuild the visual design of the legacy member surfaces.
- Add new payment provider flows beyond existing subscription and checkout capabilities.
- Change admin or partner workflows except where their data appears to members.
- Replace existing repositories, schemas, or booking transaction boundaries with a new data layer.

## Decisions

### Use a dedicated onboarding route for incomplete members

Newly signed-up members or members with incomplete profile/onboarding state will be redirected to `/onboarding`. Onboarding remains a visible member step, but keeping it as a route makes refresh, auth guards, deep links, and completion redirects deterministic.

Alternative considered: model onboarding as hidden in-shell state under the discovery page. That would reduce routes but makes incomplete-member redirects and server-rendered initial state harder to reason about.

### Reuse discovery querying for saved-only views

Saved events will use the same event discovery view model and filters with a saved-only flag. This keeps card fields, empty states, counts, sorting, date range labels, and future filtering consistent between `/app` discovery and `/saved`.

Alternative considered: create a separate saved-events endpoint. That would be useful only if saved cards diverged materially, which is out of scope and would increase invalidation paths.

### Persist language through member profile/preferences when authenticated

Authenticated language selection will submit through the profile/preference action path and refresh shell/profile data. Client-only session preference can still be used for unauthenticated or pre-save surfaces, but member pages should prefer persisted preference data after login.

Alternative considered: keep language entirely client/session-local. That preserves immediate toggling but loses cross-device behavior and makes server-rendered copy inconsistent after reload.

### Treat booking results as authoritative action state

The booking modal will display success, waitlist success, or blocked states from server action results. The client can pre-disable impossible actions from loaded member/event state, but transaction code remains the source of truth for credit, capacity, membership, redemption, and idempotency constraints.

Alternative considered: rely on client state to prevent invalid booking paths. That leaves stale data and multi-tab behavior underprotected.

### Refresh member shell data after member mutations

Onboarding, saved event, booking, waitlist, profile, preference, billing address, newsletter, and language mutations will invalidate or refresh the route/query data that backs shell counts, membership banners, wallet credits, saved states, and profile summary.

Alternative considered: patch local UI state only. That is faster for narrow interactions but risks count drift and stale membership gates across surfaces.

## Risks / Trade-offs

- Membership state can change between page load and booking submit -> server transactions MUST reject stale booking attempts and return safe failure messages.
- Saved and discovery filters share query code -> the saved-only flag MUST be applied in the repository/query layer, not only in client filtering.
- Language persistence may touch profile data frequently -> the action SHOULD validate a small allowlist of supported locales and refresh shell data without requiring a full profile edit.
- Redemption data is sensitive to stale modal state -> failed booking attempts MUST clear any prior success payload before rendering the new result.
- Hydrated islands can diverge from server-rendered initial data -> mutation handlers MUST invalidate the relevant route/query keys after success.

## Migration Plan

1. Add route data and action wiring behind existing member routes without changing public route names.
2. Implement server-side validation and repository fields before connecting UI controls.
3. Wire UI surfaces incrementally: onboarding, discovery/saved, event modal, bookings, profile, membership, language.
4. Verify with seeded scenarios covering active, unpaid, frozen, insufficient credit, sold-out, waitlist, and used booking states.
5. Roll back by reverting the route/action wiring while leaving unchanged data model and subscription primitives intact.

## Open Questions

- Exact route naming for the main authenticated discovery surface should follow the current app shell convention if it differs from `/app`.
- Password recovery copy should link to the existing auth recovery route once confirmed in the current router.
