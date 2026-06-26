## MODIFIED Requirements

### Requirement: Translation Coverage Is Enforced

Every key referenced from production code via `copyFor(...)` MUST have
a value in both the `DE` and `EN` dictionaries, and the
`bun run check:i18n-coverage` script MUST fail the build otherwise.
The script MUST list the missing key and the file that referenced it
in its error output, and the unit test
`tests/unit/i18n-coverage.test.ts` MUST assert the three behaviours
below.

#### Scenario: Missing DE key fails the build

- **WHEN** `bun run check:i18n-coverage` runs and a production file
  under `packages/app/src/**` or `packages/landing/src/**` references
  `copyFor(language).shell.nav.openMenu` but the `DE` dictionary is
  missing `shell.nav.openMenu`
- **THEN** the script exits non-zero
- **AND** the error message lists the missing key
  `shell.nav.openMenu` and the file that referenced it.

#### Scenario: Missing EN key fails the build

- **WHEN** `bun run check:i18n-coverage` runs and a production file
  references `copyFor(language).shell.nav.openMenu` but the `EN`
  dictionary is missing `shell.nav.openMenu`
- **THEN** the script exits non-zero
- **AND** the error message lists the missing key
  `shell.nav.openMenu` and the file that referenced it.

#### Scenario: All keys present passes the build

- **WHEN** `bun run check:i18n-coverage` runs and every referenced
  key is present in both the `DE` and `EN` dictionaries
- **THEN** the script exits zero
- **AND** `bun run check` continues to its remaining sub-steps.

#### Scenario: Gate is wired into the umbrella check command

- **WHEN** a contributor runs `bun run check` from the repo root
- **THEN** `bun run check:i18n-coverage` is invoked before the
  Biome/astro/specs/tokens/ladle/wrangler sub-steps
- **AND** a failure in the gate aborts the umbrella command with the
  gate's own non-zero exit code.
