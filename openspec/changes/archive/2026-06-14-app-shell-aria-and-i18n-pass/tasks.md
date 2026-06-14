## 1. Per-Feature Folder Scaffolding

- [x] 1.1 Create `.development-plan/10-iteration/features/improvements/app-shell-aria-and-i18n-pass/` umbrella folder with `proposal.md` (mirrors `.development-plan/10-iteration/01-app-shell-aria-and-i18n-pass.md`), umbrella `tasks.md`, umbrella `specs.md` (pointer to `openspec/changes/app-shell-aria-and-i18n-pass/specs/app-shell/spec.md`)
- [x] 1.2 Create `app-shell-aria-and-i18n/` sub-folder with `proposal.md`, `tasks.md`, `feature.feature`, `app-shell.stories.tsx`, `specs.md`
- [x] 1.3 Create `app-shell-mobile-drawer-aria/` sub-folder with `proposal.md`, `tasks.md`, `feature.feature`, `app-shell.stories.tsx`, `specs.md`
- [x] 1.4 Create `discovery-shell-aria-and-pagination/` sub-folder with `proposal.md`, `tasks.md`, `feature.feature`, `discovery-shell.stories.tsx`, `specs.md`
- [x] 1.5 Create `skeleton-loaders-every-list/` sub-folder with `proposal.md`, `tasks.md`, `feature.feature`, `skeleton-loaders-on-every-list-surface.stories.tsx`, `specs.md`
- [x] 1.6 Create `prefers-reduced-motion/` sub-folder with `proposal.md`, `tasks.md`, `feature.feature`, `prefers-reduced-motion-honored.stories.tsx`, `specs.md`
- [x] 1.7 Create `viewport-meta-audit/` sub-folder with `proposal.md`, `tasks.md`, `feature.feature`, `meta-name-viewport-audited-on-every-route.stories.tsx`, `specs.md`

## 2. Row 1 — AppShell Header / Nav / Drawer / Language Toggle (aria + i18n)

- [x] 2.1 Confirm `src/components/unveiled/app-shell.tsx` already wraps the mobile drawer in `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (delivered in the archived `app-shell-aria-and-i18n` change); no additional attributes needed
- [x] 2.2 Confirm the hamburger button has `aria-expanded`, `aria-controls`, and a localized `aria-label`; the `aria-label` resolves through `copyFor(shell.language.selected).shell.nav.openMenu` / `closeMenu`
- [x] 2.3 Confirm the language toggle is wrapped in `role="group"` with a localized `aria-label` and each option has `aria-pressed`
- [x] 2.4 Confirm the brand tagline + the four hard-coded English strings are routed through the typed `i18n.shell.*` keys (no view-model literals)
- [x] 2.5 Add a `feature.feature` scenario that opens the mobile drawer via the localized hamburger and asserts the drawer is reachable via `getByRole("dialog", { name: localized heading })` — see `.development-plan/10-iteration/features/improvements/app-shell-aria-and-i18n-pass/app-shell-aria-and-i18n/feature.feature` and `tests/features/core-platform/app-shell.feature`
- [x] 2.6 Add a `feature.feature` scenario that switches the language toggle and asserts the `aria-pressed` state flips on both options
- [x] 2.7 Add an `app-shell.stories.tsx` story with a `play` interaction test (`DrawerOpensAsDialog`) that exercises the same flow — see `.development-plan/10-iteration/features/.../app-shell.stories.tsx` and `src/components/unveiled/app-shell.stories.tsx`
- [x] 2.8 Update the per-row `specs.md` to point at the umbrella's `## MODIFIED Requirements` block "Shell Active State Is Route-Derived"

## 3. Row 2 — AppShell Mobile Drawer ARIA

- [x] 3.1 Confirm the mobile drawer has a stable id (`shell-mobile-drawer`) and a localized `<h2 id="shell-mobile-drawer-heading">` heading so `aria-labelledby` resolves
- [x] 3.2 Confirm the drawer's close control has a localized `aria-label` drawn from `shell.nav.closeMenu`
- [x] 3.3 Add a `feature.feature` scenario that closes the drawer via `getByRole("button", { name: copyFor(...).shell.nav.closeMenu })` and asserts the hamburger `aria-expanded` returns to `false`
- [x] 3.4 Add a `feature.feature` edge-case scenario that asserts keyboard focus returns to the hamburger button after the drawer closes
- [x] 3.5 Add an `app-shell.stories.tsx` `play` interaction test (`DrawerClosesViaCloseControl`) that exercises the same flow
- [x] 3.6 Update the per-row `specs.md` to point at the umbrella's `## MODIFIED Requirements` block "Collapsible Mobile Navigation Drawer"

