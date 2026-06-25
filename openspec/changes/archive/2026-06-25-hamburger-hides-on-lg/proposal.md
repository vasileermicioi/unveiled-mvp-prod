## Why

The shell hamburger menu icon (`Menu` from `lucide-react`, wrapped by
`ShellIconButtonPresentational`) renders unconditionally inside
`ShellNavigation`. On desktop viewports (≥ 1024 px) it stays visible
alongside the full nav, which duplicates the navigation surface and is
the bug the user reported ("menu icon is shown even on big screen"). The
mobile drawer panel itself is already correctly gated by `lg:hidden`,
but the toggle button is not, so the gate is incomplete.

## What Changes

- Add the `lg:hidden` Tailwind utility to the
  `ShellIconButtonPresentational` primitive so the hamburger toggle is
  hidden at viewports ≥ 1024 px alongside the drawer panel itself.
- Centralise the gate inside the design system rather than at the
  `ShellNavigation` call site, so every shell — auth, landing, member,
  partner, admin — gets the gate for free and cannot regress.
- Add a gherkin regression (`@ladle(component="app-shell", story="lg-viewport")`)
  asserting the toggle is hidden at `lg` and visible at `sm`.
- Add a Playwright visual regression at 1440 px and 375 px that
  snapshots the toggle's bounding box and asserts `display: none` at
  1440 px.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `shell-aria-i18n`: extend the **Accessible Mobile Navigation Drawer**
  requirement with a rule that the hamburger toggle MUST be hidden at
  viewports ≥ 1024 px and MUST remain visible at viewports < 1024 px.
- `design-system-package`: extend the **Layouts compose organisms, not
  HeroUI directly** / shell-primitive contract with the rule that the
  `ShellIconButton` organism ships the `lg:hidden` utility natively and
  consumers MUST NOT override it; the `bun run check:styling-ownership`
  gate is the enforcer.

## Impact

- **Touched files (estimated):**
  - `packages/design-system/src/organisms/shell/shell-icon-button/shell-icon-button.tsx`
    — add `lg:hidden` to the `cn(...)` Tailwind class list.
  - `packages/design-system/src/organisms/shell/shell-icon-button/shell-icon-button.ladle.tsx`
    — add a viewport-tagged `lg-viewport` story (and `sm-viewport`
    sibling) demonstrating the gate.
  - `tests/features/shell/mobile-drawer/feature.feature` (new) — gherkin
    regression with two scenarios tagged
    `@ladle(component="app-shell", story="lg-viewport")`.
  - `tests/features/shell/mobile-drawer/app-shell.ladle.tsx` (new) —
    `lg-viewport` and `sm-viewport` stories.
  - `tests/visual/shell/icon-button-lg-hidden.png` (new baseline) and
    `tests/visual/shell/icon-button-sm-visible.png` (new baseline) —
    Playwright visual regression at 1440 px and 375 px.
  - `docs/shell.md` (new if absent) — paragraph explaining the `lg`
    breakpoint choice and that the drawer panel and the toggle are gated
    together.

- **Risks:** A user that was relying on the hamburger at 1024–1279 px
  on a small laptop will now have to use the full nav. This is the
  intended behaviour; the design system already documents `lg:hidden`
  as the breakpoint for the drawer itself.
