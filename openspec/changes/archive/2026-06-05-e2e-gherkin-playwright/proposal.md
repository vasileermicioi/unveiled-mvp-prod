## Why

As the codebase scales, verifying visual layout stability and logical consistency across dynamic, localized, and responsive screens becomes increasingly complex. Standard unit and contract tests cannot adequately capture real-world user flows. Introducing a Behavior-Driven Development (BDD) End-to-End (E2E) testing framework using Cucumber/Gherkin syntax on top of Playwright provides a human-readable, executable specification language that ensures 100% platform integrity and smooth user journeys.

## What Changes

- **Gherkin Feature Executions**: Integrate Gherkin parsing capabilities directly within the Playwright test runner (`bun run test:e2e`), converting `.feature` files into executable Playwright tests.
- **Layout & Proximity Selectors**: Develop reusable selector utilities to target interactive fields relative to visible label positions (e.g., fields close to "Email" or "Confirm access").
- **Responsive Viewport Executions**: Configure Playwright to run scenarios against distinct viewports (mobile drawer layout checks vs. expanded desktop frames).
- **Core Feature Coverage**: Implement Gherkin specifications and mapping step definitions for:
  - Localization switching state and translation updates.
  - Authentication flow credentials and role-based redirect guard middleware.
  - Credit adjustments and atomic ticket bookings.
  - Personal calendar download synchronization (.ics).
  - Venue check-in portal verification and manual state transitions.
  - Paginated admin dashboard management components.

## Capabilities

### New Capabilities
- `e2e-gherkin-playwright`: An E2E verification framework executing Gherkin feature specs in Playwright, supporting proximity layout selectors, viewport validation, and scenario step mapping for localization, auth, booking, and administrative portals.

### Modified Capabilities
<!-- Leave empty as no existing main spec requirements are being modified -->

## Impact

- **New Test Files**: Introduction of Gherkin feature files under `tests/features/*.feature` and corresponding step definition mappings under `tests/steps/*.ts`.
- **Package Additions**: Addition of `@playwright/test` extensions or helper libraries to compile/execute Gherkin files.
- **CLI Commands**: Addition of `test:e2e` scripts within `package.json` to trigger the BDD E2E pipeline.
- **Environment**: Leverages seeded database mock environments for clean session validation.
