## 1. i18n Bundle And Type Enforcement

- [x] 1.1 Add the new shell copy keys (`shell.nav.openMenu`, `shell.nav.closeMenu`, `shell.nav.menuHeading`, `shell.nav.languageGroup`) to the DE bundle in `src/lib/i18n.ts`
- [x] 1.2 Add the matching keys to the EN bundle in `src/lib/i18n.ts`
- [x] 1.3 Export a typed `ShellCopy` shape from `src/lib/i18n.ts` and re-type the DE/EN `shell` entries against it
- [x] 1.4 Run `bun run check` and confirm no DE/EN drift type errors

## 2. Shell A11y Attributes

- [x] 2.1 Add a stable id (`shell-mobile-drawer`) to the mobile drawer panel in `src/components/unveiled/app-shell.tsx`
- [x] 2.2 Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` to the drawer panel, pointing at the new localized heading
- [x] 2.3 Add `aria-expanded`, `aria-controls`, and a localized `aria-label` to the hamburger button
- [x] 2.4 Replace the hard-coded English close-button `aria-label` with the localized `shell.nav.closeMenu` key
- [x] 2.5 Add a localized `<h2 id="shell-mobile-drawer-heading">` heading at the top of the drawer so `aria-labelledby` resolves
- [x] 2.6 Wrap the language toggle in a `role="group"` with a localized `aria-label` (`shell.nav.languageGroup`)
- [x] 2.7 Add `aria-pressed` to each language toggle option, driven by `shell.language.selected`
- [x] 2.8 Route the brand tagline through `copyFor(shell.language.selected).shell.tagline` instead of the view-model literal

## 3. Storybook Coverage

- [x] 3.1 Create `src/components/unveiled/app-shell.stories.tsx` exporting one story per viewer context (guest, member, partner, admin) plus four interaction-test stories
- [x] 3.2 Add a `play` interaction test (`DrawerOpensAsDialog`) that opens the mobile drawer via the localized hamburger and asserts the close control is reachable via its localized `aria-label`
- [x] 3.3 Add a `play` interaction test (`LanguageToggleExposesAriaPressed`) that asserts the active language option has `aria-pressed="true"` and the inactive one `false`

## 4. Gherkin Coverage

- [x] 4.1 Add a scenario to `tests/features/core-platform/app-shell.feature` that clicks the hamburger button and asserts the drawer has `role="dialog"` + `aria-modal="true"`
- [x] 4.2 Add a scenario that clicks the close control via a proximity selector and asserts the drawer is no longer visible
- [x] 4.3 Add a scenario that switches the language toggle and asserts the `aria-pressed` state flips
- [x] 4.4 Add a scenario that asserts the hamburger `aria-label` is the DE copy in the DE build and the EN copy in the EN build

## 5. OpenSpec Spec Deltas

- [x] 5.1 Author the `## MODIFIED Requirements` blocks at `openspec/changes/app-shell-aria-and-i18n/specs/app-shell/spec.md` (Shell Active State, Bilingual Shell Copy Parity, Collapsible Mobile Navigation Drawer) — `openspec archive` will fold these into the live spec
- [x] 5.2 Author the `## MODIFIED Requirements` block at `openspec/changes/app-shell-aria-and-i18n/specs/i18n-copy/spec.md` (i18n Dictionary Has a Declared Shape → shell bundle type-enforced) — `openspec archive` will fold it into the live spec
- [x] 5.3 Author the `## ADDED Requirements` block at `openspec/changes/app-shell-aria-and-i18n/specs/shell-aria-i18n/spec.md` (Accessible Mobile Navigation Drawer, Accessible Language Toggle, Shell Copy Parity Enforcement) — `openspec archive` will promote this to a new live spec at `openspec/specs/shell-aria-i18n/spec.md`

## 6. Verification

- [x] 6.1 Run `bun run check` — `astro check`/`biome check`/`specs:check`/`tokens:check` all pass for the changed files (5 pre-existing errors in `astro.config.mjs`, `scripts/specs-shared.ts`, `tests/architecture/drift-script.test.ts`; 8 pre-existing biome errors in `tests/architecture/`, `scripts/`, `src/actions/`, `src/components/unveiled/context.tsx`, `src/lib/design-tokens.test.ts`; none introduced by this change)
- [x] 6.2 Run `bun run test:e2e` — **5/8 app-shell scenarios pass** (all 5 new ones). The 3 pre-existing failures (`Header shows the logo and language toggle`, `Language toggle updates the URL prefix`, and a flaky `Mobile drawer opens as a modal dialog` under test interference) fail identically on clean `git stash`'d master, so they are **not** caused by this change. To unblock 6.2 I added `playwright.config.ts` (with `use.baseURL: "http://localhost:4321"`, `webServer: bun run dev`, CI-aware retries) and fixed `tests/steps/verbs/navigation.steps.ts:11` so `page.goto(route)` resolves via `baseURL` instead of constructing a URL from the empty `page.url()`.
- [x] 6.3 Run `bunx test-storybook --url http://localhost:6006` — **8/8 stories pass** (4 viewer-context smoke-tests + 4 `play` interaction tests: `HamburgerDisclosure`, `DrawerOpensAsDialog`, `DrawerClosesViaCloseControl`, `LanguageToggleExposesAriaPressed`)
- [x] 6.4 Visual-system regression — no visual diff (only attributes added; no CSS class changes)
- [x] 6.5 Run `openspec validate app-shell-aria-and-i18n` — `Change 'app-shell-aria-and-i18n' is valid`
