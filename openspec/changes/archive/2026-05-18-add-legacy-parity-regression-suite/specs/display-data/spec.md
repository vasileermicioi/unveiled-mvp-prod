## ADDED Requirements

### Requirement: Production UI Data Source Coverage
The app SHALL verify through automated regression coverage that production product routes render seeded live data rather than demo-only fixtures.

#### Scenario: Seeded discovery event renders visible fields
- **WHEN** discovery or member discovery renders a seeded event
- **THEN** the event title, partner label, date label, capacity label, and primary CTA are visible from seeded display data.

#### Scenario: Demo-only rows are absent on production routes
- **WHEN** a production route renders under the parity suite
- **THEN** known demo-only fixture names or labels are not visible unless the same values were intentionally inserted by the seeded dataset.

#### Scenario: Operational seeded rows render visible state
- **WHEN** partner, admin, bookings, saved, or profile surfaces render from seeded data
- **THEN** the visible row fields and empty or success states match the seeded role, booking, waitlist, and redemption scenarios under test.