## 4. Row 3 — Discovery Shell ARIA + Pagination (selector discipline)

- [x] 4.1 Audit the discovery shell components and identify any surfaces not reachable via proximity + layout selectors — see `src/components/unveiled/app-shell.tsx` (`DiscoveryShell`) and `PublicDiscover.tsx`
- [x] 4.2 Wrap the filter controls in a `<form role="search">` landmark with a localized `aria-label` (via the typed `shell.discovery.filters` key)
- [x] 4.3 Add a localized `aria-label` to the map container and wrap event markers in the map landmark (via the typed `shell.discovery.map` key)
- [x] 4.4 Wrap the event grid in a `role="region"` with a localized `aria-label`; ensure the empty state uses `role="status"` (via the typed `shell.discovery.grid` / `shell.discovery.empty` keys)
- [x] 4.5 Localize the filter toggle, map toggle, and pagination labels via the typed `shell.discovery.*` i18n bundle
- [x] 4.6 Add `aria-expanded` to the filter toggle and map toggle, tied to their collapsible panels
- [x] 4.7 Add a `feature.feature` happy-path scenario that opens the filter panel via `getButtonNearestTo(getByText(localized filter label))` and asserts the panel is reachable via `getByRole("search", { name: localized landmark label })`
- [x] 4.8 Add a `feature.feature` edge-case scenario for the empty state: `getInside(getByRole("status", { name: localized empty label }))`
- [x] 4.9 Add a `discovery-shell.stories.tsx` story with a `play` interaction test (`FiltersOpenAsSearchLandmark`) that exercises the same flow
- [x] 4.10 Update the per-row `specs.md` to point at the umbrella's `## MODIFIED Requirements` block "Selector-Disciplinable Discovery Shell"

## 5. Row 4 — Skeleton Loaders On Every List Surface

- [x] 5.1 Create `src/components/unveiled/list-skeleton.tsx` exporting a typed `ListSkeleton` primitive with a `variant` enum (`events-grid`, `saved-events`, `bookings-list`, `operations-table`, `member-table`)
- [x] 5.2 Add the typed `aria-busy`, `role="status"`, and `aria-live="polite"` attributes to the primitive
- [x] 5.3 Add a localized `aria-label` resolved from `copyFor(shell.language.selected).shell.skeleton.<variant>` for each variant
- [x] 5.4 Replace every existing ad-hoc skeleton in the shell-owned list surfaces with `<ListSkeleton variant="…">` (events grid, saved events, bookings, operations tables, member table)
- [x] 5.5 Add a `feature.feature` happy-path scenario: the events grid enters its loading state and the skeleton is reachable via `getByRole("status", { name: localized skeleton label })`
- [x] 5.6 Add a `feature.feature` edge-case scenario: the skeleton is removed when the data resolves (`aria-busy` returns to `false`)
- [x] 5.7 Add a `skeleton-loaders-on-every-list-surface.stories.tsx` story with a `play` interaction test (`SkeletonIsAnnouncedAsStatus`) for every variant
- [x] 5.8 Update the per-row `specs.md` to point at the umbrella's `## MODIFIED Requirements` block "Skeleton Loaders On Every List Surface"

## 6. Row 5 — prefers-reduced-motion Honored

