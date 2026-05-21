## Context

The legacy app tracks user behavior metrics (event opens, search/filter applies, sessions, view counts, and interaction history) to populate the admin panel's detailed member audit view. While the database schema in `src/db/schema.ts` includes the necessary columns on the `user_profiles` table, the tracking logic has not been fully implemented or wired into the Astro application's UI components, actions, or route loaders.

## Goals / Non-Goals

**Goals:**
- Implement Astro Server Actions (`trackEventOpen`, `trackFilterApply`) to update member behavior metrics.
- Wire the UI to invoke these actions asynchronously (non-blockingly) when a user interacts with the search filters or opens event details.
- Increment the session count correctly and update `lastSeenAt` when a member loads pages.
- Ensure that standard actions (save, unsave, booking, waitlist) update their corresponding counter fields (`savedCount`, `unsavedCount`, `bookingCount`, `waitlistCount`) as side effects.
- Display these analytics in the expanded admin member row view in the admin portal.
- Verify guest behavior remains untracked (graceful no-op).

**Non-Goals:**
- Creating third-party analytics dashboard integrations.
- Tracking metrics for guest users.

## Decisions

### 1. Client-Side Triggers and Astro Actions for Non-Blocking Tracking
- **Choice:** Use Astro Actions (`actions.trackEventOpen`, `actions.trackFilterApply`) called asynchronously from the client side.
- **Rationale:** Astro Actions provide type-safe API boundaries. Calling them asynchronously from client-side UI event handlers ensures that tracking database writes do not block or delay UI rendering, navigation, or search results fetching.
- **Alternatives Considered:** 
  - *Tracking during server-side page fetches:* This would add database write latency to the critical path of rendering pages, degrading response times.
  - *Standard REST API routes:* Lacks the built-in type-safety and RPC ergonomics of Astro Actions.

### 2. Session Count & Last Seen Update Strategy
- **Choice:** Update `sessionCount` and `lastSeenAt` on the member profile during the initial page shell load, but throttle updates to once per 15 minutes.
- **Rationale:** A user refreshing the page or navigating between tabs should not trigger continuous database updates. Checking if `lastSeenAt` is older than 15 minutes before incrementing `sessionCount` prevents database write amplification.
- **Alternatives Considered:** 
  - *Incrementing on every page load:* High database write overhead for simple navigation.

### 3. Client-Side Debouncing for Filter Tracking
- **Choice:** Debounce the `trackFilterApply` action call by 1000ms on the client side when the user interacts with inputs or checkboxes.
- **Rationale:** Prevents sending database writes for intermediate keystrokes or checkbox selections while a user is adjusting filters.
- **Alternatives Considered:** 
  - *Server-side debouncing:* Harder to coordinate across requests and still consumes server bandwidth.

### 4. Behavior Data Model Integration
- All tracking increments (e.g., `eventOpenCount`, `filterApplyCount`) and arrays (e.g., `recentEventIds` capped at 5) will be updated using atomic sql commands or transactional runs in Drizzle to prevent concurrent update anomalies.

---

## Risks / Trade-offs

### Risk: High database write volume from analytics
- **Description:** Frequently writing interaction metrics to the database can increase Neon usage costs and database load.
- **Mitigation:** Implement strict client-side debouncing for filters, throttle session increments to once per 15 minutes, and ensure tracking calls are simple, indexed updates.

### Risk: Tracking calls blocking navigation or actions
- **Description:** If tracking calls fail or hang, they might block user actions.
- **Mitigation:** Execute tracking calls in background promises (`void actions.track...()`) without awaiting them, ensuring the user experience remains fast and uninterrupted.
