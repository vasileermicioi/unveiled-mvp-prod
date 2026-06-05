## ADDED Requirements

### Requirement: Component Modularization
The UI codebase SHALL be split into standalone, importable components situated under `src/components/unveiled/` corresponding to their view states and responsibilities, ensuring strict compliance with styling guidelines.

#### Scenario: VisualSystemApp acts as a modular entrypoint
- **WHEN** the main `VisualSystemApp` component is rendered
- **THEN** it resolves view states by importing modular sub-components rather than declaring them inline
- **AND** it acts as a lightweight router/shell controller passing queries and global context downwards

#### Scenario: Sub-components maintain visual and logical parity
- **WHEN** sub-components (such as `PublicDiscover`, `MemberFeed`, `BookingModal`, `AdminPanel`, `PartnerPortal`, and `DiscoveryFilterPanel`) are moved to their own files
- **THEN** they import all necessary UI primitives, icons, and hooks
- **AND** they preserve existing styling, classnames, responsive layouts, and interactive behaviors in compliance with the styling guidelines
- **AND** they compile cleanly without typescript or linter warnings

### Requirement: Shared State and Invalidation Context
Modularized components SHALL consume shared query states and mutation actions from consolidated context providers or custom hooks to avoid prop drilling.

#### Scenario: Query states resolve correctly
- **WHEN** hooks like `useLiveData()` or `useCopy()` are called within modularized sub-components
- **THEN** they successfully query the nearest context provider
- **AND** trigger UI re-renders on query invalidation or language toggle updates
