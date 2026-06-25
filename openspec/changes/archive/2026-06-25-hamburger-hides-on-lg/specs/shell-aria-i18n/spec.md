# shell-aria-i18n Specification (delta)

## MODIFIED Requirements

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
