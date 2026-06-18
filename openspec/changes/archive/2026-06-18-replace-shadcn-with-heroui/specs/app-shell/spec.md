## MODIFIED Requirements

### Requirement: Target-Native Shell Composition

The app shell SHALL recreate the visible legacy frame using migrated target UI-system primitives and target-native layout components. The shell SHALL mount `HeroUIProvider` at the client root and source its global theme configuration from the production HeroUI theme module (no longer from the Ladle-only replica).

#### Scenario: Primary shell frame renders

- **WHEN** a primary page renders inside the shell
- **THEN** the viewport uses the brand-yellow page background with brand-dark text
- **AND** a sticky white navigation/header appears above the page content with a dark bottom border
- **AND** the main content is centered in a wide responsive container with mobile and desktop padding matching the legacy shell intent

#### Scenario: Shell uses migrated UI foundation

- **WHEN** shell components render buttons, badges, panels, state wrappers, or icon controls
- **THEN** they use the already migrated UI-system tokens and primitives
- **AND** they do not introduce a parallel shell-specific visual system

#### Scenario: Shell mounts HeroUI provider at the client root

- **WHEN** any client island inside the shell hydrates
- **THEN** `HeroUIProvider` from the production provider module is mounted above the island tree
- **AND** the global theme configuration is sourced from the production HeroUI theme module (e.g. `src/lib/heroui-theme.ts`), not from `src/components/ui/heroui-replica/theme.ts`

#### Scenario: SSR does not crash on Cloudflare Workers

- **WHEN** the shell renders during SSR on the Cloudflare Workers adapter
- **THEN** no HeroUI client-only API executes during server rendering
- **AND** every island that wraps a HeroUI client-only surface is mounted with `client:only="react"` (or an equivalent dynamic import gated by `useEffect`)

#### Scenario: Legacy app remains reference-only

- **WHEN** the shell is implemented
- **THEN** no runtime code, state management, routing internals, or framework-specific implementation is imported from `_old_app/`
- **AND** `_old_app/` remains unmodified
