## MODIFIED Requirements

### Requirement: i18n Dictionary Has a Declared Shape
The application's `i18n.ts` dictionary SHALL conform to a typed shape exported from the i18n-copy spec, and the shape SHALL be the single source of truth for which keys exist. The `shell.*` bundle SHALL be declared as a typed `ShellCopy` shape, the per-form auth copy SHALL be declared as a typed `AuthFormCopy` shape, and the Better Auth error-code copy SHALL be declared as a typed `AuthErrorCopy` shape, so the type checker enforces DE/EN parity of every shell-, auth-form-, and auth-error-rendered string.

#### Scenario: Dictionary is fully typed
- **WHEN** a contributor imports the dictionary type
- **THEN** TypeScript reports a key for every translatable string in the application
- **AND** every translation key present in the dictionary type is defined in both the German and English bundles.

#### Scenario: Missing key in one language fails the type check
- **WHEN** a contributor adds a new key to the German bundle but not the English bundle
- **THEN** `bun run check` reports a type error
- **AND** the contributor cannot merge until both languages are updated.

#### Scenario: Stale key in one language fails the type check
- **WHEN** a contributor removes a key from the German bundle but leaves it in the English bundle
- **THEN** `bun run check` reports a type error
- **AND** the contributor cannot merge until both languages are updated.

#### Scenario: Shell bundle is type-enforced
- **WHEN** a contributor adds a new key to the DE `shell.*` bundle or removes one
- **THEN** `bun run check` reports a type error if the EN `shell.*` bundle is not updated to match
- **AND** the typed `ShellCopy` shape is exported from `src/lib/i18n.ts` so the parity rule is enforced statically.

#### Scenario: Auth form copy is type-enforced
- **WHEN** a contributor adds or removes a key in the DE `auth.forms.signup.*`, `auth.forms.login.*`, `auth.forms.logout.*`, or `auth.forms.passwordRecovery.*` bundle
- **THEN** `bun run check` reports a type error if the matching key is not updated in the EN bundle
- **AND** the typed `AuthFormCopy` shape is exported from `src/lib/i18n.ts` so the parity rule is enforced statically.

#### Scenario: Auth error copy is type-enforced
- **WHEN** a contributor adds or removes a Better Auth error code in the DE `auth.errors.*` bundle
- **THEN** `bun run check` reports a type error if the matching code is not updated in the EN bundle
- **AND** the typed `AuthErrorCopy` shape is exported from `src/lib/i18n.ts` so the parity rule is enforced statically
- **AND** the i18n parity unit test asserts that every key in `AuthErrorCopy` is defined in both DE and EN.

### Requirement: Missing-Key Fallback Is Visible and Traceable
The i18n-copy spec SHALL declare the missing-key fallback string and the rule that it must be visible (not silently empty) so a missing key is noticed immediately, and the fallback SHALL apply to unmapped Better Auth error codes surfaced through the auth actions.

#### Scenario: Missing key renders the placeholder
- **WHEN** a component asks for a key that does not exist in the active language
- **THEN** the rendered string is `{i18n.missing:<key>}` (or a stable variant documented in the spec)
- **AND** the placeholder is visible to the contributor running the dev server.

#### Scenario: Missing key never renders the other language's value
- **WHEN** a key is missing in the active language
- **THEN** the rendered string is the missing-key placeholder
- **AND** the runtime MUST NOT silently fall back to the other language's value (silent fallback hides the gap during DE/EN parity work).

#### Scenario: Missing key is logged
- **WHEN** a missing key is rendered
- **THEN** a console warning logs the missing key and the active language
- **AND** in production, the warning is routed to the existing error-logging surface.

#### Scenario: Unmapped Better Auth error renders the missing-key placeholder
- **WHEN** a Better Auth action returns an error code that is not present in the typed `AuthErrorCopy` shape
- **THEN** the rendered string is the `{i18n.missing:auth.errors.<code>}` placeholder
- **AND** the dev-server console warning logs the missing code and the active language.
