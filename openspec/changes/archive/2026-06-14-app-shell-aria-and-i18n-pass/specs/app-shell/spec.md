# Spec Deltas for `app-shell` capability

This umbrella bundles six 09-iteration rows that all touch the
`app-shell` capability. The deltas below fold into the live
`openspec/specs/app-shell/spec.md` at archive time.

## MODIFIED Requirements

### Requirement: Shell Active State Is Route-Derived

The app shell SHALL use route display data as the source of truth
for active navigation state. The shell SHALL also expose accessible
attributes on the language toggle, the hamburger button, and the
mobile drawer so assistive technology can navigate them. The shell
SHALL be selector-disciplinable: every interactive control SHALL be
reachable through proximity (`getFieldNearestTo`, `getButtonNearestTo`,
`getLinkNearestTo`) or layout (`getByRole`, `getByLabel`, `getByLandmark`,
`getInside`) selectors, and SHALL NOT rely on `data-testid` or CSS class
selectors.

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
- **AND** it has `aria-controls` set to the drawer's stable id
- **AND** it has a localized `aria-label` drawn from the
  `shell.nav.openMenu` / `shell.nav.closeMenu` i18n keys.

#### Scenario: Mobile drawer is announced as a modal dialog

- **WHEN** the mobile drawer is open
- **THEN** the drawer element has `role="dialog"`
- **AND** it has `aria-modal="true"`
- **AND** it has `aria-labelledby` pointing at the drawer's
  localized heading element.

#### Scenario: Shell controls are selector-disciplinable

- **WHEN** a contributor writes a gherkin scenario that selects any
  shell control (header link, language toggle, hamburger, drawer
  close, status banner, page top-bar action)
- **THEN** the scenario can be expressed using only proximity
  selectors (e.g. `getLinkNearestTo`, `getButtonNearestTo`) and
  layout selectors (e.g. `getByRole`, `getByLabel`,
  `getByLandmark`, `getInside` with a semantic landmark parent)
- **AND** the selector-discipline lint at
  `tests/steps/lint/selectors.ts` does not flag the scenario.

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

## ADDED Requirements

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
