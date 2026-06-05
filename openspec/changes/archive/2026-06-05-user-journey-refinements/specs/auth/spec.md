## ADDED Requirements

<!-- None -->

## MODIFIED Requirements

### Requirement: Authorized Member Data And Actions
Auth helpers SHALL ensure member-only route data and actions operate only on the authenticated member's own data.

#### Scenario: Member route data is loaded
- **WHEN** member discovery, saved, bookings, profile, membership, or shell data is loaded
- **THEN** repositories receive the authenticated member identity and return only authorized member data

#### Scenario: Member action is submitted
- **WHEN** a member submits onboarding, saved event, profile, preference, billing, newsletter, language, booking, or waitlist actions
- **THEN** the action authorizes against the authenticated member identity before mutating data

#### Scenario: Member onboarding preferences are synchronized
- **WHEN** an authenticated member submits onboarding preferences (including districts, interests, weekdays, and languages)
- **THEN** the onboarding action validates the inputs against schema constraints
- **AND** updates the profile language
- **AND** persists the preferences reliably to the database
