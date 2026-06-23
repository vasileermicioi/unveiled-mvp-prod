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

The app shell SHALL recreate the visible legacy frame using migrated target UI-system primitives and target-native layout components. The shell SHALL mount `HeroUIProvider` at the client root and source its global theme configuration from the production HeroUI theme module (no longer from the Ladle-only replica).

#### Scenario: Shell mounts HeroUI provider at the client root

- **WHEN** any client island inside the shell hydrates
- **THEN** `HeroUIProvider` from the production provider module is mounted above the island tree
- **AND** the global theme configuration is sourced from the production HeroUI theme module `src/lib/heroui-theme.ts`

#### Scenario: SSR does not crash on Cloudflare Workers

- **WHEN** the shell renders during SSR on the Cloudflare Workers adapter
- **THEN** no HeroUI client-only API executes during server rendering
- **AND** every island that wraps a HeroUI client-only surface is mounted with `client:only="react"` (or an equivalent dynamic import gated by `useEffect`)

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

Shell navigation SHALL navigate to stable route URLs for product surfaces prefixed by the active route language parameter and the `/app` URL prefix (per the `app-package` capability), and SHALL derive selected state from the current route. The app shell now only ships on the `/app/*` URL space; unauthenticated visitors on `/` see the landing chrome (per the `landing-package` capability), not the app shell.

#### Scenario: Nav item is selected

- **WHEN** a shell nav item is activated
- **THEN** the browser navigates to the route for that product surface under `/app/<lang>/...`
- **AND** the selected nav item is derived from the current route.

#### Scenario: Guest navigation targets public routes

- **WHEN** guest navigation renders
- **THEN** Discover, How it works, Membership, and FAQ controls target `/app/<lang>/discover`, `/app/<lang>/how-it-works`, `/app/<lang>/membership`, and `/app/<lang>/faq`.

#### Scenario: Member navigation targets member routes

- **WHEN** member navigation renders
- **THEN** Current access, saved events, bookings, and profile controls target `/app/<lang>/app`, `/app/<lang>/saved`, `/app/<lang>/bookings`, and `/app/<lang>/profile`.

#### Scenario: Operational navigation targets operational routes

- **WHEN** partner or admin navigation renders
- **THEN** global operational entry points target `/app/<lang>/partner` for partners and `/app/<lang>/admin` for admins.

#### Scenario: Mobile nav renders route controls

- **WHEN** the shell renders on small screens
- **THEN** all role-relevant product routes remain reachable without exposing demo or workbench-only controls.

#### Scenario: App shell is scoped to /app/*

- **WHEN** a contributor reads the app shell sources
- **THEN** the shell mounts only on Astro pages that resolve under `/app/*`
- **AND** no shell component (header, mobile drawer, language toggle, status banner) is rendered on the landing surface (`/*`), which is owned by `@unveiled/landing`.

### Requirement: Shell Active State Is Route-Derived

