# shell-aria-i18n Specification

## Purpose
TBD - created by archiving change app-shell-aria-and-i18n. Update Purpose after archive.
## Requirements
### Requirement: Accessible Mobile Navigation Drawer

The shell hamburger button and the mobile drawer SHALL expose a
disclosure + dialog relationship that assistive technology can
navigate. The hamburger toggle SHALL be visible only at viewports
below 1024 px wide; at viewports ≥ 1024 px wide the toggle MUST be
hidden (via Tailwind `lg:hidden`) so the full nav row remains the
only visible navigation surface on desktop. The mobile drawer panel
and its backdrop SHALL continue to share the same `lg:hidden` gate.

#### Scenario: Hamburger button is announced as a disclosure

- **WHEN** the shell renders on a viewport below 1024px
- **THEN** the hamburger button has `aria-label` set to the
  localized open-menu key
- **AND** it has `aria-expanded` set to `false` when the drawer is
  closed and `true` when the drawer is open
- **AND** it has `aria-controls` set to the drawer's stable id
  (`shell-mobile-drawer`)

#### Scenario: Drawer is announced as a modal dialog

- **WHEN** the mobile drawer is open
- **THEN** the drawer element has `role="dialog"`
- **AND** it has `aria-modal="true"`
- **AND** it has `aria-labelledby` pointing at the drawer's
  localized heading element

#### Scenario: Close control is announced with a localized label

- **WHEN** the mobile drawer is open
- **THEN** the close button has `aria-label` set to the localized
  close-menu key

#### Scenario: Drawer close control is reachable via proximity selector

- **WHEN** the mobile drawer is open
- **THEN** the close control is the first focusable element inside
  the dialog
- **AND** a gherkin scenario driven by a proximity selector can
  click the close control without depending on text content

#### Scenario: Hamburger toggle is hidden at viewports ≥ 1024 px

- **WHEN** the page renders at a viewport ≥ 1024 px wide
- **THEN** the hamburger toggle button has `display: none` (the
  Tailwind `lg:hidden` utility is applied)
- **AND** the full nav row is the only navigation surface visible

#### Scenario: Hamburger toggle is visible at viewports < 1024 px

- **WHEN** the page renders at a viewport < 1024 px wide
- **THEN** the hamburger toggle button is visible
- **AND** tapping it opens the mobile drawer

### Requirement: Accessible Language Toggle

The shell language toggle SHALL announce itself as a grouped
control and expose the active option's state to assistive
technology.

#### Scenario: Toggle is announced as a group

- **WHEN** the language toggle is rendered
- **THEN** the toggle's wrapper element has `role="group"`
- **AND** it has `aria-label` set to the localized language-group
  key

#### Scenario: Active language is announced as pressed

- **WHEN** the language toggle is rendered
- **THEN** each language option is a `<button type="button">`
- **AND** the option matching the active language has
  `aria-pressed="true"`
- **AND** the other option has `aria-pressed="false"`

### Requirement: Shell Copy Parity Enforcement

The shell SHALL render every user-visible string through the typed
`i18n.shell.*` bundle, and the bundle SHALL be exported as a typed
shape that the type checker enforces across both DE and EN.

#### Scenario: New shell key requires both languages

- **WHEN** a contributor adds a new key to the DE `shell.*` bundle
- **THEN** `bun run check` reports a type error until the same key
  is added to the EN bundle

#### Scenario: Stale shell key fails the type check

- **WHEN** a contributor removes a key from the DE `shell.*` bundle
  but leaves it in the EN bundle
- **THEN** `bun run check` reports a type error

#### Scenario: Shell renders only typed copy keys

- **WHEN** the shell header, mobile drawer, or language toggle is
  rendered
- **THEN** no hard-coded English literal appears as a user-visible
  string
- **AND** the brand tagline, hamburger/close labels, drawer
  heading, and language-group label are all sourced from
  `copyFor(shell.language.selected).shell.*`

#### Scenario: Gherkin scenario exercises the localized hamburger label

- **WHEN** a contributor reads
  `tests/features/core-platform/app-shell.feature`
- **THEN** at least one scenario asserts the hamburger button's
  `aria-label` is the DE copy in the DE build and the EN copy in
  the EN build

#### Scenario: Gherkin scenario exercises the language toggle aria-pressed state

- **WHEN** a contributor reads
  `tests/features/core-platform/app-shell.feature`
- **THEN** at least one scenario asserts the active language
  option has `aria-pressed="true"` and the inactive option has
  `aria-pressed="false"`

### Requirement: Public Nav Primary Action Tracks Viewer Auth State

The public nav primary CTA SHALL be driven by the viewer's auth state.
For guests, the CTA MUST read "Become a member" (DE: "Mitglied werden")
and point at `/<lang>/membership`. For authenticated viewers, the CTA
MUST read "Open app" (DE: "App öffnen") and point at the
role-appropriate product surface (`/app/<lang>/app`,
`/app/<lang>/admin`, `/app/<lang>/partner`) derived from
`viewer.viewerContext`.

#### Scenario: Guest sees "Become a member" CTA

- **WHEN** a guest viewer renders a public nav
- **THEN** the primary CTA reads "Become a member" (DE: "Mitglied
  werden")
- **AND** the CTA's `href` is `/<lang>/membership`

#### Scenario: Authenticated viewer sees "Open app" CTA

- **WHEN** an authenticated viewer renders a public nav
- **THEN** the primary CTA reads "Open app" (DE: "App öffnen")
- **AND** the CTA's `href` is the role-appropriate product surface
  derived from `viewer.viewerContext`

