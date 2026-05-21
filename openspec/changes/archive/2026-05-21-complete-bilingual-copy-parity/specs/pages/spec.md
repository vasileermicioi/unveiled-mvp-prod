## ADDED Requirements

### Requirement: Bilingual Route Copy Parity
Public and member page surfaces SHALL render legacy-equivalent German and English landmarks, CTAs, form copy, empty states, and modal copy according to the selected language.

#### Scenario: Public routes render selected language
- **WHEN** a guest views landing, discovery, how-it-works, membership, FAQ, login, or signup surfaces after selecting `DE` or `EN`
- **THEN** the visible navigation, headings, CTA labels, form labels, validation copy, and empty-state landmarks render in the selected language

#### Scenario: Member routes render selected language
- **WHEN** an authenticated member views discovery, saved, bookings, profile, onboarding, or membership-related member surfaces after selecting `DE` or `EN`
- **THEN** the visible route landmarks, controls, form labels, status messages, and empty states render in the selected language

#### Scenario: Booking outcomes render selected language
- **WHEN** booking confirmation, waitlist success, voucher redemption, secret-code redemption, or safe booking failure state is shown
- **THEN** the visible result heading, body copy, redemption labels, support copy, and actions render in the selected language
- **AND** the state does not reuse stale copy from a previous booking outcome or previous language selection

#### Scenario: Bilingual landmarks are covered by parity smoke
- **WHEN** the parity smoke suite runs against seeded data
- **THEN** it asserts at least one German and one English public route landmark
- **AND** it asserts at least one German and one English authenticated member route landmark
