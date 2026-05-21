## Context

The current parity test suite covers functional states, routes, and data structures. However, layout, spacing, colors, and responsive responsiveness must align with the legacy `_old_app` design guidelines. To prevent visual regression, we need an automated screenshot-based visual regression testing suite that operates on a deterministic set of mock/seeded data.

## Goals / Non-Goals

**Goals:**
- Implement automated screenshot visual verification for public, member, partner, and admin routes.
- Integrate screenshot checks within both desktop and mobile viewports.
- Define a reproducible and deterministic visual state by disabling animations, transitions, and dynamic components (like live maps or external payment forms).
- Create a clear workflow for review and baseline updates.
- Document manual verification steps for areas not suitable for automated visual testing.

**Non-Goals:**
- Automated pixel-for-pixel comparison against legacy `_old_app` dist assets.
- Capturing dynamic maps or external payment provider iframe contents (these will be mocked or masked).
- Performing high-concurrency cross-browser/device testing beyond standard Chrome desktop and mobile viewports.

## Decisions

### 1. Integration Strategy: Playwright Screenshot Comparisons
- **Decision**: Use Playwright's native screenshot comparison capabilities (`toHaveScreenshot`) rather than introducing third-party packages or visual SaaS tools.
- **Rationale**: The project already relies on Playwright for parity and smoke tests. Playwright has robust built-in support for snapshot testing, multi-viewport configurations, and visual diff generation.
- **Implementation**: Visual tests will reside under `tests/visual/` with a separate command `bun run test:visual` to prevent visual tests from slowing down the standard parity smoke pipeline.

### 2. Stabilization & Determinism
- **Decision**: Inject custom stylesheet/styles to suppress animations/transitions and mask external components.
- **Rationale**: Dynamic features (CSS transitions, blinking cursors, web font loading, external map tiles, and payment frames) cause non-deterministic screenshots.
- **Implementation**:
  - Disable animations in Playwright using `page.addStyleTag({ content: '* { transition: none !important; animation: none !important; scroll-behavior: auto !important; }' })` and setting `{ animations: 'disabled' }` in `toHaveScreenshot()`.
  - Use Playwright's `mask` property to overlay static color blocks on Stripe inputs, Google Maps elements, and other dynamic frames.
  - Utilize dedicated seed scripts to load identical domain fixtures prior to visual test runs.

### 3. Visual Checklist for Manual Review
- **Decision**: Create a manual visual checklist at `docs/testing/visual-checklist.md` for components that are hard to capture automatically.
- **Rationale**: Features like hover tooltips, click-to-copy flashes, and some interactive visual transitions require human eyes to verify layout and behavior against legacy design.

## Risks / Trade-offs

- **[Risk]** Flaky test failures due to minor font-rendering differences across environments (local vs CI).
  - *Mitigation*: Configure a small color difference threshold (`threshold: 0.1`) and pixel count tolerance (`maxDiffPixels: 50`) in Playwright's screenshot options.
- **[Risk]** Bloating the Git repository with large binary baseline images.
  - *Mitigation*: Restrict screenshots to critical route landmarks and layout views (avoid screenshotting every minor state permutation). Compress baselines before committing.
