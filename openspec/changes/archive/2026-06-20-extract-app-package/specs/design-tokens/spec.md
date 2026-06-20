## MODIFIED Requirements

### Requirement: CSS Custom Properties Are Generated From the Tokens File

A committed `packages/design-system/src/styles/generated/tokens.css` file SHALL be generated from `design-tokens.json` and re-exported via the `@unveiled/design-system` package's `exports` map. Downstream apps (`@unveiled/app`, `@unveiled/landing`) import the CSS through that export instead of importing `src/styles/generated/tokens.css` directly. After this change, the Astro app imports the generated tokens CSS from `@unveiled/design-system/styles/generated/tokens.css` inside `packages/app/src/styles/global.css`; the top-level `src/styles/` tree is no longer present.

#### Scenario: Generation script emits CSS custom properties

- **WHEN** `bun run tokens:gen` runs
- **THEN** it reads `design-tokens.json` and writes `packages/design-system/src/styles/generated/tokens.css`
- **AND** every brand and semantic color appears as a CSS custom property on `:root` using the `--unveiled-*` prefix
- **AND** typography, spacing, radius, border, shadow, motion, breakpoint, and z-index tokens appear as CSS custom properties on `:root` with the same prefix.

#### Scenario: Tailwind v4 @theme inline consumes the same variables

- **WHEN** `packages/app/src/styles/global.css` imports `@unveiled/design-system/styles/generated/tokens.css`
- **THEN** its Tailwind v4 `@theme inline` block references the generated CSS custom properties
- **AND** Tailwind utility classes (e.g. `bg-brand-yellow`, `rounded-md`, `shadow-unveiled`) resolve to the same values.

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
