## ADDED Requirements

### Requirement: Search & Filter UI Accessibility And Selector Discipline
The search and filter controls in the discovery filter panel SHALL be exposed as named form controls and SHALL be addressable by proximity+layout selectors (no `getByText` chains, no `data-testid` in production behavior).

#### Scenario: Filter inputs expose accessible names
- **WHEN** a screen reader user navigates to the discovery filter panel
- **THEN** every category, partner, and date-range input has an accessible name (via `<label>`, `aria-label`, or `aria-labelledby`)
- **AND** the accessible name is sourced from the i18n catalog so DE and EN localize the same key

#### Scenario: Filter inputs are selector-disciplinable
- **WHEN** a gherkin scenario or storybook `play` test needs to interact with a filter input
- **THEN** the input is addressable by role + accessible name (e.g. `getByRole('combobox', { name: /category/i })`) or by proximity to its visible label
- **AND** no production behavior is gated on `data-testid`

### Requirement: URL State Sync For Filters Sort And Page
The discovery page SHALL keep filter, sort, and page state in sync with the URL search parameters so a shared URL reproduces the same filtered view.

#### Scenario: Filter changes update the URL
- **WHEN** the visitor changes a category, partner, date range, or sort selection
- **THEN** the URL search parameters are updated via `history.replaceState` without a full navigation
- **AND** the page parameter is reset to 1

#### Scenario: Page changes update the URL
- **WHEN** the visitor uses the pagination controls to move to a different page
- **THEN** the `page` search parameter reflects the new page index
- **AND** reloading the URL restores the same filtered, sorted, paginated view

### Requirement: Polite Live Region On Results Count
The results count string SHALL be exposed as an `aria-live="polite"` region so screen reader users hear the updated count after a filter or page change without hearing the full grid re-announce.

#### Scenario: Results count announces on filter change
- **WHEN** a filter change settles and the React Query refetch completes
- **THEN** the visible count text node has `aria-live="polite"` (or `aria-atomic="true"` on the same node)
- **AND** only the count string is announced, not the entire event grid

#### Scenario: Live region does not over-announce
- **WHEN** the filter inputs are still being interacted with (intermediate loading state)
- **THEN** the live region does not update on every keystroke
- **AND** the live region only updates once the new result set is settled

### Requirement: Map Component Accessibility Labels
The Leaflet discovery map SHALL expose accessible names for the map container, markers, and the focusable interaction layer.

#### Scenario: Map container has an accessible name
- **WHEN** a screen reader user navigates to the discovery map
- **THEN** the map container has an `aria-label` (or `aria-labelledby` pointing at the visible heading) so it is announced as a labeled region

#### Scenario: Markers expose accessible names
- **WHEN** a screen reader user focuses a map marker
- **THEN** the marker has a non-empty accessible name describing the event it represents
- **AND** the accessible name is sourced from the i18n catalog

### Requirement: Calendar ICS Download Accessibility
The "Add to calendar" action SHALL expose a download anchor with an accessible name and the `.ics` filename, and SHALL be addressable by proximity+layout selectors.

#### Scenario: ICS download anchor is labeled
- **WHEN** a screen reader user reaches the "Add to calendar" action
- **THEN** the anchor has an accessible name (e.g. "Add <event title> to your calendar") sourced from the i18n catalog
- **AND** the anchor carries the `download` attribute with the `.ics` filename

#### Scenario: ICS download is selector-disciplinable
- **WHEN** a gherkin scenario or storybook test needs to trigger the download
- **THEN** the anchor is addressable by role + accessible name
- **AND** no production behavior is gated on `data-testid`

### Requirement: Filter Chips Wrapped In Search Landmark
The filter chip area SHALL be wrapped in a `<form role="search">` landmark with a visible, labeled heading so screen reader users can jump to it via the landmarks rotor.

#### Scenario: Filter chips live inside a search landmark
- **WHEN** a screen reader user scans the discovery page for landmarks
- **THEN** the filter chip area is exposed as a `search` landmark
- **AND** the landmark has a visible heading discoverable as an `aria-labelledby` target

#### Scenario: Submitting the search landmark applies the chips
- **WHEN** the visitor activates a filter chip and submits the search landmark
- **THEN** the chip's filter is applied and the page is reset to page 1
- **AND** the form's `submit` handler calls `event.preventDefault()` so no native form submission escapes
