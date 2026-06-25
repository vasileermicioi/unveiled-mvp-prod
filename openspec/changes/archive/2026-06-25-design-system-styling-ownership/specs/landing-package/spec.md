## ADDED Requirements

### Requirement: `@unveiled/landing` imports global CSS once

The landing package MUST ship exactly one stylesheet file at `packages/landing/src/styles/global.css`. That file MUST contain only `@import "@unveiled/design-system/styles/global.css";` and MUST NOT declare `@theme`, `@layer`, bespoke class rules, or Tailwind directives. The single global `@media (prefers-reduced-motion: reduce)` block that governs landing motion MUST live in `packages/design-system/src/styles/global.css`, not in the landing package.

#### Scenario: Landing global CSS is a single import

- **WHEN** `packages/landing/src/styles/global.css` is read
- **THEN** it contains exactly one line: `@import "@unveiled/design-system/styles/global.css";`
- **AND** `packages/landing/src/styles/` contains no other CSS files.

#### Scenario: Landing source uses semantic classes only

- **WHEN** `bun run check:styling-ownership` runs against `packages/landing/src/**`
- **THEN** no `.tsx`, `.astro`, or `.html` file contains forbidden raw Tailwind utilities in `className` strings
- **AND** layout and chrome use semantic classes exported from `@unveiled/design-system/styles/global.css`.

## MODIFIED Requirements

### Requirement: `@unveiled/landing` has its own global stylesheet

The package MUST ship `packages/landing/src/styles/global.css` which imports `@unveiled/design-system/styles/global.css`. The design-system global CSS MUST include the single global `@media (prefers-reduced-motion: reduce)` block that governs the landing surface. The landing package MUST NOT duplicate that block locally.

#### Scenario: Stylesheet imports design-system global CSS

- **WHEN** `packages/landing/src/styles/global.css` is read
- **THEN** it contains only `@import "@unveiled/design-system/styles/global.css";`
- **AND** the imported file applies Tailwind v4 layers and semantic classes for the landing surface.

#### Scenario: Motion guard is a single global block in the design system

- **WHEN** the design-system global CSS is audited
- **THEN** every landing motion surface is covered by a single `@media (prefers-reduced-motion: reduce)` block in `packages/design-system/src/styles/global.css`
- **AND** no per-island `useReducedMotion()` hook is introduced
- **AND** `packages/landing/src/styles/global.css` does not declare its own motion-guard block.
