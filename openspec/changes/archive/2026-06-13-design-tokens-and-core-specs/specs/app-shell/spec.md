## MODIFIED Requirements

### Requirement: App Frame
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/Navbar.tsx`.

The app frame SHALL preserve the visible page shell.

#### Scenario: Visible elements render
- **WHEN** any primary page is displayed
- **THEN** a sticky top navigation is visible above a centered main content area
- **AND** the page background and text colors resolve to the brand palette tokens from the `design-tokens` spec
- **AND** main content uses a wide max-width container with responsive horizontal and vertical padding

#### Scenario: Visual parity is preserved
- **WHEN** the frame renders
- **THEN** navigation uses a white surface, dark bottom border, compact height on mobile, taller height on desktop, and right-aligned control groups
- **AND** every color, border, and shadow value resolves through the `design-tokens` spec (no magic hex values)

#### Scenario: Data requirements are met
- **WHEN** the frame renders
- **THEN** required display data is the current hydrated `Viewer` from the `viewer-session` spec, the selected language from the `i18n-copy` spec, visible navigation labels, saved count, credit count, and optional status message text

### Requirement: Navigation
This requirement SHALL use legacy reference path: `_old_app/components/Navbar.tsx`.

Navigation SHALL adapt visible controls to guest, member, admin, and partner contexts without preserving legacy navigation internals.

#### Scenario: Guest navigation renders
- **WHEN** the `Viewer` from the `viewer-session` spec is a Guest
- **THEN** the logo appears on the left
- **AND** large screens show Discover, How it works, Membership, and FAQ actions targeting the public routes from the `routing` spec
- **AND** the logo area shows the curated cultural access tagline on medium and larger screens
- **AND** public non-landing pages show a context-aware Login or Become a member action

#### Scenario: Member navigation renders
- **WHEN** the `Viewer` is a Member
- **THEN** navigation shows Current access, FAQ, saved events, bookings, language toggle, credits badge, profile icon, and logout icon
- **AND** saved events displays a count badge when count is greater than zero
- **AND** text labels may hide on smaller screens while icons remain visible

#### Scenario: Operational navigation renders
- **WHEN** the `Viewer` is a Partner or Admin
- **THEN** navigation keeps logo, language toggle, and logout controls visible
- **AND** page-level operational tabs or tools appear inside the page content, not as legacy shell behavior

#### Scenario: User interactions render
- **WHEN** a navigation item corresponds to the current visible route from the `routing` spec
- **THEN** it uses the active brand color and dark border tokens from the `design-tokens` spec
- **WHEN** logout/profile/saved/bookings/language controls are selected
- **THEN** the control visibly responds with hover/active state drawn from the motion and color tokens

#### Scenario: Data requirements are met
- **WHEN** navigation renders
- **THEN** required display data is `Viewer.kind`, the selected language from the `i18n-copy` spec, visible labels, saved count, credit count, and the route-derived active page indicator

### Requirement: Language Toggle
This requirement SHALL use legacy reference path: `_old_app/components/Navbar.tsx`.

The app shell SHALL expose a persistent DE/EN language selector that reflects the selected language as a route parameter.

#### Scenario: Visible elements render
- **WHEN** navigation is visible
- **THEN** `DE` and `EN` controls appear in a compact bordered segmented group
- **AND** the colors and border resolve through the `design-tokens` spec

#### Scenario: User interactions render
- **WHEN** a language is selected
- **THEN** the active language uses the dark-fill and light-text tokens from the `design-tokens` spec
- **AND** inactive language controls remain muted and interactive
- **AND** the app transitions the active URL route to prepend the selected language prefix (e.g. from `/de/...` to `/en/...`), keeping the same subpaths and query parameters
- **AND** the language preference resolution order from the `i18n-copy` spec is honored (URL → cookie → database)

#### Scenario: Data requirements are met
- **WHEN** language toggle renders
- **THEN** required display data is the current language derived from the URL prefix per the `i18n-copy` spec, and localized labels/copy for the visible page
