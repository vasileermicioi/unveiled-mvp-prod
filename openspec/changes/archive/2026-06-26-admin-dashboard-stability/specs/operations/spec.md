## ADDED Requirements

### Requirement: Admin Tabs Render A Loading Skeleton On First Paint And During Refetch

The admin operations tabs (`events`, `partners`, `members`) SHALL render a deterministic loading skeleton for the active tab on first paint and during any subsequent refetch where the active query has no cached data, so the admin never sees an empty table where data is expected.

#### Scenario: First paint renders a skeleton
- **WHEN** an authenticated admin opens the admin page on a fresh session with no cached query data for the active tab
- **THEN** the first paint renders a `<TableSkeleton />` that mirrors the active tab's column layout
- **AND** no empty "no rows" placeholder is visible before the first successful fetch resolves

#### Scenario: Skeleton persists across slow fetches
- **WHEN** the active tab's fetch has not yet resolved and the elapsed time since the request started is less than 5000 ms
- **THEN** the skeleton remains visible in place of the table rows

#### Scenario: Pagination refetch without cached data renders a skeleton
- **WHEN** an admin clicks the "Next page" control in a tab where the next page is not already in the TanStack Query cache
- **THEN** the active tab renders the skeleton for that tab while the new page is in flight

### Requirement: Admin Tab Fetch Failures Surface As A ShellStatusBanner With Retry

The admin operations tabs SHALL surface every fetch failure for the active tab as a `<ShellStatusBanner type="error">` with a "Retry" action that re-issues the failed query, so operators never read silently stale data.

#### Scenario: 5xx response renders an error banner with retry
- **WHEN** the API Worker returns a 5xx response for the active tab's query
- **THEN** the tab renders a `ShellStatusBanner` with `type="error"` above the table region
- **AND** the banner exposes a "Retry" action

#### Scenario: Retry re-issues the failed fetch
- **WHEN** an admin clicks the "Retry" action on the error banner
- **THEN** the failed query is re-issued via TanStack Query `refetch()`
- **AND** on success the banner is dismissed and the active tab renders the fresh rows

#### Scenario: Cached data is labelled stale on a subsequent failure
- **WHEN** the active tab has cached data from a prior successful fetch and the most recent refetch fails
- **THEN** the admin page header shows a "Stale data" badge next to the page title
- **AND** the cached rows remain visible below the error banner
- **AND** the error banner's "Retry" action is available

### Requirement: Admin Context Exposes Per-Tab Fetch Status

The admin operations context SHALL expose a `useAdminTabStatus(tab)` hook that returns the active TanStack Query status for the requested admin tab so the UI can drive deterministic loading and error states per tab.

#### Scenario: Hook returns the active tab's fetch state
- **WHEN** any admin component calls `useAdminTabStatus("events" | "partners" | "members")`
- **THEN** the hook returns an object `{ data, isPending, isError, refetch }` sourced from the TanStack Query for that tab

#### Scenario: Hook status reflects an in-flight refetch
- **WHEN** the active tab's TanStack Query is currently fetching and no cached data exists for the requested page
- **THEN** the hook returns `isPending: true` and `isError: false`

#### Scenario: Hook status reflects a failed refetch with cached data
- **WHEN** the active tab's TanStack Query most recently failed but a prior successful fetch is still in the cache
- **THEN** the hook returns `isError: true`, `data` non-null, and a `refetch` callback