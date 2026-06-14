## MODIFIED Requirements

### Requirement: i18n Dictionary Has a Declared Shape

The application's `i18n.ts` dictionary SHALL conform to a typed
shape exported from the i18n-copy spec, and the shape SHALL be the
single source of truth for which keys exist. The `shell.*` bundle
SHALL be declared as a typed `ShellCopy` shape so the type checker
enforces DE/EN parity of every shell-rendered string.

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
