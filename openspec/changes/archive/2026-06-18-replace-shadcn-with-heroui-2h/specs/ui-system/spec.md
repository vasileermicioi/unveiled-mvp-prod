## ADDED Requirements

### Requirement: Shadcn Scaffolding Is Removed

The shadcn-specific scaffolding (`@radix-ui/react-slot`, `class-variance-authority`, possibly `clsx` and `tailwind-merge`) SHALL be removed from `package.json` once the consumer audit confirms no remaining production-code importer. `components.json` SHALL no longer advertise shadcn as the component source.

#### Scenario: shadcn packages are removed from the dependency tree

- **WHEN** the audit (`rg "<package>" src/`) confirms no production consumer imports the package
- **THEN** the package is removed from `package.json`
- **AND** `bun install` regenerates `bun.lock` without the package
- **AND** `bun run check` is non-breaking after the removal

#### Scenario: components.json no longer points at shadcn

- **WHEN** `components.json` exists after the teardown
- **THEN** it does not reference shadcn as the component source
- **OR** the file is removed entirely

> The full capability deltas for `app-shell` and `ui-system` are owned by earlier slices and the umbrella `replace-shadcn-with-heroui`. This slice is the dependency + config cleanup that completes the switchover.

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
