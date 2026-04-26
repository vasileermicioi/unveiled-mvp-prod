## Purpose

Define the shared app frame and navigation using `_old_app/` only as a visual reference.

## Requirements

### Requirement: App Frame
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/Navbar.tsx`.

The app frame SHALL preserve the visible page shell.

#### Scenario: Visible elements render
- **WHEN** any primary page is displayed
- **THEN** a sticky top navigation is visible above a centered main content area
- **AND** the page background is brand yellow with brand-dark text
- **AND** main content uses a wide max-width container with responsive horizontal and vertical padding

#### Scenario: Visual parity is preserved
- **WHEN** the frame renders
- **THEN** navigation uses a white surface, dark bottom border, compact height on mobile, taller height on desktop, and right-aligned control groups

#### Scenario: Data requirements are met
- **WHEN** the frame renders
- **THEN** required display data is current viewer display state, selected language, visible navigation labels, saved count, credit count, and optional status message text

### Requirement: Navigation
This requirement SHALL use legacy reference path: `_old_app/components/Navbar.tsx`.

Navigation SHALL adapt visible controls to guest, member, admin, and partner contexts without preserving legacy navigation internals.

#### Scenario: Guest navigation renders
- **WHEN** the viewer is a guest
- **THEN** the logo appears on the left
- **AND** large screens show Discover, How it works, Membership, and FAQ actions
- **AND** the logo area shows the curated cultural access tagline on medium and larger screens
- **AND** public non-landing pages show a context-aware Login or Become a member action

#### Scenario: Member navigation renders
- **WHEN** a standard member is viewing the app
- **THEN** navigation shows Current access, FAQ, saved events, bookings, language toggle, credits badge, profile icon, and logout icon
- **AND** saved events displays a count badge when count is greater than zero
- **AND** text labels may hide on smaller screens while icons remain visible

#### Scenario: Operational navigation renders
- **WHEN** admin or partner surfaces are shown
- **THEN** navigation keeps logo, language toggle, and logout controls visible
- **AND** page-level operational tabs or tools appear inside the page content, not as legacy shell behavior

#### Scenario: User interactions render
- **WHEN** a navigation item corresponds to the current visible page
- **THEN** it uses brand-yellow active treatment with dark border
- **WHEN** logout/profile/saved/bookings/language controls are selected
- **THEN** the control visibly responds with hover/active state

#### Scenario: Data requirements are met
- **WHEN** navigation renders
- **THEN** required display data is viewer type, selected language, visible labels, saved count, credit count, and active page indicator

### Requirement: Language Toggle
This requirement SHALL use legacy reference path: `_old_app/components/Navbar.tsx`.

The app shell SHALL expose a persistent DE/EN language selector.

#### Scenario: Visible elements render
- **WHEN** navigation is visible
- **THEN** `DE` and `EN` controls appear in a compact bordered segmented group

#### Scenario: User interactions render
- **WHEN** a language is selected
- **THEN** the active language uses dark fill and white text
- **AND** inactive language controls remain muted and interactive

#### Scenario: Data requirements are met
- **WHEN** language toggle renders
- **THEN** required display data is current language and localized labels/copy for the visible page

### Requirement: Shell Status Messages
This requirement SHALL use legacy reference path: `_old_app/App.tsx`.

Global status messages SHALL be visible where users need immediate feedback.

#### Scenario: Venue status message renders
- **WHEN** a venue check-in status message exists
- **THEN** a dark bordered banner with brand-yellow text appears near the top of landing or discovery content
- **AND** visible message text covers login-needed, success, already-registered, or failure states

#### Scenario: Membership status banner renders
- **WHEN** member access requires attention in discovery
- **THEN** a dark brand-yellow banner with alert icon appears above discovery controls
- **AND** frozen copy directs the user to `support@unveiled.berlin`

#### Scenario: User interactions render
- **WHEN** the membership banner is selected
- **THEN** it behaves visually like a clickable status surface

#### Scenario: Data requirements are met
- **WHEN** shell status messages render
- **THEN** required display data is status type, localized message, optional support email, and optional target action label

### Requirement: Discovery Shell
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/EventCard.tsx`, `_old_app/components/EventMap.tsx`.

The discovery shell SHALL provide visible filtering, mapping, grid, and empty-state structure.

#### Scenario: Visible elements render
- **WHEN** discovery shell is shown
- **THEN** it displays active range panel, visible event count, filter toggle, map toggle, optional filter panel, optional map panel, event grid, and empty state

#### Scenario: User interactions render
- **WHEN** filters open
- **THEN** map closes
- **WHEN** map opens
- **THEN** filters close
- **WHEN** filters are active
- **THEN** active filter count appears in the filter toggle

#### Scenario: Visual parity is preserved
- **WHEN** shell controls render
- **THEN** they appear as large bordered white/dark panels with icons, chevrons, uppercase labels, and offset shadows

#### Scenario: Data requirements are met
- **WHEN** discovery shell renders
- **THEN** required display data is active range label, visible event count, filter count, filter field values/options, map event coordinates, and event card list

### Requirement: Modal Layer
This requirement SHALL use legacy reference path: `_old_app/components/BookingModal.tsx`.

The shell SHALL support a full-screen modal layer for event booking and redemption.

#### Scenario: Visible elements render
- **WHEN** modal layer is active
- **THEN** it covers the viewport above the app shell, uses brand-yellow background, shows logo and close control, and allows vertical scrolling

#### Scenario: User interactions render
- **WHEN** close is selected
- **THEN** the modal disappears
- **WHEN** content exceeds viewport height
- **THEN** modal content scrolls without breaking header visibility

#### Scenario: Visual parity is preserved
- **WHEN** modal content renders
- **THEN** it uses large editorial typography, high contrast panels, and responsive single/two-column layout matching the legacy visual behavior

#### Scenario: Data requirements are met
- **WHEN** modal layer renders
- **THEN** required display data is selected event summary, modal state, loading state, and close action availability
