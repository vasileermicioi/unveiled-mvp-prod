## ADDED Requirements

### Requirement: Route Parity Smoke Coverage
The app SHALL have automated regression coverage for every legacy-visible route surface.

#### Scenario: Route smoke suite covers owned surfaces
- **WHEN** the parity route suite executes against seeded app data
- **THEN** public, member, partner, admin, and venue check-in routes render their expected visible landmarks or redirect according to route ownership rules.

#### Scenario: Unauthorized route requests are asserted
- **WHEN** the suite requests a protected route as the wrong role
- **THEN** the expected redirect target or safe authorization state is asserted before protected route content is treated as visible.

#### Scenario: Core route landmarks remain visible
- **WHEN** landing, discover, membership, app discovery, saved, bookings, profile, partner, admin, and venue check-in surfaces render
- **THEN** the suite asserts the core visible labels, CTA regions, lists, or tables needed to match the legacy-visible route contract.
