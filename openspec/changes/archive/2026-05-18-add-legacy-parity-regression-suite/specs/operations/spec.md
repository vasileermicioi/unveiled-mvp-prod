## ADDED Requirements

### Requirement: Operational Flow Regression Coverage
The app SHALL have automated regression coverage for legacy-visible partner and admin operational flows.

#### Scenario: Partner check-in flow is covered
- **WHEN** a seeded partner or venue check-in flow successfully checks in an eligible booking
- **THEN** the suite verifies booking status, checked-in state, and the affected partner or venue-visible rows refresh to the new used state.

#### Scenario: Admin mutation flows are covered
- **WHEN** a seeded admin mutates event, partner, or member state through covered operational controls
- **THEN** the suite verifies the underlying result, the affected operational read models, and the visible route smoke assertions reflect the change.

#### Scenario: Operational authorization failures are covered
- **WHEN** a guest, member, or wrong partner scope attempts a protected operational flow
- **THEN** the suite verifies a safe visible failure or denied outcome and no protected operational rows are exposed.
