## ADDED Requirements

_None._

## MODIFIED Requirements

### Requirement: Target-Native Shell Composition

The app shell SHALL recreate the visible legacy frame using migrated target UI-system primitives and target-native layout components. The shell SHALL mount `HeroUIProvider` at the client root and source its global theme configuration from the production HeroUI theme module (no longer from the Ladle-only replica).

#### Scenario: Shell mounts HeroUI provider at the client root

- **WHEN** any client island inside the shell hydrates
- **THEN** `HeroUIProvider` from the production provider module is mounted above the island tree
- **AND** the global theme configuration is sourced from the production HeroUI theme module `src/lib/heroui-theme.ts`, not from `src/components/ui/heroui-replica/theme.ts`

#### Scenario: SSR does not crash on Cloudflare Workers

- **WHEN** the shell renders during SSR on the Cloudflare Workers adapter
- **THEN** no HeroUI client-only API executes during server rendering
- **AND** every island that wraps a HeroUI client-only surface is mounted with `client:only="react"` (or an equivalent dynamic import gated by `useEffect`)

> The full delta for the `app-shell` capability (including the unchanged scenarios from the umbrella proposal) is owned by the umbrella `replace-shadcn-with-heroui`. Slice 2c ships the precondition those scenarios depend on; the umbrella's `apply` step archives both the slice and the umbrella delta together.

## REMOVED Requirements

_None._
