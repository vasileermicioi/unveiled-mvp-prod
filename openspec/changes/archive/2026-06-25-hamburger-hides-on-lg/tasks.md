## 1. Design-system fix

- [x] 1.1 In
      `packages/design-system/src/organisms/shell/shell-icon-button/shell-icon-button.tsx`,
      add `lg:hidden` to the `cn(...)` Tailwind class list on the
      rendered `<button>` element.
- [x] 1.2 Update the existing Ladle story at
      `packages/design-system/src/organisms/shell/shell-icon-button/shell-icon-button.ladle.tsx`
      to ship a `lg-viewport` story and a `sm-viewport` sibling
      demonstrating the gate with Ladle's `viewport` knob.

## 2. Gherkin regression

- [x] 2.1 Create
      `tests/features/shell/mobile-drawer/feature.feature` with the
      two new scenarios from
      `openspec/changes/hamburger-hides-on-lg/specs/shell-aria-i18n/spec.md`
      ("Hamburger toggle is hidden at viewports ≥ 1024 px" and
      "Hamburger toggle is visible at viewports < 1024 px"), each
      tagged
      `@ladle(component="app-shell", story="lg-viewport")` (and a
      sibling `sm-viewport` tag for the visible case).
- [x] 2.2 Create
      `tests/features/shell/mobile-drawer/app-shell.ladle.tsx`
      mounting `AppShellPresentational` (with mock header / drawer
      fixtures) and exporting the `lg-viewport` and `sm-viewport`
      stories consumed by the gherkin `@ladle` tags.
- [x] 2.3 Run `bun run ladle:coverage` and confirm the new stories
      resolve and the script reports no drift.

## 3. Playwright visual regression

- [x] 3.1 Add a Playwright spec under
      `tests/parity/shell/mobile-drawer.spec.ts` (or the existing
      parity suite) that boots the gherkin `mobile-drawer` feature at
      viewport 1440 px and asserts the hamburger toggle has
      `display: none` via its computed style.
- [x] 3.2 Add a sibling assertion at viewport 375 px that the
      hamburger toggle is visible (`display` not `none`) and that
      clicking it opens the mobile drawer.
- [x] 3.3 Capture Playwright visual baselines
      `tests/visual/shell/icon-button-lg-hidden.png` (1440 px) and
      `tests/visual/shell/icon-button-sm-visible.png` (375 px).

## 4. Documentation

- [x] 4.1 Create `docs/shell.md` if it does not already exist;
      otherwise append a paragraph documenting that the `lg` breakpoint
      (1024 px) is the shared gate for both the hamburger toggle
      (`ShellIconButton`) and the mobile drawer panel
      (`ShellMobileDrawer`), and that the gate is owned by the design
      system, not the consumers.

## 5. Validation

- [x] 5.1 Run `bun run check` and confirm
      `bun run check:styling-ownership`,
      `bun run check:atomic-layers`, `astro check`, `biome check .`,
      `bun run specs:check`, and `bun run tokens:check` all pass.
- [x] 5.2 Run `bun run test:e2e` and confirm the gherkin parity suite
      (including the new `mobile-drawer` feature) passes against the
      orchestrator's port-4320 proxy.
- [x] 5.3 Run `bun run test:ladle` and confirm the new
      `@ladle(component="app-shell", story="lg-viewport")` /
      `sm-viewport` scenarios pass against the Ladle project.
- [x] 5.4 Validate the change with `openspec validate
      hamburger-hides-on-lg` and resolve every reported error before
      opening the PR.
