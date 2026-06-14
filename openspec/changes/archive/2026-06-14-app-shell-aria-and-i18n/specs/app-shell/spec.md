## MODIFIED Requirements

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
