## Why

The shared app shell (`src/components/unveiled/app-shell.tsx`) currently exposes
several interactive surfaces that fail the project's selector and i18n
disciplines: the hamburger toggle and mobile drawer carry only English literal
`aria-label` strings, the language toggle announces nothing to assistive tech,
and the shell copy keys (`shell.nav.*`, `shell.state.*`, tagline) live in the
DE/EN bundles but are not declared as a typed shape that the type system
enforces across both languages. 10-iteration's catalog row
`app-shell-aria-and-i18n` (P0) lists exactly these issues. Shipping this change
unblocks the row's gherkin scenarios, storybook `play` tests, and the
selector-discipline migration that every later P0 row in the catalog depends
on.

## What Changes

- Wrap the mobile drawer in a real `role="dialog"` / `aria-modal="true"`
  surface, give the hamburger toggle a localized `aria-label` and
  `aria-expanded`, and add a localized `aria-label` to the close control.
- Localize the mobile drawer title heading and the drawer's "current
  language" hint through the typed `i18n.shell.nav.*` keys.
- Add `aria-pressed` to each `LanguageToggle` option and group the toggle
  with `role="group"` + a localized `aria-label` (e.g. "Sprache / Language").
- Localize the four hard-coded English strings currently in `app-shell.tsx`
  ("Open navigation menu", "Close navigation menu", the drawer's
  "current language" hint, the brand tagline) and route them through
  `copyFor(shell.language.selected).shell.*` keys.
- Extend the i18n dictionary type so the `shell.*` bundle is declared as
  a typed shape, the type check fails when a key is added to one language
  and not the other, and the i18n parity unit test asserts full DE/EN
  coverage of the new keys.
- Add two new gherkin scenarios under
  `tests/features/core-platform/app-shell.feature` exercising the
  hamburger toggle, drawer open/close, and the language toggle's
  `aria-pressed` state.
- Add a new storybook story `app-shell.stories.tsx` for the `AppShell`
  island with a `play` interaction test that opens the mobile drawer and
  asserts the close control is reachable via proximity selectors.
  Storybook 8.6 (`@storybook/react-vite` + `@storybook/test`) is added
  under `devDependencies`, with `.storybook/main.ts` and
  `.storybook/preview.ts` configured for the repo. The `play` tests
  use `@storybook/test`'s `userEvent` + `within` + `expect` against
  the storybook iframe. `bun run storybook:test` boots the dev server
  via `concurrently` and runs `@storybook/test-runner` against it.
- Add `## MODIFIED Requirements` blocks to the `app-shell` capability
  covering accessible shell navigation, accessible language toggle, and
  shell copy parity enforcement.

## Capabilities

### New Capabilities

- `shell-aria-i18n`: Accessibility and i18n contract for the shared app
  shell (header, navigation, mobile drawer, language toggle). This new
  capability captures the specific a11y/i18n rules that the existing
  `app-shell` capability does not yet declare. It will be merged into
  `app-shell` during archival.

### Modified Capabilities

- `app-shell`: Add requirements for accessible shell navigation
  (`aria-expanded`, `aria-controls` on the hamburger, `role="dialog"` /
  `aria-modal` on the drawer), an accessible language toggle
  (`role="group"`, `aria-label`, `aria-pressed`), and shell copy parity
  enforcement (every shell-rendered string routed through a typed
  `i18n.shell.*` key, with DE and EN both required by the type checker).
- `i18n-copy`: Cross-link the new app-shell copy keys to the typed
  dictionary shape requirement so the i18n parity unit test covers them.

## Impact

- `src/components/unveiled/app-shell.tsx` — add a11y attributes, wrap
  drawer in `role="dialog"`, route hard-coded English strings through
  `copyFor(...)`.
- `src/lib/i18n.ts` — extend the DE and EN bundles with the new shell
  keys; export the typed `ShellCopy` shape that the type checker uses
  to enforce parity.
- `tests/features/core-platform/app-shell.feature` — add gherkin
  scenarios for the hamburger toggle, drawer open/close, and
  language-toggle `aria-pressed` state.
- `src/components/unveiled/app-shell.stories.tsx` (new) — storybook
  story for `AppShell` with four `play` interaction tests
  (hamburger disclosure, drawer dialog, drawer close, language toggle
  `aria-pressed`).
- `openspec/specs/app-shell/spec.md` — add `## MODIFIED Requirements`
  for the three new a11y/i18n requirements.
- `openspec/specs/i18n-copy/spec.md` — add a `## MODIFIED Requirements`
  block tying the shell copy keys to the typed dictionary shape.
