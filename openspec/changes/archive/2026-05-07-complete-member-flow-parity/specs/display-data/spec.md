## ADDED Requirements

### Requirement: Member Discovery Display View Models
Display data SHALL provide member discovery event view models that include filterable fields, saved state, booking gate hints, and shell count values derived from authorized server data.

#### Scenario: Filtered discovery data is requested
- **WHEN** member discovery data is requested with category, partner, start date, or end date filters
- **THEN** the returned view model includes matching upcoming events, active range label, result count, active filter count, and the member saved state for each event

#### Scenario: Saved-only discovery data is requested
- **WHEN** member discovery data is requested with saved-only enabled
- **THEN** the returned view model includes only upcoming events saved by the authenticated member
- **AND** the shell saved count reflects the same authorized member state

### Requirement: Member Booking And Profile Display View Models
Display data SHALL provide member booking, wallet, profile, preference, billing, newsletter, language, and membership view models needed by member pages.

#### Scenario: Member bookings are mapped
- **WHEN** member booking display data is requested
- **THEN** confirmed and used bookings include event title, image, date, address, ticket count, redemption data, booking status, and checked-in timestamp when present

#### Scenario: Member profile shell data is mapped
- **WHEN** member shell or profile display data is requested
- **THEN** it includes profile completeness, onboarding completion, wallet credits, membership state, saved count, preference values, billing address values, newsletter preference, and language preference where available
