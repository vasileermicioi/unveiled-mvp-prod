## 1. Environment Integration & Tooling Setup

- [x] 1.1 Add required E2E Gherkin/Playwright dependency extensions to package configurations
- [x] 1.2 Configure Playwright BDD options and add the `test:e2e` CLI execution script to `package.json`

## 2. Layout and Proximity Helpers

- [x] 2.1 Implement proximity selector utilities to locate interactive inputs nearest to label strings
- [x] 2.2 Set up mobile and desktop responsive viewport profiles inside Playwright runner options

## 3. Feature Specifications and Step Definitions

- [x] 3.1 Create Gherkin `.feature` spec files under `tests/features/` defining all required epic scenarios
- [x] 3.2 Write step mapping definitions under `tests/steps/` executing browser logic for Gherkin statements
- [x] 3.3 Ensure test scenarios cover localization toggle, credential auth redirects, calendar download, check-in portal operations, and admin page grids

## 4. Verification & Validation

- [x] 4.1 Run the new E2E test command `bun run test:e2e` and verify all BDD tests pass successfully
- [x] 4.2 Run diagnostics and code formatting checks via `bun run check` to ensure clean compilation
