## ADDED Requirements

_None._

## MODIFIED Requirements

### Requirement: Modal And Dialog Components

Modal UI SHALL visually take over the screen for booking and redemption states and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Modal primitives are HeroUI-backed

- **WHEN** a `Modal` or `Drawer` primitive is rendered
- **THEN** the underlying element composes HeroUI's `Modal` / `Drawer`
- **AND** the focus trap, `aria-modal`, and close-on-escape behavior match the approved Ladle story
- **AND** the public `open`, `onClose`, `title`, and `children` props are preserved

> The full delta for the `ui-system` capability (including the unchanged scenarios from the umbrella proposal) is owned by the umbrella `replace-shadcn-with-heroui`. Slice 2f ships the precondition those scenarios depend on; the umbrella's `apply` step archives both the slice and the umbrella delta together.

## REMOVED Requirements

_None._
