## MODIFIED Requirements

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
- **THEN** the suite asserts the core visible labels, CTA regions, lists, or tables needed to match the legacy-visible route contract under the language-prefixed routes (e.g. `/de/discover` or `/en/discover`).

### Requirement: Bilingual Route Copy Parity
Public and member page surfaces SHALL render legacy-equivalent German and English landmarks, CTAs, form copy, empty states, and modal copy according to the language derived from the URL prefix route parameter.

#### Scenario: Public routes render selected language
- **WHEN** a guest views landing, discovery, how-it-works, membership, FAQ, login, or signup surfaces with `/de/` or `/en/` route prefixes
- **THEN** the visible navigation, headings, CTA labels, form labels, validation copy, and empty-state landmarks render in the selected language

#### Scenario: Member routes render selected language
- **WHEN** an authenticated member views discovery, saved, bookings, profile, onboarding, or membership-related member surfaces with `/de/` or `/en/` route prefixes
- **THEN** the visible route landmarks, controls, form labels, status messages, and empty states render in the selected language

#### Scenario: Booking outcomes render selected language
- **WHEN** booking confirmation, waitlist success, voucher redemption, secret-code redemption, or safe booking failure state is shown
- **THEN** the visible result heading, body copy, redemption labels, support copy, and actions render in the selected language
- **AND** the state does not reuse stale copy from a previous booking outcome or previous language selection

#### Scenario: Bilingual landmarks are covered by parity smoke
- **WHEN** the parity smoke suite runs against seeded data
- **THEN** it asserts at least one German and one English public route landmark
- **AND** it asserts at least one German and one English authenticated member route landmark

#### Scenario: FAQ routes render specific answers
- **WHEN** a user views the FAQ page after selecting `DE` or `EN`
- **THEN** the FAQ accordion items display specific translated answers matching each respective question
- **AND** the page does not display the single static placeholder text

## ADDED Requirements

### Requirement: Language Route Default Redirection
The app root route `/` SHALL automatically redirect users to a language-specific page prefix based on cookies or browser headers.

#### Scenario: User visits root without locale
- **WHEN** a user requests the root `/` page path
- **THEN** the server detects the browser language preference or `unveiled_lang` cookie
- **AND** redirects the client to the matching locale-prefixed home route (e.g. `/de/` or `/en/`).
