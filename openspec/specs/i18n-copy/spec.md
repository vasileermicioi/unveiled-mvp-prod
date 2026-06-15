## Purpose

Define the i18n.ts dictionary shape, the URL → cookie → DB preference resolution order, the DE/EN parity rules, and the missing-key fallback contract.
## Requirements
### Requirement: Gherkin Coverage For The Language Toggle And Missing-Key Fallback
The i18n-copy spec SHALL be exercised by at least one Gherkin scenario for the language toggle and one for the missing-key fallback, and the scenario id SHALL be referenced from this capability spec.

#### Scenario: Gherkin scenario exercises the language toggle
- **WHEN** a contributor reads `tests/features/core-platform/app-shell.feature`
- **THEN** at least one scenario clicks the language toggle in the header
- **AND** asserts that the language cookie is set to the chosen language
- **AND** asserts that the page content and menu labels are translated

#### Scenario: Gherkin scenario exercises the missing-key fallback
- **WHEN** a contributor reads `tests/features/core-platform/app-shell.feature` or a page-level feature file
- **THEN** at least one scenario asserts that a missing translation key renders the `{i18n.missing:<key>}` placeholder rather than silently falling back to the other language

### Requirement: i18n Dictionary Has a Declared Shape

The application's `i18n.ts` dictionary SHALL conform to a typed
shape exported from the i18n-copy spec, and the shape SHALL be the
single source of truth for which keys exist. The `shell.*` bundle
SHALL be declared as a typed `ShellCopy` shape, the per-form auth
copy SHALL be declared as a typed `AuthFormCopy` shape, and the
Better Auth error-code copy SHALL be declared as a typed
`AuthErrorCopy` shape, so the type checker enforces DE/EN parity of
every shell-, auth-form-, and auth-error-rendered string.

#### Scenario: Dictionary is fully typed

- **WHEN** a contributor imports the dictionary type
- **THEN** TypeScript reports a key for every translatable string
  in the application
- **AND** every translation key present in the dictionary type is
  defined in both the German and English bundles.

#### Scenario: Missing key in one language fails the type check

- **WHEN** a contributor adds a new key to the German bundle but
  not the English bundle
- **THEN** `bun run check` reports a type error
- **AND** the contributor cannot merge until both languages are
  updated.

#### Scenario: Stale key in one language fails the type check

- **WHEN** a contributor removes a key from the German bundle but
  leaves it in the English bundle
- **THEN** `bun run check` reports a type error
- **AND** the contributor cannot merge until both languages are
  updated.

#### Scenario: Shell bundle is type-enforced

- **WHEN** a contributor adds a new key to the DE `shell.*` bundle
  or removes one
- **THEN** `bun run check` reports a type error if the EN
  `shell.*` bundle is not updated to match
- **AND** the typed `ShellCopy` shape is exported from
  `src/lib/i18n.ts` so the parity rule is enforced statically.

#### Scenario: Auth form copy is type-enforced

- **WHEN** a contributor adds or removes a key in the DE
  `auth.forms.signup.*`, `auth.forms.login.*`, `auth.forms.logout.*`,
  or `auth.forms.passwordRecovery.*` bundle
- **THEN** `bun run check` reports a type error if the matching key
  is not updated in the EN bundle
- **AND** the typed `AuthFormCopy` shape is exported from
  `src/lib/i18n.ts` so the parity rule is enforced statically.

#### Scenario: Auth error copy is type-enforced

- **WHEN** a contributor adds or removes a Better Auth error code in
  the DE `auth.errors.*` bundle
- **THEN** `bun run check` reports a type error if the matching
  code is not updated in the EN bundle
- **AND** the typed `AuthErrorCopy` shape is exported from
  `src/lib/i18n.ts` so the parity rule is enforced statically
- **AND** the i18n parity unit test asserts that every key in
  `AuthErrorCopy` is defined in both DE and EN.

