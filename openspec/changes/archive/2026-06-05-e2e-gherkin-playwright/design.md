## Context

Currently, the Unveiled MVP uses standard Playwright E2E tests (`tests/parity/*.spec.ts`) and visual assertions. To support more expressive, human-readable user story mapping and align developer implementation directly with spec-defined scenarios, we are introducing a Behavior-Driven Development (BDD) Cucumber/Gherkin execution framework on top of Playwright.

## Goals / Non-Goals

**Goals:**
- Provide Gherkin feature runner parsing capabilities inside the Playwright runner.
- Map and execute scenarios covering Localization, Authentication, Booking Modal, Calendar Sync, Partner Verification, and Admin Control panels.
- Build proximity locator helpers to target inputs relative to labels or page sections.
- Validate responsive viewports across mobile and desktop sizes.

**Non-Goals:**
- Deprecate existing parity-smoke tests (they remain active).
- Mock or cover future capability requirements (Map Leaflet, Stripe payments, R2 image storage).

## Decisions

### Decision 1: Gherkin-to-Playwright Test Compilation
- **Choice**: Compile `.feature` files to standard Playwright `.spec.ts` files (using a tool like `playwright-bdd`) or custom loader mappings. This enables utilizing standard Playwright features such as tracing, video recording, reporters, and parallel runners without duplicating configurations.
- **Alternative**: Standalone `Cucumber.js` runner. Rejected because it requires separate configurations for browsers and test reports, and limits integration with Playwright's native test features.

### Decision 2: Proximity Selector Helpers
- **Choice**: Implement proximity selectors using custom Playwright locator helper wrappers (e.g. `page.locator('input').filter({ has: page.locator('text=Email') })` or traversing parent layouts to target inputs nearest to sibling labels).
- **Alternative**: Hardcoded element IDs. Rejected because styling updates, layout refactors, or language translation overlays regularly break hardcoded CSS ID selectors.

### Decision 3: Viewport-based Device Profiles
- **Choice**: Leverage standard Playwright viewport parameters (mobile vs. desktop configuration objects) to automate switching layouts dynamically during Gherkin viewport tests.

## Risks / Trade-offs

- [Risk] BDD step compilation adds maintenance overhead → *Mitigation*: Keep step definition implementations highly reusable and keep feature specs tightly focused on core user journeys.
- [Risk] Timing synchronization flakiness on transient states (e.g. loading text) → *Mitigation*: Use retry assertions (`toPass` or Playwright auto-waiting locators) to wait for stable indicators.
