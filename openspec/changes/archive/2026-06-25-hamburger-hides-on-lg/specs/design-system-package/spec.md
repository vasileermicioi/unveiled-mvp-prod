# design-system-package Specification (delta)

## MODIFIED Requirements

### Requirement: App package consumes the design system, not its internals

Every file under `packages/app/src/**` (Astro pages, Astro layouts, React islands, server-side data hooks, action handlers, view-model mappers) MUST import UI surfaces — atoms, molecules, organisms, layouts, semantic CSS classes, and the `cn` helper — exclusively from `@unveiled/design-system` (the public barrel). The app MUST NOT import from `@unveiled/design-system/lib/*` (the internal path), `@unveiled/design-system/<layer>/<file>` (the per-folder deep imports that skip the barrel), `@nextui-org/react`, `@heroui/*`, `lucide-react`, `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`, `@chakra-ui/*`, or any other third-party UI library. App-internal paths (`@/lib/auth-client`, `@/lib/stripe`, `@/lib/data-access/*`, `@/lib/unveiled-view-models`, `@/lib/app-shell-view-models`) are still allowed because they are not UI surfaces.

The rule is enforced by `bun run check:styling-ownership` (existing) plus a new permanent unit test under `tests/unit/` that greps every `.tsx` / `.astro` / `.ts` file in `packages/app/src/**` and fails if it imports from any forbidden path or module.

The `ShellIconButton` organism (`packages/design-system/src/organisms/shell/shell-icon-button/shell-icon-button.tsx`) MUST ship the Tailwind `lg:hidden` utility in its `cn(...)` class list so the hamburger toggle is hidden at viewports ≥ 1024 px. Consumers MUST NOT override that utility — the gate `bun run check:styling-ownership` rejects any consumer that re-introduces an explicit `lg:block` / `lg:flex` on the toggle, and the design-system primitive is the single source of truth for the visibility rule.

#### Scenario: ShellIconButton adds the `lg:hidden` utility

- **WHEN** `ShellIconButtonPresentational` renders inside a ShellNavigation
- **THEN** the rendered `<button>` element carries the Tailwind
  `lg:hidden` utility in its `class` attribute
- **AND** no consumer in `packages/app/src/**` or
  `packages/landing/src/**` may override that utility (the gate
  `bun run check:styling-ownership` is the enforcer)
