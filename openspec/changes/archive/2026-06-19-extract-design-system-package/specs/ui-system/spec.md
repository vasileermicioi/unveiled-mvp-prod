## MODIFIED Requirements

### Requirement: Production HeroUI Theme Module

The HeroUI theme configuration SHALL be exported from a production module at `packages/design-system/src/lib/heroui-theme.ts` (re-exported through `@unveiled/design-system`) so that both the Ladle-only design replica and the production provider can consume it without crossing the Ladle-only gate.

#### Scenario: Theme is importable from the production module

- **WHEN** any code (replica or production) imports the theme
- **THEN** the import path is `@unveiled/design-system/lib/heroui-theme` (or an explicit re-export)
- **AND** the theme tokens are sourced exclusively from `design-tokens.json` via Style Dictionary, with no hex literals introduced in the production theme module.

### Requirement: Consumer Migration Completes The HeroUI Switchover

Every consumer file in `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, and `src/layouts/` SHALL import the HeroUI-backed primitive from `@unveiled/design-system` and SHALL NOT import a Mantine replica, a Ladle-only replica folder, or any pre-HeroUI shadcn-style helper.

#### Scenario: No consumer imports the old primitive paths

- **WHEN** `rg "@/components/ui/(button|unveiled-primitives|modal|drawer|tabs|menu|toast)" src/` is run after the consumer walk completes
- **THEN** every remaining hit is inside the `@unveiled/design-system` package itself (i.e. the primitives' own source files in `packages/design-system/src/`)
- **AND** no consumer file in the audited directories imports a Ladle-only or Mantine-era helper.

#### Scenario: Prop mismatches are resolved at the call site

- **WHEN** a call site previously used `tone`, `shadow`, `interactive`, or `state` props
- **THEN** the call site maps those props to the new style-prop surface exposed by the HeroUI-backed wrapper
- **AND** the wrapper's public prop surface is preserved (call sites do not need to be rewritten to use HeroUI's native prop names).

### Requirement: UI-System Parity Suite Locks HeroUI Behavior

The gherkin parity suite under `tests/features/ui-system/` SHALL lock the visible, accessible, and keyboard behavior of every HeroUI-backed primitive exported from `@unveiled/design-system`. The Ladle coverage gate SHALL be the contract that proves every `@ladle(…)` tag in the suite resolves to a co-located production primitive story shipped by the package.

#### Scenario: Coverage gate is the parity contract

- **WHEN** `bun --filter @unveiled/design-system run ladle:coverage` runs against the post-migration suite
- **THEN** every scenario tagged with `@ladle(component=…, story=…)` resolves to a Ladle story backed by a HeroUI primitive module under `packages/design-system/src/` (no replica folder).