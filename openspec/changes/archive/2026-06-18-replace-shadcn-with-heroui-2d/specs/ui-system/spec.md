## ADDED Requirements

_None._

## MODIFIED Requirements

### Requirement: Buttons And Controls

Buttons, segmented controls, toggles, and icon controls SHALL match legacy visible states and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Button is a HeroUI-backed wrapper

- **WHEN** `src/components/ui/button.tsx` is rendered
- **THEN** it composes HeroUI's `Button` as the base element
- **AND** it accepts the existing `variant` matrix (`default`, `primary`, `secondary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, `link`)
- **AND** it accepts the existing `size` matrix (`default`, `sm`, `lg`, `icon`, `icon-sm`)
- **AND** it accepts the `loading` and `asChild` props
- **AND** the rendered DOM and className match the approved Ladle story for the same props

> The full delta for the `ui-system` capability (including the unchanged scenarios from the umbrella proposal) is owned by the umbrella `replace-shadcn-with-heroui`. Slice 2d ships the precondition those scenarios depend on; the umbrella's `apply` step archives both the slice and the umbrella delta together.

## REMOVED Requirements

_None._
