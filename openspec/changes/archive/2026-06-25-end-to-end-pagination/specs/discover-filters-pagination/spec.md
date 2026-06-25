## MODIFIED Requirements

### Requirement: Pagination Controls And Limits

Curated events SHALL load in pages of 6 events by default (configurable
via the `pageSize` query parameter up to a maximum of 48), with
controls allowing page-by-page traversal. The public discover endpoint
SHALL accept `page` and `pageSize` query parameters and SHALL respond
with `page`, `pageSize`, `totalCount`, and `hasMore`.

#### Scenario: Event grid lists max 6 items

- **WHEN** events are loaded on a given discovery page
- **THEN** the list contains at most `pageSize` events (default 6)
  corresponding to the current page number
- **AND** pagination controls (Previous/Next buttons with page
  indicators) render at the bottom of the grid if the total matched
  count exceeds the page size.

#### Scenario: Discover endpoint paginates with custom page size

- **WHEN** a visitor requests
  `/api/data/discover?page=2&pageSize=6`
- **THEN** the response includes events 7–12 (offset 6, limit 6)
- **AND** the response carries `totalCount`, `page=2`, `pageSize=6`,
  and `hasMore: true`.

#### Scenario: Discover endpoint clamps an oversized page size

- **WHEN** a visitor requests
  `/api/data/discover?page=1&pageSize=999`
- **THEN** the response clamps `pageSize` to 48
- **AND** the response carries `page=1`, `pageSize=48`, `totalCount`,
  and `hasMore` derived from the clamped limit.

#### Scenario: Discover deep-link preserves page and page size

- **WHEN** the visitor lands on `/discover?page=3&pageSize=24`
  (locale-prefixed, e.g. `/de/discover?page=3&pageSize=24`)
- **THEN** the grid renders events for page 3 with size 24
- **AND** the pagination control highlights page 3.

#### Scenario: Filter change resets page to 1 and keeps page size

- **WHEN** the visitor changes any active filter while on page 3 with
  `pageSize=12`
- **THEN** the URL search params drop the `page` param (or set it to
  `1`) and keep `pageSize=12`
- **AND** the fetcher refetches page 1 with `pageSize=12`.

#### Scenario: Page controls are disabled at bounds

- **WHEN** the user is on page 1
- **THEN** the "Previous" page button is disabled
- **WHEN** `hasMore` is false (the current page contains the remaining
  matching events)
- **THEN** the "Next" page button is disabled.