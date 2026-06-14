## Purpose

Define the shared app frame and navigation using `_old_app/` only as a visual reference.
## Requirements
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

### Requirement: Target-Native Shell Composition
The app shell SHALL recreate the visible legacy frame using migrated target UI-system primitives and target-native layout components.

#### Scenario: Primary shell frame renders
- **WHEN** a primary page renders inside the shell
- **THEN** the viewport uses the brand-yellow page background with brand-dark text
- **AND** a sticky white navigation/header appears above the page content with a dark bottom border
- **AND** the main content is centered in a wide responsive container with mobile and desktop padding matching the legacy shell intent

#### Scenario: Shell uses migrated UI foundation
- **WHEN** shell components render buttons, badges, panels, state wrappers, or icon controls
- **THEN** they use the already migrated UI-system tokens and primitives
- **AND** they do not introduce a parallel shell-specific visual system

#### Scenario: Legacy app remains reference-only
- **WHEN** the shell is implemented
- **THEN** no runtime code, state management, routing internals, or framework-specific implementation is imported from `_old_app/`
- **AND** `_old_app/` remains unmodified

### Requirement: Shell Navigation Variants
The app shell SHALL render guest, member, partner, and admin navigation variants from shell display data.

#### Scenario: Guest navigation renders
- **WHEN** the viewer context is guest
- **THEN** the navigation shows logo, optional curated cultural access tagline, public navigation actions, language toggle, and context-aware Login or Become a member action
- **AND** the current public page action uses the active brand-yellow and dark-border treatment

#### Scenario: Member navigation renders
- **WHEN** the viewer context is member
- **THEN** the navigation shows Current access, FAQ, saved events, bookings, credits, profile, language toggle, and logout controls where display data marks them visible
- **AND** saved events and credits render their count/badge values when provided

#### Scenario: Operational navigation renders
- **WHEN** the viewer context is partner or admin
- **THEN** the navigation keeps logo, language toggle, and logout controls visible
- **AND** operational tabs, filters, exports, and management tools remain page-local content rather than required global-shell controls

#### Scenario: Responsive navigation renders
- **WHEN** navigation is displayed on small viewports
- **THEN** secondary text labels can collapse while required icons, active state indicators, count badges, language controls, and logout/profile controls remain reachable

### Requirement: Shared Page Shell Containers
The app shell SHALL provide reusable containers for page title areas, breadcrumbs when present, top-bar actions when present, and shell-level status placement.

#### Scenario: Page container renders
- **WHEN** page content is placed inside the shared shell container
- **THEN** it inherits consistent max-width, responsive spacing, and vertical rhythm from the shell
- **AND** page-specific content remains supplied by page components

#### Scenario: Breadcrumbs render when present
- **WHEN** breadcrumb display data is provided
- **THEN** breadcrumbs appear in the page title/top-bar area before or alongside the page heading
- **AND** each breadcrumb label and active/current state is visible without requiring legacy routing internals

#### Scenario: Top-bar actions render when present
- **WHEN** top-bar action display data is provided
- **THEN** actions appear in the page title/top-bar area using migrated button/icon primitives
- **AND** disabled, loading, active, and count states use migrated UI-system control treatments

#### Scenario: Status banners render
- **WHEN** shell status messages are provided
- **THEN** venue check-in, membership, frozen-account, or other shell-level notices render near the top of the relevant page container using the legacy high-contrast placement and migrated panel primitives

### Requirement: Global State Layout Wrappers
The app shell SHALL expose shared loading, error, and empty wrappers for page-level states.

#### Scenario: Loading wrapper renders
- **WHEN** a page-level loading state is provided
- **THEN** the shell renders a branded loading surface in the page content area without changing navigation/header visibility

#### Scenario: Error wrapper renders
- **WHEN** a page-level error state is provided
- **THEN** the shell renders a branded error surface with visible message text and optional retry action

#### Scenario: Empty wrapper renders
- **WHEN** a page-level empty state is provided
- **THEN** the shell renders a branded empty surface with visible title, explanatory text, optional icon, and optional CTA

### Requirement: Discovery And Modal Shell Containers
The app shell SHALL provide reusable structural containers for discovery and full-screen modal flows without owning page-specific content.

#### Scenario: Discovery shell structure renders
- **WHEN** discovery-style content uses the shell container
- **THEN** it can render active range summary, visible count, filter toggle, map toggle, collapsible panel area, grid content slot, and empty-state slot in the legacy shell structure
- **AND** opening filters can close map and opening map can close filters through caller-provided state/actions

#### Scenario: Modal shell structure renders
- **WHEN** a full-screen modal flow is active
- **THEN** the shell provides a viewport-covering brand-yellow modal layer with logo/header area, large close control, scrollable content region, and responsive one/two-column content support
- **AND** modal-specific body content remains supplied by the feature component

### Requirement: Authenticated Shell Hydration
The app shell SHALL be able to render from server-resolved Better Auth session and domain profile data.

#### Scenario: Guest shell renders from missing session
- **WHEN** no valid Better Auth session is present
- **THEN** the shell viewer context is guest and shows guest navigation, language controls, and public primary actions.

#### Scenario: Member shell renders from profile
- **WHEN** a signed-in user has role `USER`
- **THEN** the shell viewer context is member and shows member navigation, saved count, credit count, profile control, language control, and logout control from hydrated profile data.

#### Scenario: Partner shell renders from profile
- **WHEN** a signed-in user has role `PARTNER`
- **THEN** the shell viewer context is partner and keeps operational controls page-local while showing global logo, language, and logout controls.

#### Scenario: Admin shell renders from profile
- **WHEN** a signed-in user has role `ADMIN`
- **THEN** the shell viewer context is admin and keeps operational controls page-local while showing global logo, language, and logout controls.

