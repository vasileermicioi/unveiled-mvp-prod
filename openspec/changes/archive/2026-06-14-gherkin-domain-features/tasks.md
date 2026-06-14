## 1. Step Definition Infrastructure

- [x] 1.1 Create `tests/steps/` directory with `dsl.ts`, `seed.ts`, and the `selectors/` and `verbs/` subdirectories
- [x] 1.2 Add `tests/steps/dsl.ts` exporting a `StepRegistry` type, `defineStep<Args>(...)` generic locked to a `z.object(...)` schema, and the `Given` / `When` / `Then` re-exports
- [x] 1.3 Add `tests/steps/selectors/proximity.ts` exporting `getFieldNearestTo(label)`, `getButtonInside(landmark, name)`, and `getLinkNearestTo(label)` helpers that wrap Playwright's `page.getBy…` API
- [x] 1.4 Add `tests/steps/selectors/layout.ts` exporting `getByRole`, `getByLabel`, `getByText` (with `exact: true` only when the literal text matters), and `getRegion(landmark, selector)` helpers
- [x] 1.5 Add `tests/steps/seed.ts` exporting a `seed()` function, `seedEmails` (member, partner, admin, guest), and `seedRoutes` constants — no hard-coded fixture values in feature files
- [x] 1.6 Add `tests/steps/selectors/index.ts` and `tests/steps/verbs/index.ts` barrels that re-export the proximity/layout helpers and the verb registrations

## 2. Verb Modules

- [x] 2.1 Add `tests/steps/verbs/auth.steps.ts` registering `the user is logged in as <role>` and `the user logs out`
- [x] 2.2 Add `tests/steps/verbs/navigation.steps.ts` registering `the user navigates to <route>`
- [x] 2.3 Add `tests/steps/verbs/forms.steps.ts` registering `the user submits <form> with <values>` and `the user toggles <control>`
- [x] 2.4 Add `tests/steps/verbs/lists.steps.ts` registering `the user opens the <nth> item in <list>` and `the user asserts the <nth> item in <list> shows <text>`
- [x] 2.5 Add `tests/steps/verbs/modals.steps.ts` registering `the user confirms the modal` and `the user dismisses the modal`
- [x] 2.6 Add `tests/steps/verbs/visual.steps.ts` registering `the user asserts <assertion>` covering the design-token class-name checks
- [x] 2.7 Add `tests/steps/verbs/network.steps.ts` registering `the user waits for <request> to complete` and `the user asserts the response is <status>`
- [x] 2.8 Add `tests/steps/verbs/data.steps.ts` registering `the user asserts the <surface> data contains <values>` and `the user asserts the <surface> data does not contain <values>`
- [x] 2.9 Add `tests/steps/verbs/i18n.steps.ts` registering `the user switches the language to <lang>` and `the user asserts the active language is <lang>`
- [x] 2.10 Add `tests/steps/verbs/time.steps.ts` registering `the user advances the clock by <duration>` and `the user asserts the current time is <time>`
- [x] 2.11 Add a barrel `tests/steps/verbs/index.ts` that re-exports every verb's `register<Verb>Steps` and a single `registerAllSteps(registry)` entry point

## 3. Runner

- [x] 3.1 Add `tests/parity/gherkin.spec.ts` (Playwright spec) that imports the step registry, walks `tests/features/**/*.feature`, and dispatches each `Given` / `When` / `Then` to the registered handler
- [x] 3.2 Add a `@story(component=…, story=…)` tag parser to the runner: when the tag is present, emit `console.warn('@story tag present but Storybook iframe runner is not yet implemented; falling back to the real route (see 09-iteration)')` and continue against the real route
- [x] 3.3 Add a `BUN_GHERKIN_TAGS` env override so a subset of scenarios can be selected by tag
- [x] 3.4 Add a barrel `tests/steps/step-definitions.ts` that re-exports each verb's `register<Verb>Steps` (kept as the legacy entry point per the proposal)
- [x] 3.5 Reduce `tests/features/core-platform.feature` to an empty `Feature:` header (the legacy file is kept on disk pending the 09-iteration migration)

