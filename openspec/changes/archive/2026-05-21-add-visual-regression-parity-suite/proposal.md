## Why

The current parity suite verifies routes, visible landmarks, data wiring, and key flows, but it does not prove visual parity. The project scope requires the new app to preserve legacy visual layouts, component appearance, spacing, typography, colors, icons, and responsive behavior. An automated screenshot-based visual regression suite is needed to prevent visual drift from `_old_app`.

## What Changes

- Add automated screenshot regression coverage for critical public, member, partner, and admin routes.
- Introduce dual viewport (desktop and mobile) visual verification.
- Establish deterministic screenshot configurations including reduced animations, disabled transitions, and stable seeded mock data.
- Support visual comparison of migrated routes against approved baseline screenshots.
- Provide diff artifacts in test outputs for intentional visual reviews before baseline updates.
- Create a manual legacy-reference checklist for visual aspects where automated comparison is impractical.
- Document the snapshot update and baseline maintenance workflow.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `ui-system`: Establishing visual regression baseline requirements and primitive styling stability.
- `pages`: Establishing visual regression baseline requirements for public and authenticated routes.

## Impact

- Affected code includes test configuration in `playwright.config.ts`, visual tests under `tests/visual/`, styling files like `src/styles/global.css`, and docs under `docs/testing/playwright-testing.md`.
- No pixel-for-pixel comparison against legacy built assets will be performed in CI, and provider iframe contents (such as Stripe and Google Maps) will be masked or mocked to ensure determinism.