### Requirement: Shell Auth Actions
The app shell SHALL expose auth-related actions that route to Better Auth-backed behavior.

#### Scenario: Logout is selected
- **WHEN** a signed-in viewer selects logout from the shell
- **THEN** the app clears the Better Auth session and returns the viewer to a guest-safe route.

#### Scenario: Profile action is selected
- **WHEN** a member selects the profile shell action
- **THEN** the app routes to the authenticated profile surface only if a valid session remains present.

### Requirement: Navigation Uses URL Routes
Shell navigation SHALL navigate to stable route URLs for product surfaces prefixed by the active route language parameter, and derive selected state from the current route.

#### Scenario: Nav item is selected
- **WHEN** a shell nav item is activated
- **THEN** the browser navigates to the route for that product surface
- **AND** the selected nav item is derived from the current route.

#### Scenario: Guest navigation targets public routes
- **WHEN** guest navigation renders
- **THEN** Discover, How it works, Membership, and FAQ controls target `/[lang]/discover`, `/[lang]/how-it-works`, `/[lang]/membership`, and `/[lang]/faq`.

#### Scenario: Member navigation targets member routes
- **WHEN** member navigation renders
- **THEN** Current access, saved events, bookings, and profile controls target `/[lang]/app`, `/[lang]/saved`, `/[lang]/bookings`, and `/[lang]/profile`.

#### Scenario: Operational navigation targets operational routes
- **WHEN** partner or admin navigation renders
- **THEN** global operational entry points target `/[lang]/partner` for partners and `/[lang]/admin` for admins.

#### Scenario: Mobile nav renders route controls
- **WHEN** the shell renders on small screens
- **THEN** all role-relevant product routes remain reachable without exposing demo or workbench-only controls.

### Requirement: Shell Active State Is Route-Derived

The app shell SHALL use route display data as the source of truth
for active navigation state. The shell SHALL also expose accessible
attributes on the language toggle, the hamburger button, and the
mobile drawer so assistive technology can navigate them.

#### Scenario: Current route is public

- **WHEN** a public page renders
- **THEN** the matching public navigation action receives active
  treatment when it exists in the visible shell.

#### Scenario: Current route is protected

- **WHEN** a member, partner, or admin page renders
- **THEN** the matching role-specific navigation action receives
  active treatment.

#### Scenario: Hydrated interactions do not replace route state

- **WHEN** hydrated shell controls handle local UI state
- **THEN** they do not change the primary active product surface
  without a URL navigation.

#### Scenario: Language toggle is announced as a grouped control

- **WHEN** the language toggle is rendered
- **THEN** the toggle's wrapper element has `role="group"`
- **AND** it has `aria-label` set to the localized language-group
  key
- **AND** each language option has `aria-pressed` set to `true`
  when active and `false` otherwise.

#### Scenario: Hamburger button is announced as a disclosure

- **WHEN** the shell renders on a viewport below 1024px
- **THEN** the hamburger button has `aria-expanded` set to `false`
  when the drawer is closed and `true` when the drawer is open
- **AND** it has `aria-controls` set to the drawer's stable id.

#### Scenario: Mobile drawer is announced as a modal dialog

- **WHEN** the mobile drawer is open
- **THEN** the drawer element has `role="dialog"`
- **AND** it has `aria-modal="true"`
- **AND** it has `aria-labelledby` pointing at the drawer's
  localized heading element.

### Requirement: Bilingual Shell Copy Parity

The app shell SHALL render legacy-equivalent German and English
copy for shared navigation, language controls, status banners, and
shell-level state wrappers. Every shell-rendered string SHALL be
sourced from the typed `i18n.shell.*` bundle exported from
`src/lib/i18n.ts`, and the type checker SHALL fail `bun run check`
if a key is added to one language and not the other.

#### Scenario: Guest shell language persists

- **WHEN** a guest switches between `DE` and `EN`
- **THEN** the navigation labels, public shell actions, and shell
  status messages render in the selected language
- **AND** the preference is preserved in the URL route and is set
  in the language cookie across reloads.

#### Scenario: Authenticated shell language persists

- **WHEN** an authenticated viewer switches between `DE` and `EN`
- **THEN** member navigation labels, credits/saved/bookings/profile
  controls, and shell status messages render in the selected
  language
- **AND** the preference is updated in the URL route and saved to
  the profile.

#### Scenario: Shell wrappers use selected language

- **WHEN** shell-level loading, empty, error, frozen-account, or
  membership attention states are visible
- **THEN** their visible messages and action labels use the
  selected language without mixing stale copy from a previous
  language.

#### Scenario: Shell copy parity is type-enforced

- **WHEN** a contributor adds a new key to the DE `shell.*` bundle
  or removes one
- **THEN** `bun run check` reports a type error if the EN bundle
  is not updated to match.

#### Scenario: Shell has no hard-coded English literals

- **WHEN** the shell header, mobile drawer, or language toggle
  renders
- **THEN** every user-visible string is sourced from
  `copyFor(shell.language.selected).shell.*`
- **AND** no hard-coded English literal is rendered as a
  user-visible string.

### Requirement: Collapsible Mobile Navigation Drawer

The app shell SHALL provide a responsive mobile header on narrow
screens containing a hamburger toggle button that reveals a
collapsible slide-in navigation drawer. The hamburger button and
the drawer SHALL expose the disclosure + dialog relationship
described by the "Accessible Mobile Navigation Drawer" requirement
in the `shell-aria-i18n` capability.

#### Scenario: Mobile drawer is toggled

- **WHEN** the viewer is on a viewport below 1024px and clicks the
  hamburger menu button
- **THEN** the navigation drawer transitions into view from the
  side using a smooth CSS transition
- **AND** displaying all role-relevant navigation links, language
  selector, and logout controls.

