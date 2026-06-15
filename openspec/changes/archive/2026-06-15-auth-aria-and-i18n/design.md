## Context

The five absorbed rows in this umbrella all share the same shape of work
on the same capability (`auth`) and a small set of adjacent capabilities
(`forms-actions`, `i18n-copy`). The current code paths live across the
Better Auth integration (`src/lib/auth.ts`, `src/lib/auth-client.ts`,
`src/lib/auth-account-actions.ts`, `src/lib/auth-forms.ts`,
`src/lib/auth-display.ts`, `src/lib/auth-profile.ts`), the auth island
components in `src/components/unveiled/auth/` (or the equivalent
location in the new layout), the shared shell's logout affordance
(`src/components/unveiled/app-shell.tsx`), and the typed i18n
dictionary (`src/lib/i18n.ts`).

The current state is:

- The four auth forms submit through typed server actions, but their
  inputs and submit controls are not labeled; selectors resolve to
  `<input>` by index, which the selector-discipline lint
  (`tests/steps/lint/selectors.ts`) rejects. Field error and form
  error messages render in English regardless of the active language.
- The logout affordance in the shell is a plain `<button>` with an
  English-only label and no menu semantics; the dropdown that follows
  it has no `role="menu"` and no `aria-expanded` plumbing.
- The Better Auth error envelope returned to the client is the raw
  `code` (e.g. `INVALID_EMAIL_OR_PASSWORD`) plus a hard-coded English
  message. There is no per-language mapping, and the rendering helper
  does not consult the i18n module.
- The `shell.*` typed shape from the app-shell umbrella is the
  precedent; this umbrella extends the same pattern with
  `AuthFormCopy` and `AuthErrorCopy` typed shapes.

The constraints:

- The selector discipline is binding: no `data-testid`, no `getByText`
  chains, no CSS class selectors, no XPath. Every interactive element
  must be reachable through proximity (`getFieldNearestTo`,
  `getButtonNearestTo`, `getLinkNearestTo`) or layout (`getByRole`,
  `getByLabel`, `getByLandmark`, `getInside` with a semantic parent).
- DE/EN parity is enforced at type-check time: the i18n parity unit
  test (`src/lib/i18n.test.ts`) and the typed `ShellCopy`-style shapes
  ensure that adding a key to one language without the other fails
  `bun run check`.
- The Better Auth error envelope is the contract between the server
  action and the auth island; refactoring it must not break the
  existing action result envelope (`safe` / `data` / `error`) or
  re-introduce English literals on the wire.

## Goals / Non-Goals

**Goals:**

- Make every absorbed surface selector-disciplinable: every input has
  a `<label>` (or `aria-label`), every form has a `role="form"`
  landmark, every submit / link / button has a localized accessible
  name, every alert region has `role="alert"` and a localized
  message, and the logout menu has `role="menu"` + `aria-expanded`.
- Localize all visible copy on the four auth forms and the Better
  Auth error envelope in DE and EN, routed through typed
  `AuthFormCopy` and `AuthErrorCopy` shapes in `i18n.ts`, with the
  i18n parity unit test enforcing full coverage.
- Add the per-row gherkin scenarios (one happy-path + one edge-case
  each, 10 scenarios total) using proximity + layout selectors only.
- Add the per-row storybook stories (one `<component>.stories.tsx`
  each) with at least one `play` interaction test per story, each
  carrying a `@story(component=…, story=…)` tag wired to the gherkin
  scenario.
- Land the per-feature sub-folder format under
  `10-iteration/features/improvements/auth-aria-and-i18n/<row-slug>/`
  with `proposal.md` + `tasks.md` + `feature.feature` +
  `<component>.stories.tsx` + `specs.md` for every absorbed row.

**Non-Goals:**

- No new HTTP routes or Astro Actions are added; the existing typed
  server actions are reused, so no `typespec/**` entry is required
  (and `bun run specs:check` is not exercised for this umbrella).