- [x] 6.1 Add a single `@media (prefers-reduced-motion: reduce)` block to `src/styles/global.css` that disables transitions on motion-bearing shell elements
- [x] 6.2 Audit every shell-owned CSS class with a `transition` or `animation` declaration and ensure each one is covered by the guard
- [x] 6.3 Confirm the screen-reader announcement on `<ListSkeleton>` is not gated by the motion guard (the `role="status"` + `aria-live` wrapper must still fire)
- [x] 6.4 Add a `feature.feature` happy-path scenario: with the `prefers-reduced-motion: reduce` media query emulated, opening the mobile drawer does not animate
- [x] 6.5 Add a `feature.feature` edge-case scenario: with the media query emulated, the skeleton renders without a fade-in but the `aria-live` announcement still fires
- [x] 6.6 Add a `prefers-reduced-motion-honored.stories.tsx` story with two `play` interaction tests (one for the drawer, one for the skeleton) using Playwright's `emulateMedia({ reducedMotion: 'reduce' })`
- [x] 6.7 Update the per-row `specs.md` to point at the umbrella's `## MODIFIED Requirements` block "Reduced Motion Honored"

## 7. Row 6 — Viewport Meta Audited

- [x] 7.1 Source the canonical viewport meta from `src/layouts/base-layout.astro`
- [x] 7.2 Audit every route page under `src/pages/` and confirm canonical viewport meta (15 pages audited)
- [x] 7.3 Add a `bun run lint:viewport` script that fails if any `.astro` route page does not import `BaseLayout` or the layout emits a non-canonical viewport `content` attribute
- [x] 7.4 Wire the lint into `bun run check`
- [x] 7.5 Add a `feature.feature` happy-path scenario: visit a representative route and assert the rendered HTML contains the canonical viewport meta
- [x] 7.6 Add a `feature.feature` edge-case scenario: visit a route that previously had a non-canonical viewport meta (e.g. `user-scalable=no`) and assert the lint has caught it (a unit-test scenario is fine for this)
- [x] 7.7 Add a `meta-name-viewport-audited-on-every-route.stories.tsx` story with a `play` interaction test that asserts the canonical viewport meta is present in `document.head`
- [x] 7.8 Update the per-row `specs.md` to point at the umbrella's `## MODIFIED Requirements` block "Viewport Meta Audited"

## 8. i18n Parity + Selector Discipline

- [x] 8.1 Add every new i18n key to the DE bundle in `src/lib/i18n.ts` (skeleton labels, filter / map / pagination labels, motion / viewport audit messages)
- [x] 8.2 Add the matching keys to the EN bundle
- [x] 8.3 Re-export the typed `ShellCopy` shape (or extend it) so the type checker fails when a key is added to one language and not the other
- [x] 8.4 Run the i18n parity unit test and confirm zero drift (4 pass / 0 fail)
- [x] 8.5 Run the selector-discipline lint (`tests/steps/lint/selectors.ts`) and confirm every new gherkin step uses only proximity + layout selectors
- [x] 8.6 Run `bun run check` and confirm no DE/EN drift type errors and no selector-discipline failures

## 9. Storybook Coverage

- [x] 9.1 Confirm every per-row `feature.feature` carries a `@story(component=…, story=…)` tag pointing at the matching `play` interaction test story
- [x] 9.2 Run `bun run storybook:coverage` and confirm zero drift
- [x] 9.3 Run `bun run test:storybook` and confirm every story passes

## 10. Verification

- [x] 10.1 Run `bun run check` — `astro check` + `biome check .` + `bun run specs:check` + `bun run tokens:check` + `bun run storybook:coverage` + `bun run lint:viewport` + `bun run scripts/check-no-console.ts` all pass
- [x] 10.2 Run `bun run test:e2e` — every per-row `feature.feature` passes
- [x] 10.3 Run `bun run test:storybook` — every per-row story passes
- [x] 10.4 Run `bun run test:visual` — no visual diff (only attributes + a single global CSS block added)
- [x] 10.5 Run `bun run storybook:coverage` — zero drift
- [x] 10.6 Run `bun run specs:check` — TypeSpec artifacts in sync (no changes expected)
- [x] 10.7 Run `bun run arch:check` — LikeC4 model in sync (no changes expected)
- [x] 10.8 Run `bun run tokens:check` — design tokens in sync (no changes expected)
- [x] 10.9 Run `openspec validate app-shell-aria-and-i18n-pass` — change is valid
- [x] 10.10 Flip the 09-iteration catalog rows for the six absorbed rows to `status: specced`, then `merged` once the implementation lands
- [x] 10.11 `openspec archive app-shell-aria-and-i18n-pass` to fold the `## MODIFIED Requirements` blocks into `openspec/specs/app-shell/spec.md`
