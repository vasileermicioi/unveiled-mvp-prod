# design-tokens Specification

## Purpose

Define the single source of truth for Unveiled design tokens (`design-tokens.json`), the generated CSS custom properties consumed through `@unveiled/design-system`, and the drift checks that keep generated artifacts in sync.

## Requirements

### Requirement: Design Tokens Are Authored Once in W3C DTCG Format
The design system SHALL be defined in a single `design-tokens.json` file at the repo root using the W3C Design Tokens Community Group format (`$value` / `$type` / `$description`).

#### Scenario: Tokens file lives at the repo root
- **WHEN** a contributor searches for the design tokens source
- **THEN** `design-tokens.json` is present at the repo root
- **AND** it is a valid W3C DTCG document that any non-TypeScript consumer (gherkin generator, LikeC4 model, future SDKs) can parse without a JS runtime

#### Scenario: Token groups cover color, typography, spacing, radius, border, shadow, motion, breakpoint, and z-index
- **WHEN** the tokens file is read
- **THEN** it contains groups for color (brand + semantic + status), typography (families, weights, sizes, letter spacing, line heights, text cases), spacing (1 through 16, rem-based, 4 px grid), radius (none, sm, md, lg, full), border (unveiled, input, card), shadow (unveiled-sm, unveiled, unveiled-lg, unveiled-hover), motion (durations, easings, transitions), breakpoint (sm, md, lg, xl, 2xl), and z-index (base, dropdown, sticky, modal, toast)

#### Scenario: No second source of truth exists for the same tokens
- **WHEN** a contributor searches the repo for a brand-yellow hex value
- **THEN** the only committed occurrence is inside `design-tokens.json`
- **AND** the same value does not appear in `src/styles/global.css`, `src/components/ui/unveiled-primitives.tsx`, or `docs/guidelines.md`
### Requirement: CSS Custom Properties Are Generated From the Tokens File

A committed `packages/design-system/src/styles/generated/tokens.css` file SHALL be generated from `design-tokens.json` and re-exported via the `@unveiled/design-system` package's `exports` map. Downstream apps (`@unveiled/app`, `@unveiled/landing`) import tokens through `@unveiled/design-system/styles/global.css`, which in turn imports `./generated/tokens.css` and `./tailwind-theme.css`; they MUST NOT import `src/styles/generated/tokens.css` directly or declare local `@theme` blocks.

#### Scenario: Generation script emits CSS custom properties

- **WHEN** `bun run tokens:gen` runs
- **THEN** it reads `design-tokens.json` and writes `packages/design-system/src/styles/generated/tokens.css`
- **AND** every brand and semantic color appears as a CSS custom property on `:root` using the `--unveiled-*` prefix
- **AND** typography, spacing, radius, border, shadow, motion, breakpoint, and z-index tokens appear as CSS custom properties on `:root` with the same prefix.

#### Scenario: Tailwind v4 @theme consumes the same variables from the design system

- **WHEN** `packages/design-system/src/styles/tailwind-theme.css` is read
- **THEN** its `@theme` block references the generated CSS custom properties from `./generated/tokens.css`
- **AND** Tailwind utility classes (e.g. `bg-brand-yellow`, `rounded-md`, `shadow-unveiled`) resolve to the same values when consumed through `@unveiled/design-system/styles/global.css`.

#### Scenario: Generated CSS is committed

- **WHEN** a contributor clones the repo
- **THEN** `packages/design-system/src/styles/generated/tokens.css` is present without needing to run the generator
- **AND** the file is excluded from Biome formatting in the package's `biome.json`.
### Requirement: Typed TypeScript Enums Expose the Tokens

A `packages/design-system/src/lib/design-tokens.ts` module SHALL re-export the token groups as `as const` objects and derived types so variant code references tokens by enum member, not magic string.

#### Scenario: Enum module exports typed groups

- **WHEN** a contributor imports from `@unveiled/design-system/lib/design-tokens` (or the package's main export)
- **THEN** they receive typed exports for `BrandColor`, `SemanticColor`, `StatusColor`, `FontFamily`, `FontSize`, `Spacing`, `Radius`, `Border`, `Shadow`, `MotionDuration`, `MotionEasing`, `Breakpoint`, and `ZIndex`
- **AND** each export is a `const` object whose `as const` values derive a string-literal union type.

#### Scenario: Renaming a token breaks variant code

- **WHEN** a token name in `design-tokens.json` is renamed
- **THEN** every variant in `@unveiled/design-system/src/components/ui/unveiled-primitives.tsx` (or its package-internal equivalent) that referenced the old name via the enum fails TypeScript compilation
- **AND** the contributor is forced to update the variant to use the new enum member.

#### Scenario: Variant code uses enums, not magic strings

- **WHEN** a new button, badge, or panel variant is added to the design-system primitives
- **THEN** its color, radius, shadow, and spacing values reference a typed enum member from `@unveiled/design-system`
- **AND** the variant file does not contain a literal hex value, raw CSS color name, or unreferenced magic string for a design-token-controlled property.
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

### Requirement: Guidelines Documentation Points at the Tokens File
The `docs/guidelines.md` narrative SHALL describe the design system by referencing `design-tokens.json` and the generated CSS, not by transcribing hex values or pixel measurements.

#### Scenario: Guidelines defer to the JSON
- **WHEN** `docs/guidelines.md` describes a brand color, type size, spacing unit, radius, border width, shadow, motion duration, or breakpoint
- **THEN** it references the token name in `design-tokens.json` and the generated CSS variable
- **AND** it does not transcribe a literal hex value or pixel size that could drift from the source

#### Scenario: Guidelines link to the generator
- **WHEN** a contributor reads `docs/guidelines.md`
- **THEN** it links to `src/styles/generated/tokens.css` and explains that editing design values starts with `design-tokens.json` and the `bun run tokens:gen` / `bun run tokens:check` scripts
