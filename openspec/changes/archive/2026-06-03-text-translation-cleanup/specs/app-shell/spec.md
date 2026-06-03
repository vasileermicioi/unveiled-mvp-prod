## MODIFIED Requirements

### Requirement: Language Toggle
This requirement SHALL use legacy reference path: `_old_app/components/Navbar.tsx`.

The app shell SHALL expose a persistent DE/EN language selector that reflects the selected language as a route parameter.

#### Scenario: Visible elements render
- **WHEN** navigation is visible
- **THEN** `DE` and `EN` controls appear in a compact bordered segmented group

#### Scenario: User interactions render
- **WHEN** a language is selected
- **THEN** the active language uses dark fill and white text
- **AND** inactive language controls remain muted and interactive
- **AND** the app transitions the active URL route to prepend the selected language prefix (e.g. from `/de/...` to `/en/...`), keeping the same subpaths and query parameters.

#### Scenario: Data requirements are met
- **WHEN** language toggle renders
- **THEN** required display data is current language derived from the URL prefix, and localized labels/copy for the visible page

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

### Requirement: Bilingual Shell Copy Parity
The app shell SHALL render legacy-equivalent German and English copy for shared navigation, language controls, status banners, and shell-level state wrappers.

#### Scenario: Guest shell language persists
- **WHEN** a guest switches between `DE` and `EN`
- **THEN** the navigation labels, public shell actions, and shell status messages render in the selected language
- **AND** the preference is preserved in the URL route and is set in the language cookie across reloads

#### Scenario: Authenticated shell language persists
- **WHEN** an authenticated viewer switches between `DE` and `EN`
- **THEN** member navigation labels, credits/saved/bookings/profile controls, and shell status messages render in the selected language
- **AND** the preference is updated in the URL route and saved to the profile

#### Scenario: Shell wrappers use selected language
- **WHEN** shell-level loading, empty, error, frozen-account, or membership attention states are visible
- **THEN** their visible messages and action labels use the selected language without mixing stale copy from a previous language
