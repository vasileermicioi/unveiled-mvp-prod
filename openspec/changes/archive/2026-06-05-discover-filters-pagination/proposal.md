## Why

Currently, event loading and discovery on the Unveiled platform does not support page-by-page traversal or robust query resets when changing filters. Enabling pagination and immediate filter query updates ensures users can efficiently navigate through events without being overwhelmed, while providing an instant, responsive user experience as filters are tweaked.

## What Changes

- **Filter Panel Synchronizations**: Category, partner, and date range inputs propagate changes instantly to the global filter state.
- **Refetch Mechanism**: React Query detects filter state updates and immediately refetches results based on the updated query keys.
- **Pagination Reset**: Modifying any search filter (category, partner, startDate, or endDate) resets the pagination page parameter back to page 1 (`undefined`).
- **Pagination Limits**: Events load in pages of at most 6 events. Previous and Next buttons allow traversing pages.
- **Pagination Bounds**: The "Previous" button is disabled on page 1, and the "Next" button is disabled when `hasMore` is false.

## Capabilities

### New Capabilities
- `discover-filters-pagination`: Specify the discover page filtering and limit/offset pagination mechanism.

### Modified Capabilities

## Impact

- **Frontend Components**:
  - `src/components/unveiled/PublicDiscover.tsx`: Event grid rendering, limit page size to 6, and pagination buttons.
  - `src/components/unveiled/context.tsx`: State synchronization, query updates, page resets, and the `useLiveDataView` hook.
  - `src/components/unveiled/DiscoveryFilterPanel.tsx`: Event filtering logic.
- **Backend Loader / API**:
  - `src/pages/api/data-access/[surface].json.ts` & data loaders: Ensure pagination parameters are correctly parsed and handled on the server.