### Requirement: Language Preference Resolution Order Is URL, Cookie, Then Database
The i18n-copy spec SHALL declare the canonical resolution order for a viewer's language preference, and the runtime SHALL follow it in that order.

#### Scenario: URL prefix wins
- **WHEN** a request arrives at `/en/discover`
- **THEN** the active language is `en` regardless of cookie or database values
- **AND** the language cookie is not overwritten

#### Scenario: Cookie wins when the URL has no language prefix
- **WHEN** a request arrives at a route without a language prefix
- **AND** the language cookie is set to `de`
- **THEN** the active language is `de`
- **AND** the response includes a redirect to the `de` URL prefix

#### Scenario: Database preference wins when the URL and cookie are absent
- **WHEN** a request arrives at a route without a language prefix
- **AND** the language cookie is not set
- **AND** the authenticated viewer's profile stores a `languagePreference` of `de`
- **THEN** the active language is `de`
- **AND** the language cookie is set for subsequent requests

#### Scenario: Default language wins when none of the above apply
- **WHEN** a request arrives at a route without a language prefix
- **AND** the language cookie is not set
- **AND** the viewer is a Guest
- **THEN** the active language is the declared default (`de`)
- **AND** the response includes a redirect to the default language URL prefix

### Requirement: Missing-Key Fallback Is Visible and Traceable
The i18n-copy spec SHALL declare the missing-key fallback string and the rule that it must be visible (not silently empty) so a missing key is noticed immediately, and the fallback SHALL apply to unmapped Better Auth error codes surfaced through the auth actions.

#### Scenario: Missing key renders the placeholder
- **WHEN** a component asks for a key that does not exist in the active language
- **THEN** the rendered string is `{i18n.missing:<key>}` (or a stable variant documented in the spec)
- **AND** the placeholder is visible to the contributor running the dev server

#### Scenario: Missing key never renders the other language's value
- **WHEN** a key is missing in the active language
- **THEN** the rendered string is the missing-key placeholder
- **AND** the runtime MUST NOT silently fall back to the other language's value (silent fallback hides the gap during DE/EN parity work)

#### Scenario: Missing key is logged
- **WHEN** a missing key is rendered
- **THEN** a console warning logs the missing key and the active language
- **AND** in production, the warning is routed to the existing error-logging surface

#### Scenario: Unmapped Better Auth error renders the missing-key placeholder
- **WHEN** a Better Auth action returns an error code that is not present in the typed `AuthErrorCopy` shape
- **THEN** the rendered string is the `{i18n.missing:auth.errors.<code>}` placeholder
- **AND** the dev-server console warning logs the missing code and the active language.

### Requirement: New Copy Must Be Added in Both Languages Before Merging
The i18n-copy spec SHALL declare that adding a new translatable string requires both the German and English bundles to be updated in the same commit, and the type check enforces it.

#### Scenario: Single-language addition fails the type check
- **WHEN** a contributor adds a new key to the German bundle but not the English bundle
- **THEN** `bun run check` reports a type error naming the missing English key
- **AND** the PR is blocked

#### Scenario: Both-language addition passes the type check
- **WHEN** a contributor adds the same key to both the German and English bundles
- **THEN** `bun run check` passes
- **AND** the new copy renders in the active language

### Requirement: i18n Module Is the Single Source for Component Copy
Reusable components and the app shell SHALL receive translated copy from the i18n module rather than holding inline string literals.

#### Scenario: Components import copy from the i18n module
- **WHEN** a reusable component or shell-level surface renders a translatable string
- **THEN** it reads the string from the i18n module
- **AND** the component file does not contain a hard-coded user-facing string literal

#### Scenario: Page copy may live in page-local dictionaries
- **WHEN** a page renders copy that is not shared with any other surface
- **THEN** the page may define a page-local dictionary
- **AND** the page-local dictionary conforms to the same typed shape and parity rules as the shared dictionary

