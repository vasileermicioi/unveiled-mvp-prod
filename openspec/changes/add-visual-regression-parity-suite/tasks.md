## 1. Setup And Configuration

- [x] 1.1 Add visual regression configuration parameters to `playwright.config.ts` (including snapshot settings, matching thresholds, and baseline directories).
- [x] 1.2 Add a dedicated `test:visual` runner script to `package.json` to target only visual regression tests.
- [x] 1.3 Create visual regression helper utilities in `tests/visual/helpers.ts` to automate animation suppression, transition disabling, font stabilization, and dynamic element masking (Google Maps and Stripe inputs).

## 2. Public Route Coverage

- [x] 2.1 Implement visual tests for guest-accessible routes (landing and discover routes) covering both desktop and mobile viewports.
- [x] 2.2 Implement visual tests for remaining public routes (how-it-works, membership, FAQ, login, and signup routes).
- [x] 2.3 Run the baseline generation command to capture and check initial approved screenshots for all public routes.

## 3. Authenticated Route Coverage

- [x] 3.1 Implement visual tests for member-scoped routes (discovery, saved, bookings, onboarding, and profile pages).
- [x] 3.2 Implement visual tests for partner portal routes (guest registry and venue settings page).
- [x] 3.3 Implement visual tests for admin portal routes (dashboard, event directory, and member management).
- [x] 3.4 Run the baseline generation command to capture and check initial approved screenshots for all authenticated routes.

## 4. Documentation And Checklists

- [x] 4.1 Create a manual visual review checklist at `docs/testing/visual-checklist.md` outlining specific interactive elements requiring manual verification.
- [x] 4.2 Document the visual regression suite setup, test commands, and baseline update workflow in `docs/testing/playwright-testing.md`.

## 5. Verification

- [x] 5.1 Run the full `bun run test:visual` suite to verify that all snapshots match baselines and no errors are raised.
- [x] 5.2 Validate that the standard functional parity test pipeline (`bun run test:parity`) executes correctly and remains unaffected.