- No new LikeC4 elements are added; the refactor touches existing
  containers only, so no `architecture/model.ts` change is required
  (and `bun run arch:check` is not exercised for this umbrella).
- No new design tokens are introduced; existing primitives are
  reused, so no `bun run tokens:check` change is required.
- No new dependencies are added; Storybook 8.6, `@storybook/test`,
  and the `@story(...)` tag schema are already shipped.
- The `auth` capability's session, viewer hydration, and authorization
  behavior (already shipped under
  `archive/2026-05-07-complete-auth-session-flow-parity`) are not
  changed; only the visible auth surfaces and the error envelope are
  refactored.

## Decisions

- **Decision:** Use real `<label htmlFor=…>` (not `aria-label` only)
  for every form input, with `aria-describedby` pointing at the field
  error region so the proximity `getFieldNearestTo` step can resolve
  the field and its error together. **Rationale:** The selector
  discipline rewards real labels (`getByLabel`) and `aria-describedby`
  is the only a11y-compliant way to associate a hint or error with an
  input. **Alternatives considered:** `aria-label` only — rejected
  because it hides the label from sighted users and breaks the
  `getByLabel` layout selector.

- **Decision:** Wrap each form in `<form role="form" aria-label={…}>`
  and group related fields with `<fieldset>` + `<legend>` (e.g. the
  signup form's name fields, the recovery form's email field).
  **Rationale:** `role="form"` is the layout-anchor for `getInside`
  proximity; a `<fieldset>` lets a `getFieldNearestTo` resolve the
  "first name" input without relying on DOM order. **Alternatives
  considered:** plain `<div>` wrappers — rejected because they do
  not provide a layout landmark the proximity+layout selector
  discipline can target.

- **Decision:** Map Better Auth error codes through a single
  `mapAuthError(code, language)` helper that returns a typed
  `AuthErrorCopy` entry; the helper consults `i18n.auth.errors.<code>`
  first, falls back to `i18n.auth.errors.unknown`, and finally to the
  `{i18n.missing:<key>}` placeholder for unmapped codes.
  **Rationale:** Centralizing the mapping in one place keeps the
  action envelope unchanged, lets the i18n parity unit test cover
  every code, and the missing-key placeholder is the
  i18n-copy spec's contract for surfacing gaps. **Alternatives
  considered:** per-component mapping — rejected because the same
  code can surface from multiple actions and forms.

- **Decision:** Extend the typed dictionary shape pattern from the
  app-shell umbrella (`shell.*` → `ShellCopy`) with two new shapes:
  `AuthFormCopy` (per-form bundles: `auth.forms.signup.*`,
  `auth.forms.login.*`, `auth.forms.logout.*`,
  `auth.forms.passwordRecovery.*`) and `AuthErrorCopy`
  (`auth.errors.*` keyed by Better Auth error code).
  **Rationale:** Mirrors the existing precedent, makes DE/EN parity
  type-enforced, and keeps the i18n module the single source of
  component copy (per the `i18n-copy` spec). **Alternatives
  considered:** a flat `auth.*` namespace — rejected because it
  scales poorly and the per-form sub-bundles map cleanly to the
  per-row folder structure under
  `10-iteration/features/improvements/auth-aria-and-i18n/<row-slug>/`.

- **Decision:** Storybook stories mount the auth components with
  `AuthFormContext` and `AuthErrorContext` providers that return
  mock i18n, mock Better Auth client, and mock TanStack Query
  state. The `play` tests use `@storybook/test`'s `userEvent` +
  `within` to drive the same flow as the gherkin scenario (e.g.
  `signup-form.feature` → `SignupForm.stories.tsx` "happy path"
  story). **Rationale:** Mirrors the app-shell umbrella's
  `app-shell.stories.tsx` pattern; the `bun run storybook:coverage`
  gate enforces the `@story(...)` tag pairing. **Alternatives
  considered:** invoking the real Better Auth client in stories —
  rejected because stories must be deterministic and not depend on
  a network round-trip.

