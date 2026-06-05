## Why

The file `src/components/unveiled/visual-system-app.tsx` is currently over 5,000 lines long and contains all major client UI views, modals, forms, and operations dashboard logic. This makes it difficult to read, maintain, test, and edit safely. Splitting this monolithic file into focused, highly cohesive, and modular React sub-components under `src/components/unveiled/` will improve code structure, developer experience, and testability.

## What Changes

- **MODIFY** `src/components/unveiled/visual-system-app.tsx` to act as a lightweight entrypoint controller and state provider.
- **NEW** Standalone modular components under `src/components/unveiled/` for major page surfaces (e.g. `PublicDiscover.tsx`, `MemberFeed.tsx`, `BookingModal.tsx`, `AdminPanel.tsx`, `PartnerPortal.tsx`, `DiscoveryFilterPanel.tsx`).
- **NEW** Shared React context / hook provider (`src/components/unveiled/context.tsx` or similar) to share query states and refetch actions without prop-drilling.

## Capabilities

### New Capabilities
- `refactor-big-files`: Split `visual-system-app.tsx` into modular standalone sub-components using shared context queries.

### Modified Capabilities

## Impact

- **Affected code**: `src/components/unveiled/visual-system-app.tsx` and all layout/page files invoking it.
- **Component Organization**: New sub-components added to `src/components/unveiled/`.
- **Logic & APIs**: Interactivity, hooks, classnames, and routing values remain completely unchanged to ensure strict regression parity.
