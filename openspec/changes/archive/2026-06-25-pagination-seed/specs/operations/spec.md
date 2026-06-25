## MODIFIED Requirements

### Requirement: Operational Flow Regression Coverage

The app SHALL have automated regression coverage for legacy-visible
partner and admin operational flows, including the paginated reads
that those flows depend on.

#### Scenario: Partner check-in flow is covered

- **WHEN** a seeded partner or venue check-in flow successfully
  checks in an eligible booking
- **THEN** the suite verifies booking status, checked-in state, and
  the affected partner or venue-visible rows refresh to the new used
  state.

#### Scenario: Admin mutation flows are covered

- **WHEN** a seeded admin mutates event, partner, or member state
  through covered operational controls
- **THEN** the suite verifies the underlying result, the affected
  operational read models, and the visible route smoke assertions
  reflect the change.

#### Scenario: Operational authorization failures are covered

- **WHEN** a guest, member, or wrong partner scope attempts a
  protected operational flow
- **THEN** the suite verifies a safe visible failure or denied
  outcome and no protected operational rows are exposed.

#### Scenario: Admin pagination reads are covered against the pagination seed

- **WHEN** a seeded admin opens the events tab at `pageSize = 20`
  against the `--profile pagination` dataset
- **THEN** the suite asserts that the first page renders 20 event
  rows, that pages 2 and 3 each render 20 additional rows, and that
  the "Next page" control advances the active page.

- **WHEN** a seeded admin opens the partners tab at `pageSize = 20`
  against the `--profile pagination` dataset
- **THEN** the suite asserts that the first page renders 20 partner
  rows, that page 3 contains seeded partners, and that the page-size
  control changes the rendered subset.

- **WHEN** a seeded admin opens the members tab at `pageSize = 20`
  against the `--profile pagination` dataset
- **THEN** the suite asserts that the first page renders 20 member
  rows, that page 3 contains seeded members, and that the
  freeze/unfreeze action remains available across paginated views.
