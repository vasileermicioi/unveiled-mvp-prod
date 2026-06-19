## MODIFIED Requirements

### Requirement: CSS Custom Properties Are Generated From the Tokens File

A committed `packages/design-system/src/styles/generated/tokens.css` file SHALL be generated from `design-tokens.json` and re-exported via the `@unveiled/design-system` package's `exports` map. Downstream apps (`@unveiled/app`, `@unveiled/landing`) import the CSS through that export instead of importing `src/styles/generated/tokens.css` directly.

#### Scenario: Generation script emits CSS custom properties

- **WHEN** `bun run tokens:gen` runs
- **THEN** it reads `design-tokens.json` and writes `packages/design-system/src/styles/generated/tokens.css`
- **AND** every brand and semantic color appears as a CSS custom property on `:root` using the `--unveiled-*` prefix
- **AND** typography, spacing, radius, border, shadow, motion, breakpoint, and z-index tokens appear as CSS custom properties on `:root` with the same prefix.

#### Scenario: Tailwind v4 @theme inline consumes the same variables

- **WHEN** `packages/app/src/styles/global.css` (or `packages/landing/src/styles/global.css` in change 05) imports `@unveiled/design-system/styles/generated/tokens.css`
- **THEN** its Tailwind v4 `@theme inline` block references the generated CSS custom properties
- **AND** Tailwind utility classes (e.g. `bg-brand-yellow`, `rounded-md`, `shadow-unveiled`) resolve to the same values.

#### Scenario: Generated CSS is committed

- **WHEN** a contributor clones the repo
- **THEN** `packages/design-system/src/styles/generated/tokens.css` is present without needing to run the generator
- **AND** the file is excluded from Biome formatting in the package's `biome.json`.

### Requirement: Drift Check Fails the Build on Token Mismatch

A `bun run tokens:check` script SHALL fail with a non-zero exit code when the generated `packages/design-system/src/styles/generated/tokens.css` is out of sync with `design-tokens.json`.

#### Scenario: Drift check is part of bun run check

- **WHEN** a contributor runs `bun run check`
- **THEN** `bun run tokens:check` runs as one of its steps
- **AND** if the generated CSS disagrees with the JSON, `bun run check` exits non-zero with a message naming the drifted file (`packages/design-system/src/styles/generated/tokens.css`).

#### Scenario: Editing the JSON without regenerating is caught

- **WHEN** a contributor edits `design-tokens.json` but does not run `bun run tokens:gen`
- **THEN** `bun run tokens:check` fails and reports which token changed
- **AND** CI rejects the commit.

#### Scenario: Regenerating after a JSON edit makes the check pass

- **WHEN** a contributor runs `bun run tokens:gen` after editing the JSON
- **THEN** `packages/design-system/src/styles/generated/tokens.css` is updated
- **AND** `bun run tokens:check` exits zero.