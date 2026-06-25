## MODIFIED Requirements

### Requirement: Admin Dashboard Lists Pagination Controls

The admin operations interface SHALL render pagination controls for
events, partners, and members, enabling navigation across multiple
data pages and changing page size filters. The admin data fetcher
MUST send the active `page` and `pageSize` for the selected tab on
every refetch, and MUST reset the active `page` to 1 whenever the
matching `pageSize` or filter set changes.

#### Scenario: Admin navigates to the next page of members

- **WHEN** an admin clicks the "Next page" button in the member
  registry
- **THEN** the active view refetches and renders the next subset of
  member rows
- **AND** the API Worker receives
  `?membersPage=2&membersPageSize=<active-size>`.

#### Scenario: Admin navigates to the next page of partners

- **WHEN** an admin clicks the "Next page" button in the partner
  registry
- **THEN** the active view refetches and renders the next subset of
  partner rows
- **AND** the API Worker receives
  `?partnersPage=2&partnersPageSize=<active-size>`.

#### Scenario: Admin navigates to the next page of events

- **WHEN** an admin clicks the "Next page" button in the event
  registry
- **THEN** the active view refetches and renders the next subset of
  event rows
- **AND** the API Worker receives
  `?eventsPage=2&eventsPageSize=<active-size>`.

#### Scenario: Admin changes the page size of a tab

- **WHEN** an admin picks a new `pageSize` from the page-size
  dropdown in the active tab
- **THEN** the active `page` for that tab resets to 1
- **AND** the API Worker receives the new `*PageSize` query param
  with `*Page=1`.