## 4. Per-Domain Feature Files (Core Platform)

- [x] 4.1 Add `tests/features/core-platform/app-shell.feature` (header, nav, drawer, language toggle)
- [x] 4.2 Add `tests/features/core-platform/discovery.feature` (filters, map, grid, empty state, pagination)
- [x] 4.3 Add `tests/features/core-platform/responsive.feature` (mobile drawer, breakpoints, skeleton loaders)

## 5. Per-Domain Feature Files (Identity)

- [x] 5.1 Add `tests/features/identity/session.feature` (signup, login, logout, password recovery, redirects)
- [x] 5.2 Add `tests/features/identity/authorization.feature` (role-gated routes, deep-link preservation)

## 6. Per-Domain Feature Files (Discovery, Bookings)

- [x] 6.1 Add `tests/features/discovery/search-filter.feature`
- [x] 6.2 Add `tests/features/discovery/calendar.feature` (`.ics` download)
- [x] 6.3 Add `tests/features/bookings/booking.feature` (book, waitlist, cancel, redeem)
- [x] 6.4 Add `tests/features/bookings/redemption.feature` (voucher, secret code, URL)

## 7. Per-Domain Feature Files (Billing, Operations)

- [x] 7.1 Add `tests/features/billing/subscriptions.feature` (Stripe checkout, webhook, portal)
- [x] 7.2 Add `tests/features/billing/credits.feature` (refill, debit, admin freeze/unfreeze, ledger)
- [x] 7.3 Add `tests/features/operations/partner-check-in.feature`
- [x] 7.4 Add `tests/features/operations/admin-crud.feature` (events, partners, members, metrics)
- [x] 7.5 Add `tests/features/operations/exports.feature` (partner + admin CSV/Excel)

## 8. Per-Domain Feature Files (Media, Jobs, Infrastructure)

- [x] 8.1 Add `tests/features/media/upload.feature` (R2 + SafeImage)
- [x] 8.2 Add `tests/features/jobs/scheduled-emails.feature`
- [x] 8.3 Add `tests/features/jobs/cron-workers.feature`
- [x] 8.4 Add `tests/features/infrastructure/health-readiness.feature`
- [x] 8.5 Add `tests/features/infrastructure/parity-smoke.feature` (the one happy-path scenario that lives in 09-iteration)

## 9. Spec Integration

- [x] 9.1 Confirm the `openspec/changes/gherkin-domain-features/specs/gherkin-domain-features/spec.md` new-capability spec is in place
- [x] 9.2 Confirm the `openspec/changes/gherkin-domain-features/specs/e2e-gherkin-playwright/spec.md` `MODIFIED Requirements` delta is in place
- [x] 9.3 Confirm the `MODIFIED Requirements` delta in `openspec/changes/gherkin-domain-features/specs/viewer-session/spec.md` is in place
- [x] 9.4 Confirm the `MODIFIED Requirements` delta in `openspec/changes/gherkin-domain-features/specs/routing/spec.md` is in place
- [x] 9.5 Confirm the `MODIFIED Requirements` delta in `openspec/changes/gherkin-domain-features/specs/i18n-copy/spec.md` is in place
- [x] 9.6 Confirm the `MODIFIED Requirements` delta in `openspec/changes/gherkin-domain-features/specs/data-access/spec.md` is in place
- [x] 9.7 Confirm the `MODIFIED Requirements` delta in `openspec/changes/gherkin-domain-features/specs/forms-actions/spec.md` is in place

## 10. Documentation And Runner Wiring

- [x] 10.1 Add a short README at `tests/features/README.md` documenting the two `Background:` templates (per-role and per-guest) and the `@story(component=…, story=…)` tag schema
- [x] 10.2 Add a `test:e2e` script to `package.json` that runs `bun test tests/parity/gherkin.spec.ts` (no-op if Playwright is not installed in this iteration; the script is a no-op stub until 09-iteration wires the Playwright runner)

## 11. Verification

- [x] 11.1 Run `openspec validate --changes --type all` and confirm the change passes
- [x] 11.2 Run `bun run check` and resolve any errors introduced by the new files (biome / specs:check / tokens:check)