- **Decision:** Keep the per-row gherkin files under
  `tests/features/identity/<row-slug>.feature` (one per absorbed
  row) rather than a single umbrella-level file. **Rationale:** The
  10-iteration Definition of Done requires one `feature.feature`
  per absorbed row so the per-row Definition of Done can be checked
  off independently. **Alternatives considered:** a single
  `auth-aria.feature` — rejected because it would conflate the
  per-row coverage.

- **Decision:** For the logout affordance in the shell, reuse the
  menu semantics the app-shell umbrella established for the language
  toggle (`role="menu"`, `aria-haspopup`, `aria-expanded`,
  `aria-current`) rather than introducing a new pattern.
  **Rationale:** Consistency with the rest of the shell; the
  `app-shell` spec already documents the menu semantics. **Alternatives
  considered:** a native `<select>` for logout — rejected because
  the logout menu also contains "open profile" and "log out
  everywhere" actions that are not single-value choices.

## Risks / Trade-offs

- **Risk:** Adding `<label htmlFor=…>` to the existing inputs may
  shift the DOM order or add new wrapper elements that the legacy
  e2e snapshots depend on. **Mitigation:** the `tests/visual/`
  baselines for the auth pages are updated as part of the umbrella's
  visual regression task; the change is reviewed against the
  approved visual diff before merge.

- **Risk:** The Better Auth error-code set may grow in a future
  Better Auth release, leaving a new code unmapped. **Mitigation:**
  the missing-key placeholder contract (`{i18n.missing:<code>}`) is
  the spec's contract; the i18n parity unit test will report a
  missing key, and the dev-server console warning will surface it
  during development (per the `i18n-copy` spec).

- **Risk:** Centralizing the error mapping in `mapAuthError` could
  regress performance if the lookup walks the entire `AuthErrorCopy`
  on every action. **Mitigation:** the helper is a single object
  property read (`auth.errors[code]`) and is invoked only on the
  failure path of the action envelope; the success path is
  unaffected.

- **Risk:** The new per-row gherkin files add 10 scenarios (2 per
  row × 5 rows) to the parity suite, which could lengthen CI.
  **Mitigation:** the scenarios are selector-only and do not require
  additional seeded data; the per-row stories reuse the existing
  mock data shape, and the runner is already exercised against
  per-feature files in earlier umbrellas.

## Migration Plan

- The umbrella lands as one OpenSpec change
  (`openspec/changes/auth-aria-and-i18n/`) plus the per-feature
  folder
  (`10-iteration/features/improvements/auth-aria-and-i18n/`).
- Implementation follows the umbrella `tasks.md` top-to-bottom; each
  absorbed row's `tasks.md` is the per-row checklist and is updated
  as the row is finished.
- No new HTTP route or Astro Action is added, so the TypeSpec,
  LikeC4, and design-token drift gates are not exercised for this
  umbrella (the umbrella's `tasks.md` does not invoke
  `bun run specs:gen`, `bun run arch:check`, or
  `bun run tokens:gen`).
- The umbrella's OpenSpec change is archived via
  `openspec archive auth-aria-and-i18n` once every task is checked
  off and the Definition of Done is satisfied
  (`bun run check`, `bun run test:e2e`, `bun run test:storybook`,
  `bun run storybook:coverage`, and the i18n parity unit test).
- The 09-iteration catalog rows for the five absorbed entries
  (`signup-form-aria-and-i18n`, `login-form-aria-and-i18n`,
  `logout-flow-aria`, `password-recovery-aria-and-i18n`,
  `better-auth-error-i18n`) are flipped from `pending` to
  `specced` (after the proposal is merged) and then to `merged`
  (after the implementation lands).

## Open Questions

- _None at proposal time._ The implementation tasks in `tasks.md`
  are ordered so any clarification needed during code review (e.g.
  exact `<label>` wording for the "log out everywhere" affordance,
  or the choice of icon-only control vs. text control for the
  mobile password-recovery submit) can be settled per-row inside
  the per-row `tasks.md`.
