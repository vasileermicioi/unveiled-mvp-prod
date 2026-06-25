## Context

The hamburger icon was added in iteration 13 to give mobile users a way
to reach the language toggle and the logout button. On desktop viewports
(≥ 1024 px) it duplicates the full nav row, which the user reported as
the "menu icon is shown even on big screen" bug. The mobile drawer
panel itself is already correctly gated by `lg:hidden`, but the
triggering toggle button is rendered unconditionally inside
`ShellNavigation`, so the gate is incomplete and every shell — auth,
landing, member, partner, admin — is affected.

## Goals / Non-Goals

**Goals:**

- Hide the hamburger toggle at viewports ≥ 1024 px wide.
- Centralise the visibility gate inside the design system primitive
  (`ShellIconButtonPresentational`) so future shells cannot regress
  the bug.
- Ship a gherkin + Playwright visual regression that fails fast if the
  utility is dropped or purged.

**Non-Goals:**

- Changing the `lg` breakpoint itself (1024 px is the Tailwind v4
  default and the breakpoint already used by the drawer panel).
- Refactoring the full nav layout for medium breakpoints
  (1024–1279 px).
- Moving the language toggle out of the drawer footer.
- Adding hamburger animations (the drawer already has
  `transition-transform`).

## Decisions

- **Gate at the primitive, not at the call site.** Add `lg:hidden`
  to the `cn(...)` class list inside
  `packages/design-system/src/organisms/shell/shell-icon-button/shell-icon-button.tsx`
  rather than to `ShellNavigation`. Centralising prevents future
  shells (auth, partner-portal, admin) from re-introducing the bug,
  and keeps the visibility rule in one place that the
  `check:styling-ownership` gate can reason about.
- **Pair the gate with the drawer panel.** The drawer panel and its
  backdrop already use `lg:hidden`; the toggle MUST use the same
  utility so a future refactor cannot desynchronise the trigger from
  the surface it controls.
- **Use a Tailwind utility, not a CSS class.** The design-system
  global CSS already imports Tailwind v4 layers, and `lg:hidden` is a
  built-in utility — no bespoke class is needed. This keeps the
  `atom-chrome.css` file free of viewport rules.
- **Ladle viewport knob over CSS media-query hacks.** Demonstrate the
  gate in Ladle by using Ladle's `viewport` knob (e.g. a `lg-viewport`
  story and a `sm-viewport` sibling) so contributors can preview the
  behavior without a real browser resize.
- **Visual regression at two viewports.** Capture Playwright baselines
  at 1440 px (`lg`, hidden) and 375 px (`sm`, visible). The `lg`
  baseline asserts `display: none` on the toggle's bounding box.

## Risks / Trade-offs

- **Tailwind purging could drop `lg:hidden`.** If no source class
  string includes the literal `lg:hidden`, Tailwind v4's JIT will
  purge the utility and the regression is invisible in CI. →
  Mitigation: the literal class lives in the primitive source file, so
  Tailwind's content scanning will pick it up; the Playwright visual
  regression at 1440 px asserts `display: none` and fails fast if
  purging regresses.
- **A user relying on the hamburger at 1024–1279 px loses access on
  small laptops.** This is the intended behaviour — the design
  system already documents `lg:hidden` as the breakpoint for the
  drawer itself, and the full nav row at `lg` exposes every drawer
  action.
- **Styling-ownership gate could false-positive.** The
  `check:styling-ownership` allow-list already permits the
  `lg:hidden` utility inside the design-system organisms layer; the
  gate's consumer-side check will reject any `lg:block` / `lg:flex`
  override a future contributor adds on the consumer. → Mitigation:
  the gate already enforces this for every other Tailwind utility in
  the catalogue, and the new spec scenario documents the rule.
