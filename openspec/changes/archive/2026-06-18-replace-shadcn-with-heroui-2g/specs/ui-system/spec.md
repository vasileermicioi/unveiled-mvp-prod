## ADDED Requirements

### Requirement: Consumer Migration Completes The HeroUI Switchover

Every consumer file in `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, and `src/layouts/` that previously imported a shadcn-backed primitive or a shadcn-specific pattern SHALL now import the HeroUI-backed equivalent and pass the matching prop surface. This is the implementation step that makes the umbrella's capability deltas observable in the running app.

#### Scenario: No consumer imports the old primitive paths

- **WHEN** `rg "@/components/ui/(button|unveiled-primitives)" src/` is run after the consumer walk completes
- **THEN** every remaining hit is inside `src/components/ui/` itself (i.e. the primitives' own source files)
- **AND** no consumer file in the audited directories imports a shadcn-specific helper

#### Scenario: Prop mismatches are resolved at the call site

- **WHEN** a call site previously used `tone`, `shadow`, `interactive`, or `state` props
- **THEN** the call site maps those props to the new style-prop surface exposed by the HeroUI-backed wrapper
- **AND** the wrapper's public prop surface is preserved (call sites do not need to be rewritten to use HeroUI's native prop names)

> The full capability deltas for `app-shell` and `ui-system` are owned by slices 2c, 2d, 2e, 2f, and the umbrella `replace-shadcn-with-heroui`. This slice is the implementation step that makes those deltas observable in the running app.

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
