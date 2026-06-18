## ADDED Requirements

### Requirement: Production HeroUI Theme Module

The HeroUI theme configuration SHALL be exported from a production module at `src/lib/heroui-theme.ts` so that both the Ladle replica and the production provider can consume it without crossing the Ladle-only gate.

#### Scenario: Theme is importable from the production module

- **WHEN** any code (replica or production) imports the theme
- **THEN** the import path is `@/lib/heroui-theme` (or an explicit re-export)
- **AND** the export shape is unchanged from the previous replica-owned `src/components/ui/heroui-replica/theme.ts`

> The full capability deltas for `app-shell` and `ui-system` are owned by slices 2c, 2d, 2e, 2f, and the umbrella `replace-shadcn-with-heroui`. This slice ships the theme relocation those later slices require.

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