The app shell SHALL use route display data as the source of truth for active navigation state, where the route display data now reflects that the Astro app is mounted under the `/app/*` URL prefix (per the `app-package` capability) rather than the repo root. The shell SHALL also expose accessible attributes on the language toggle, the hamburger button, and the mobile drawer so assistive technology can navigate them. The shell SHALL be selector-disciplinable: every interactive control SHALL be reachable through proximity (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`) or layout (`getByRole`, `getByLabel`, `getByLandmark`, `getInside`) selectors, and SHALL NOT rely on `data-testid` or CSS class selectors. After this change, the shell only renders under `/app/*`; the landing surface (`/*`) owns its own brand chrome via `@unveiled/landing`.

#### Scenario: Current route is public

- **WHEN** a public page renders under the `/app/<lang>/...` prefix
- **THEN** the matching public navigation action receives active treatment when it exists in the visible shell.

#### Scenario: Current route is protected

- **WHEN** a member, partner, or admin page renders under `/app/<lang>/...`
- **THEN** the matching role-specific navigation action receives active treatment.

#### Scenario: Hydrated interactions do not replace route state

- **WHEN** hydrated shell controls handle local UI state
- **THEN** they do not change the primary active product surface without a URL navigation that preserves the `/app/<lang>/...` shape.

#### Scenario: Language toggle is announced as a grouped control

- **WHEN** the language toggle is rendered
- **THEN** the toggle's wrapper element has `role="group"`
- **AND** it has `aria-label` set to the localized language-group key
- **AND** each language option has `aria-pressed` set to `true` when active and `false` otherwise.

#### Scenario: Hamburger button is announced as a disclosure

- **WHEN** the shell renders on a viewport below 1024px
- **THEN** the hamburger button has `aria-expanded` set to `false` when the drawer is closed and `true` when the drawer is open
- **AND** it has `aria-controls` set to the drawer's stable id
- **AND** it has a localized `aria-label` drawn from the `shell.nav.openMenu` / `shell.nav.closeMenu` i18n keys.

#### Scenario: Mobile drawer is announced as a modal dialog

- **WHEN** the mobile drawer is open
- **THEN** the drawer element has `role="dialog"`
- **AND** it has `aria-modal="true"`
- **AND** it has `aria-labelledby` pointing at the drawer's localized heading element.

#### Scenario: Shell controls are selector-disciplinable

- **WHEN** a contributor writes a gherkin scenario that selects any shell control (header link, language toggle, hamburger, drawer close, status banner, page top-bar action)
- **THEN** the scenario can be expressed using only proximity selectors (e.g. `getLinkNearestTo`, `getButtonNearestTo`) and layout selectors (e.g. `getByRole`, `getByLabel`, `getByLandmark`, `getInside` with a semantic landmark parent)
- **AND** the selector-discipline lint at `tests/steps/lint/selectors.ts` does not flag the scenario.

#### Scenario: Active route is resolved against the /app prefix

- **WHEN** the shell derives the active navigation state from the current URL
- **THEN** it strips the `/app/<lang>/` prefix before matching the route against the public / member / partner / admin surfaces
- **AND** the public navigation item for `/app/<lang>/discover` is the one that receives active treatment when the viewer is on `/app/<lang>/discover`
- **AND** the active state is not misattributed to a sibling route that differs only by the language prefix.

#### Scenario: Landing surface does not mount the app shell

- **WHEN** an unauthenticated visitor opens `/` (the landing surface, owned by `@unveiled/landing`)
- **THEN** no app shell component renders (no header navigation, no language toggle, no mobile drawer)
- **AND** the landing brand chrome renders instead.

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
described in the "Hamburger button is announced as a disclosure"
and "Mobile drawer is announced as a modal dialog" scenarios above,
and SHALL use only the `aria-*` attributes and stable ids declared
by the `app-shell` capability.

#### Scenario: Mobile drawer is toggled

- **WHEN** the viewer is on a viewport below 1024px and clicks the
  hamburger menu button
- **THEN** the navigation drawer transitions into view from the
  side using a smooth CSS transition that honors
  `prefers-reduced-motion: reduce`
- **AND** displaying all role-relevant navigation links, language
  selector, and logout controls
- **AND** the hamburger button's `aria-expanded` flips to `true`
- **AND** the drawer element exposes `role="dialog"` and
  `aria-modal="true"`.

#### Scenario: Mobile drawer is closed via close control

- **WHEN** the mobile drawer is open and the localized close
  control is selected (via a proximity selector against the
  drawer's `aria-labelledby` heading)
- **THEN** the drawer transitions out of view
- **AND** the hamburger button's `aria-expanded` returns to
  `false`
- **AND** keyboard focus returns to the hamburger button.

### Requirement: Selector-Disciplinable Discovery Shell

The discovery shell SHALL be selector-disciplinable end-to-end:
filters, map, grid, empty state, and pagination SHALL all be
reachable through proximity + layout selectors, and SHALL expose
the `aria-*` attributes, labels, and landmark wrappers required
for selector-disciplinable selection. The discovery shell SHALL NOT
introduce a parallel visual system, additional `data-testid`
attributes, or copy that bypasses the `shell.*` i18n bundle.

#### Scenario: Discovery shell exposes filter form landmark

- **WHEN** the discovery shell renders
- **THEN** the filter controls are wrapped in a `<form
  role="search">` landmark with a localized `aria-label`
- **AND** each filter field is reachable via `getFieldNearestTo` or
  `getByLabel` selectors
- **AND** the filter toggle and map toggle expose `aria-expanded`
  state tied to their collapsible panels.

#### Scenario: Discovery shell exposes map landmark

- **WHEN** the discovery map is visible
- **THEN** the map container has a localized `aria-label`
  (e.g. "Event map" / "Veranstaltungskarte")
- **AND** map controls are reachable via layout selectors scoped to
  the map landmark.

#### Scenario: Discovery grid and empty state are landmarked

- **WHEN** the event grid renders
- **THEN** the grid has a localized `aria-label` and a
  `role="region"` wrapper
- **AND** when the grid is empty, the empty state uses a
  `role="status"` wrapper with a localized message.

#### Scenario: Discovery pagination is landmarked and labeled

- **WHEN** pagination is visible
- **THEN** the pagination control has a localized `aria-label`
- **AND** individual page buttons are reachable via proximity
  selectors (e.g. `getButtonNearestTo`) without relying on text
  content or CSS classes.

#### Scenario: Discovery shell copy is bilingual

- **WHEN** the discovery shell renders
- **THEN** filter labels, map toggle label, empty state title, and
  pagination labels are sourced from
  `copyFor(shell.language.selected).shell.*` (or the
  `discover-filters-pagination` i18n bundle, whichever owns the
  key)
- **AND** the i18n parity unit test covers every new key in both
  DE and EN.

### Requirement: Skeleton Loaders On Every List Surface

The app shell MUST render a typed `<ListSkeleton variant="…">`
primitive on every list surface it owns (events grid, saved events,
bookings, operations tables, member table) while the list data is
loading. The primitive MUST expose `aria-busy="true"`, `role="status"`,
and `aria-live="polite"` so assistive technology announces the
loading state, and it MUST be reachable via a
`getInside(getByLandmark("main"))` or
`getByRole("status", { name: localized skeleton label })` selector.

#### Scenario: List skeleton is announced to assistive tech

- **WHEN** a list surface enters its loading state
- **THEN** the rendered skeleton has `aria-busy="true"`
- **AND** it has `role="status"`
- **AND** it has `aria-live="polite"`
- **AND** it has a localized `aria-label` drawn from
  `copyFor(shell.language.selected).shell.skeleton.<variant>`.

#### Scenario: Skeleton variant matches the eventual list shape

- **WHEN** a list surface enters its loading state
- **THEN** the skeleton variant matches the visual shape of the
  eventual list (e.g. `events-grid`, `saved-events`,
  `bookings-list`, `operations-table`, `member-table`)
- **AND** the count of skeleton rows matches the typical count
  for that surface (e.g. 8 for the events grid, 5 for bookings).

#### Scenario: Skeleton is removed when the list resolves

- **WHEN** the list data resolves and the actual list renders
- **THEN** the skeleton is removed from the DOM
- **AND** the list container's `aria-busy` returns to `false`.

### Requirement: Reduced Motion Honored

The app shell SHALL honor the user's `prefers-reduced-motion` setting
on every motion-bearing shell surface: the mobile drawer transition,
the skeleton loader fade-in, the navigation hover/focus state, and
any other CSS transition or animation declared by a shell component.
The guard SHALL be implemented as a single `@media
(prefers-reduced-motion: reduce)` block in the global stylesheet, with
no client-side JavaScript required.

#### Scenario: Reduced motion disables drawer transition

- **WHEN** the user has `prefers-reduced-motion: reduce` enabled and
  toggles the mobile drawer
- **THEN** the drawer appears / disappears without a slide-in
  transition
- **AND** the open / close behavior is otherwise identical.

#### Scenario: Reduced motion disables skeleton fade-in

- **WHEN** the user has `prefers-reduced-motion: reduce` enabled and
  a list surface enters its loading state
- **THEN** the skeleton renders without a fade-in or pulse
  animation
- **AND** the screen-reader announcement (the
  `role="status"` + `aria-live="polite"` wrapper) is still
  emitted.

#### Scenario: Reduced motion disables nav hover transition

- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
  and hovers or focuses a shell navigation control
- **THEN** the active / hover state is applied instantly without
  a color or transform transition.

#### Scenario: Motion guard is a single global block

- **WHEN** the umbrella ships
- **THEN** every shell motion surface is covered by a single
  `@media (prefers-reduced-motion: reduce)` block in
  `src/styles/global.css`
- **AND** no per-component `useReducedMotion()` hook is
  introduced.

### Requirement: Viewport Meta Audited

Every Astro route page SHALL declare a
`<meta name="viewport" content="width=device-width, initial-scale=1">`
tag, sourced from `src/layouts/base-layout.astro`. A lint script
SHALL fail the build if any route page does not import the layout or
emits a viewport meta with a non-canonical `content` attribute.

#### Scenario: Route page renders a viewport meta

- **WHEN** any Astro route page (under `src/pages/`) is rendered
- **THEN** the rendered HTML includes a
  `<meta name="viewport" content="width=device-width,
  initial-scale=1">` tag in the `<head>`
- **AND** the tag is sourced from `src/layouts/base-layout.astro`.

#### Scenario: Viewport lint catches forgotten routes

- **WHEN** a contributor adds a new Astro route page that does not
  import `BaseLayout`
- **THEN** the viewport-meta lint script reports a failure
- **AND** `bun run check` fails until the route is updated.

#### Scenario: Viewport meta content is canonical

- **WHEN** the lint audits the layout
- **THEN** the viewport meta `content` attribute MUST be exactly
  `width=device-width, initial-scale=1`
- **AND** any deviation (e.g. `user-scalable=no`, missing
  `initial-scale`) is reported as a failure.

### Requirement: Ladle and Hero UI Naming Conventions

The app shell SHALL be consistent with the Ladle storybook replacement and Hero UI component library naming conventions. All component references, testing patterns, and UI system references align with the Ladle + Hero UI toolchain.

#### Scenario: Terminology is consistent with Ladle

- **WHEN** contributors read this spec
- **THEN** they find no references to Storybook; Ladle is the reference toolchain
- **AND** they find no references to Mantine, shadcn/ui, or the Ladle-only `heroui-replica/` folder; HeroUI is the reference component library

#### Scenario: Testing patterns follow Playwright + proximity selector discipline

- **WHEN** a gherkin scenario selects any shell control
- **THEN** the scenario is expressed using proximity selectors (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`) or layout selectors (`getByRole`, `getByLabel`, `getByLandmark`, `getInside`)
- **AND** no `data-testid` or CSS class selectors are used

### Requirement: Shell Surfaces Are HeroUI-Backed

The app shell's reusable containers, navigation variants, page shell containers, and global state wrappers SHALL be composed from the HeroUI-backed primitives in `src/components/ui/` and SHALL NOT import from the deprecated shadcn primitives, the Ladle-only `heroui-replica/`, or any `mantine-replica/` folder.

#### Scenario: Shell imports land on production primitives

- **WHEN** the shell source under `src/layouts/` and
  `src/components/unveiled/` is audited
- **THEN** every `@/components/ui/...` import resolves to a HeroUI-backed
  primitive module under `src/components/ui/`
- **AND** no import lands inside `src/components/ui/heroui-replica/` or
  `src/components/ui/mantine-replica/`.

#### Scenario: Shell-level Ladle stories are parity-locked

- **WHEN** a shell container (page top-bar, breadcrumb row, status
  banner, language toggle, mobile drawer) is rendered inside a Ladle
  harness
- **THEN** the harness is referenced by a gherkin scenario in
  `tests/features/ui-system/` via a `@ladle(component=…, story=…)`
  tag
- **AND** the scenario asserts the shell surface matches the approved
  Ladle story for every variant the shell exposes.

### Requirement: Shell Docs Reference HeroUI

`AGENTS.md`, `docs/guidelines.md`, and `CONTRIBUTING.md` SHALL describe HeroUI as the production component library for the shell and SHALL NOT reference Mantine, shadcn, the `mantine-replica/`, the `heroui-replica/`, or the deleted Storybook workflow.

#### Scenario: Canonical docs name HeroUI

- **WHEN** a contributor reads the "Tech stack", "File layout", or
  "Toolchain commands" sections of `AGENTS.md`
- **THEN** HeroUI is named as the production component library
- **AND** no mention of Mantine, shadcn, or Storybook remains.

#### Scenario: Docs and replica gates agree

- **WHEN** `bun run heroui-design-system-replica:check` and the
  umbrella `bun run check` pass
- **THEN** the docs and the gates agree that the only HeroUI source of
  truth is the production module path, not a Ladle-only folder.

### Requirement: Hero CTAs Use Secondary Variant + Arrow Icon + Consistent `size="lg"`

The app shell's hero section SHALL render the two hero CTAs ("EXPLORE ACCESS" and "HOW IT WORKS") with the design-system `secondary` Button variant at `size="lg"`, and both SHALL include the `<ArrowRight />` icon as their last child so the pair is visually consistent and signals forward action.

#### Scenario: Hero CTA pair uses the secondary variant

- **WHEN** the hero section renders on any app-shell route (e.g. `/app/en/`)
- **THEN** both "EXPLORE ACCESS" and "HOW IT WORKS" buttons are rendered as `<Button asChild variant="secondary" size="lg">`
- **AND** the rendered button classes include `bg-white text-brand-dark border-brand-dark` (the `secondary` variant surface) and `min-h-14 px-7 py-4 text-xs` (the `lg` size)
- **AND** neither button uses the `default`, `primary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, or `link` variants.

#### Scenario: Hero CTAs include the ArrowRight icon

- **WHEN** the hero section renders
- **THEN** each of the two hero CTAs contains an `<ArrowRight />` icon as the last child of its `<a>` slot
- **AND** the icon resolves to the lucide-react `ArrowRight` import (`import { ArrowRight } from "lucide-react"`) so it shares the same SVG glyph and sizing as other shell icons.

#### Scenario: Hero CTAs share the same large dimensions

- **WHEN** the hero section renders
- **THEN** both buttons carry `size="lg"` so they share `min-h-14 px-7 py-4 text-xs` dimensions
- **AND** neither button uses `size="default"`, `size="sm"`, `size="icon"`, or `size="icon-sm"`.

#### Scenario: Hero CTAs navigate to the expected app routes

- **WHEN** the hero section renders
- **THEN** "EXPLORE ACCESS" navigates to `/app/<lang>/discover`
- **AND** "HOW IT WORKS" navigates to `/app/<lang>/how-it-works`
- **AND** both `<a>` slots resolve under the `/app/<lang>/...` URL prefix (per the `app-package` capability).

### Requirement: VisualSystemApp Initial Mode

The `VisualSystemApp` React island exported from `packages/app/src/components/unveiled/visual-system-app.tsx` SHALL accept an optional `initialMode?: "login" | "signup" | "recovery"` prop (default `"login"`) and forward it to the embedded `LandingPage` so the auth form opens on the correct tab. The `LandingPage` SHALL use the prop to initialize its internal `mode` state (the `useState<"login" | "signup" | "recovery">` initializer) so the auth form, its endpoint (`/api/account/login`, `/api/account/signup`, `/api/account/password-recovery`), and its Zod resolver all reflect the requested mode on first paint.

#### Scenario: VisualSystemApp default initialMode is login

- **WHEN** a contributor renders `<VisualSystemApp initialShell={...} initialDiscovery={...} initialView="landing" />` without an `initialMode` prop
- **THEN** the embedded `LandingPage` opens with `mode === "login"`
- **AND** the auth form's submit endpoint is `/api/account/login`
- **AND** the form uses `loginSchema` as its Zod resolver.

#### Scenario: VisualSystemApp forwards initialMode to LandingPage

- **WHEN** a contributor renders `<VisualSystemApp initialMode="signup" ... />`
- **THEN** the embedded `LandingPage` opens with `mode === "signup"`
- **AND** the auth form's submit endpoint is `/api/account/signup`
- **AND** the form uses `signupSchema` as its Zod resolver.

#### Scenario: VisualSystemApp initialMode accepts the recovery mode

- **WHEN** a contributor renders `<VisualSystemApp initialMode="recovery" ... />`
- **THEN** the embedded `LandingPage` opens with `mode === "recovery"`
- **AND** the auth form's submit endpoint is `/api/account/password-recovery`
- **AND** the form uses `passwordRecoverySchema` as its Zod resolver.

### Requirement: Dedicated Auth Pages Render With Localized Title

Each dedicated public auth page (`packages/app/src/pages/[lang]/login.astro`, `packages/app/src/pages/[lang]/signup.astro`, `packages/app/src/pages/[lang]/recovery.astro`) SHALL mount `BaseLayout` with a localized `title` attribute (`Login | Unveiled`, `Sign up | Unveiled`, `Password recovery | Unveiled` — the EN strings; the DE equivalents are sourced through the existing i18n layer used by `BaseLayout`). Each page SHALL resolve the `lang` URL parameter via `normalizeLanguage`, hydrate the viewer via `getViewer`, build the initial shell via `createShellFromViewer(viewer, "landing")`, load public discovery data via `loadPublicDiscoveryData`, build the surface data via `createPublicInitialSurfaceData`, and render the `VisualSystemApp` island with `client:load`, `initialView="landing"`, and `initialMode` matching the page (`login`, `signup`, or `recovery`).

#### Scenario: /app/en/login renders the login form

- **WHEN** a contributor visits `/app/en/login`
- **THEN** the page renders the `BaseLayout` with `title="Login | Unveiled"`
- **AND** the embedded `VisualSystemApp` is mounted with `initialMode="login"`
- **AND** the response status is `200`.

#### Scenario: /app/en/signup renders the signup form

- **WHEN** a contributor visits `/app/en/signup`
- **THEN** the page renders the `BaseLayout` with `title="Sign up | Unveiled"`
- **AND** the embedded `VisualSystemApp` is mounted with `initialMode="signup"`
- **AND** the response status is `200`.

#### Scenario: /app/en/recovery renders the password-recovery form

- **WHEN** a contributor visits `/app/en/recovery`
- **THEN** the page renders the `BaseLayout` with `title="Password recovery | Unveiled"`
- **AND** the embedded `VisualSystemApp` is mounted with `initialMode="recovery"`
- **AND** the response status is `200`.

#### Scenario: Dedicated login page parses a safe deep-link redirect

- **WHEN** a contributor visits `/app/en/login?redirect=%2Fadmin`
- **THEN** the page frontmatter parses the `redirect` query parameter through `parseSafeRedirectTarget`
- **AND** when the helper returns a route, the page builds a safe `callbackURL` from the validated path (e.g. `/${lang.toLowerCase()}/admin`) and forwards it to the `VisualSystemApp`
- **AND** when the helper returns `null` (e.g. for an off-site or cross-language value), the page falls back to `/${lang.toLowerCase()}/` so the post-login redirect lands on the per-surface safe destination.

