## MODIFIED Requirements

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
