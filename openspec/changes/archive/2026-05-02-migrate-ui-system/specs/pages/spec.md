## ADDED Requirements

### Requirement: Public Page Visual Migration
Public pages SHALL be recreated with visible page structure and responsive behavior matching their legacy references.

#### Scenario: Landing page parity
- **WHEN** the target landing page renders
- **THEN** it visually matches `_old_app/App.tsx` for hero content, CTA layout, login/register form, notices/errors, trust labels, spacing, borders, typography, and responsive stacking

#### Scenario: Public discovery parity
- **WHEN** the target public discovery page renders
- **THEN** it visually matches `_old_app/components/AccessPage.tsx` for hero panel, stat cards, value cards, featured event cards, category cards, missing-venue panel, partner cards, empty state, and responsive grids

#### Scenario: Informational pages parity
- **WHEN** How it works or FAQ pages render
- **THEN** they visually match `_old_app/components/HowItWorksPage.tsx`, `_old_app/components/FaqPage.tsx`, and `_old_app/components/HelpSection.tsx` for panels, cards, accordions, back action, support email, and mobile/desktop layout

### Requirement: Member Surface Visual Migration
Member-facing pages and components SHALL be recreated with visible structure and interactions matching their legacy references.

#### Scenario: Discovery surface parity
- **WHEN** app discovery or saved events render
- **THEN** visible filters, sorting/range labels, map panel, event grid, event cards, membership banner, venue message, no-results state, and responsive behavior match `_old_app/App.tsx`, `_old_app/components/EventCard.tsx`, and `_old_app/components/EventMap.tsx`

#### Scenario: Booking modal parity
- **WHEN** the booking modal renders
- **THEN** event detail layout, quantity selector, credit total, gate copy, waitlist success, password redemption, voucher redemption, copy-code feedback, calendar action, support link, and return action match `_old_app/components/BookingModal.tsx`

#### Scenario: Bookings and profile parity
- **WHEN** bookings or profile pages render
- **THEN** empty/list states, ticket cards, support panels, wallet card, identity panel, billing panel, vibes panel, selected states, loading states, and responsive layouts match `_old_app/components/BookingsView.tsx` and `_old_app/components/ProfileView.tsx`

### Requirement: Operational Surface Visual Migration
Partner and admin surfaces SHALL be recreated with visible structure, tables/rows, controls, and states matching their legacy references.

#### Scenario: Partner portal parity
- **WHEN** the partner portal renders
- **THEN** venue header, total guest card, QR link panel, copied state, search input, event select, download action, guest list, guest row states, disabled check-in states, empty state, and responsive layout match `_old_app/components/PartnerPortal.tsx`

#### Scenario: Admin dashboard parity
- **WHEN** the admin dashboard renders
- **THEN** dashboard heading, quick actions, metric cards, recent bookings rows, export filter, and CSV action match `_old_app/components/AdminPanel.tsx`

#### Scenario: Admin management parity
- **WHEN** admin events, partners, or users surfaces render
- **THEN** forms, rows, tables, previews, series builder, validation messages, loading/empty states, expandable member details, and action buttons match the visible behavior in `_old_app/components/AdminPanel.tsx`

