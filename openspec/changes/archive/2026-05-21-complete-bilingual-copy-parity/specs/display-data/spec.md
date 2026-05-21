## ADDED Requirements

### Requirement: Localized Public And Member Display Data
Display models for public, member, and booking surfaces SHALL expose selected-language labels and messages needed to render German and English copy without component-level hardcoded English fallbacks.

#### Scenario: Display data includes selected language
- **WHEN** public or member display data is built for a route or shell surface
- **THEN** the display model includes the selected language used to derive localized labels and messages

#### Scenario: Public display data includes localized copy
- **WHEN** landing, discovery, how-it-works, membership, FAQ, login, or signup display data is built
- **THEN** the display model includes localized navigation labels, headings, CTAs, form labels, validation messages, and empty-state messages required by that surface

#### Scenario: Member display data includes localized copy
- **WHEN** member discovery, saved, bookings, onboarding, profile, or membership display data is built
- **THEN** the display model includes localized route landmarks, status messages, action labels, form labels, and empty-state messages required by that surface

#### Scenario: Booking display data includes localized outcomes
- **WHEN** booking, waitlist, voucher, secret-code, or booking failure display data is built
- **THEN** success text, redemption labels, waitlist messages, safe failure messages, support copy, and action labels are derived from the current selected language
