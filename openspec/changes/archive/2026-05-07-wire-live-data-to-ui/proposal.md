## Why

The app now has Drizzle-backed data-access loaders and repositories, but production React surfaces still render mostly demo view-model data and ignore route-provided initial data. This blocks parity with the legacy Firebase-backed app because users cannot consistently see database-backed events, partners, bookings, saved state, credits, guests, profile data, or admin rows.

## What Changes

- Wire public discovery UI to server-loaded data for featured events, category filters, partner options, active partner cards, and stats.
- Wire member surfaces to authorized data for visible discovery results, saved event IDs, bookings, wallet credit count, ledger rows, profile fields, and preferences.
- Wire partner surfaces to authorized data for partner details, event options, guest rows, and QR path/token display state.
- Wire admin surfaces to authorized data for dashboard counts, events, partners, and members.
- Pass route-specific initial data from Astro pages into React islands and let TanStack Query own refresh after hydration.
- Preserve explicit query invalidation or refresh after Astro Actions mutate data.
- Isolate demo display data so production product routes do not depend on `src/lib/unveiled-view-models.ts` for user-facing rows, while `/workbench` may keep using fixtures.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `data-access`: Loader and hook outputs must cover the production UI surfaces and be usable as the display-data source after SSR hydration.
- `display-data`: Production display rows must be derived from database-backed mappers instead of demo fixtures.
- `pages`: Product routes must pass route-specific initial data into islands for public, member, partner, and admin surfaces.
- `forms-actions`: Mutations must invalidate or refresh affected data-access query keys so UI state updates without realtime listeners.

## Impact

- Affected code includes `src/components/unveiled/visual-system-app.tsx`, Astro product pages, data-access loaders, repositories, hooks, query keys, and mappers.
- The `/api/data-access/[surface].json` endpoint may need shape or coverage adjustments to support the wired surfaces.
- `/workbench` remains allowed to use demo fixtures; production routes should not import display rows from `src/lib/unveiled-view-models.ts` except intentionally shared static labels.
- No new realtime transport, client data library, or visual redesign is introduced.
