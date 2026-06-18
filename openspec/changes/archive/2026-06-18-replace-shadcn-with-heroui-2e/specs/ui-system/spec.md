## ADDED Requirements

_None._

## MODIFIED Requirements

### Requirement: Forms

Forms SHALL preserve visible field structure, validation message placement, and responsive grouping. Payment integration and builder forms MUST mount interactive components without static mock text placeholders. Form fields SHALL be HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Form primitives are HeroUI-backed

- **WHEN** any of `Field`, `TextInput`, `SelectInput`, or `TextArea` from `src/components/ui/unveiled-primitives.tsx` is rendered
- **THEN** the input/select/textarea element composes the corresponding HeroUI component
- **AND** it accepts the existing `label`, `hint`, `error`, `value`, `onChange`, and `disabled` props
- **AND** the rendered DOM and className match the approved Ladle story for the same props
- **AND** `data-testid` and the proximity + layout selector contract used by the gherkin suite are preserved

### Requirement: Empty, Loading, And Error States

Empty, loading, and error states SHALL be explicit and visually intentional and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: State primitives are HeroUI-backed

- **WHEN** `Panel`, `Card`, `Badge`, `StatPanel`, `Divider`, or `StatePanel` is rendered
- **THEN** the element composes the corresponding HeroUI component (or a thin HeroUI-styled wrapper where HeroUI has no direct equivalent)
- **AND** the public `variant`, `tone`, `shadow`, `interactive`, and `state` props are preserved and translate to HeroUI style props internally
- **AND** the rendered DOM and className match the approved Ladle story for the same props

> The full delta for the `ui-system` capability (including the unchanged scenarios from the umbrella proposal) is owned by the umbrella `replace-shadcn-with-heroui`. Slice 2e ships the precondition those scenarios depend on; the umbrella's `apply` step archives both the slice and the umbrella delta together.

## REMOVED Requirements

_None._
