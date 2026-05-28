## Why

The admin operations overview currently renders all operational data (Events, Partners, Members, and CSV Export controls) on a single scrollable viewport. As the system scales, loading and displaying all content types at once degrades UI rendering performance and creates a cluttered administrative workflow.

## What Changes

- **Tab Navigation Component:** Implement a tab navigation header (`Metrics`, `Events`, `Partners`, `Members`) at the top of the admin page.
- **URL Tab State Synchronization:** Sync the active tab state with the URL query parameters (e.g. `/admin?tab=partners`), enabling direct deep-linking to specific admin tools and maintaining the active view across page refreshes.
- **Conditional Rendering:** Update `AdminPanel` in `visual-system-app.tsx` to mount only the active section based on the URL query tab, reducing DOM node overhead.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pages`: Read query parameters to determine initial server-side tab selection, and synchronize browser URL state with the active admin tab.
- `operations`: Restructure the Admin Panel dashboard layout into tab-navigable segments, loading event, partner, and member details conditionally.

## Impact

- `src/components/unveiled/visual-system-app.tsx`: Restructure the `AdminPanel` return tree with a tab state switch and header nav list.
- `src/pages/admin.astro`: Read query parameters to determine initial server-side tab selection.
