## ADDED Requirements

_None._

## MODIFIED Requirements

### Requirement: HeroUI Is A Production Dependency

The `@nextui-org/react` package SHALL be listed under `dependencies` in `package.json` so that production code paths can resolve HeroUI components without relying on a devDependency. This is the precondition every later slice in the umbrella `replace-shadcn-with-heroui` depends on.

#### Scenario: HeroUI is resolvable from production code

- **WHEN** production code imports from `@nextui-org/react`
- **THEN** the import resolves successfully under the production dependency graph
- **AND** `bun install` reports the package under `dependencies`, not `devDependencies`

> The full capability deltas for `app-shell` and `ui-system` are owned by slices 2c, 2d, 2e, 2f, and the umbrella `replace-shadcn-with-heroui`. This slice ships the dependency precondition those later slices require.

## REMOVED Requirements

_None._
