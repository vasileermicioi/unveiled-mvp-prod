## Why

The legacy app tracks member behavior (sessions, view counts, event opens, filter applies, saves, unsaves, bookings, waitlists, recent event IDs, and latest interaction timestamps). While the migrated database schema includes behavior-related fields on `user_profiles` and the admin member panel exposes some of them, tracking for event opens, filter applies, and sessions/views is not fully wired into the migrated UI flows. Restoring this analytics parity ensures that the admin member directory shows complete and accurate user activity metrics.

## What Changes

- Restore server-side tracking logic and database updates for member actions (event opens, filter applies, sessions/views).
- Wire UI interactions to trigger these tracking actions non-blockingly (i.e., asynchronously, without interrupting user navigation).
- Ensure that save/unsave actions and booking/waitlist transactions keep their behavior counters consistent with execution outcomes.
- Update the admin member panel to load and render member behavior analytics metrics.
- Ensure that behavior tracking is a safe no-op for guest/unauthenticated users.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `domain-data`: Extend `user_profiles` table definition or structure to ensure interaction counters and timestamps are fully documented and support behavior tracking.
- `data-access`: Document loaders and query logic that fetch and aggregate member behavior metrics for the admin interface.
- `forms-actions`: Document behavior tracking actions (event opens, filter applies) and their triggers within member interaction flows.
- `operations`: Document the admin view of member behavior stats (event opens, filter applies, saves, unsaves, and interaction timestamps) on the member management page.

## Impact

- `src/db/schema.ts`: Database table definitions for behavior analytics tracking columns on user profiles.
- `src/lib/data-access/loaders.ts`: Query functions for admin user data to include the resolved behavior fields.
- `src/lib/actions.ts` or related server actions: Astro server-side actions/API endpoints to process non-blocking behavior events.
- `src/components/unveiled/visual-system-app.tsx` or related components: Client-side UI triggers for event opens and filter applications.
- `src/lib/admin-operations.ts` or related: Ensure behavior tracking counters are correctly mutated during administrative adjustments.
