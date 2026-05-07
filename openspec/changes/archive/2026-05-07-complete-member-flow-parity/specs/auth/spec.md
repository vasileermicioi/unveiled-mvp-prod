## ADDED Requirements

### Requirement: Member Onboarding Redirect Authorization
Auth routing SHALL direct authenticated members with incomplete profile or onboarding state to onboarding before member discovery while preserving role authorization.

#### Scenario: Incomplete member requests discovery
- **WHEN** an authenticated member with incomplete onboarding or profile state requests regular member discovery
- **THEN** auth-aware routing redirects them to onboarding

#### Scenario: Complete member requests onboarding
- **WHEN** an authenticated member with completed onboarding requests onboarding directly
- **THEN** auth-aware routing allows a safe redirect to member discovery or a read-only completed state according to route behavior

### Requirement: Authorized Member Data And Actions
Auth helpers SHALL ensure member-only route data and actions operate only on the authenticated member's own data.

#### Scenario: Member route data is loaded
- **WHEN** member discovery, saved, bookings, profile, membership, or shell data is loaded
- **THEN** repositories receive the authenticated member identity and return only authorized member data

#### Scenario: Member action is submitted
- **WHEN** a member submits onboarding, saved event, profile, preference, billing, newsletter, language, booking, or waitlist actions
- **THEN** the action authorizes against the authenticated member identity before mutating data
