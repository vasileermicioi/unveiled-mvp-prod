## Context

The file `src/components/unveiled/visual-system-app.tsx` has grown to a monolithic size (approx. 200KB, >5,000 lines). It currently manages guest discovering layouts, member discovery/bookings dashboards, admin control pages, partner portals, and booking/waitlist modals. To improve codebase health, we need to decompose this file into dedicated, standalone React sub-components under `src/components/unveiled/` while preserving identical visual look and logical behavior.

## Goals / Non-Goals

**Goals:**
- Separate major page-level view modules into individual React files: `PublicDiscover.tsx`, `MemberFeed.tsx`, `BookingModal.tsx`, `AdminPanel.tsx`, `PartnerPortal.tsx`, and `DiscoveryFilterPanel.tsx`.
- Create a unified React context provider (`src/components/unveiled/context.tsx`) defining shared data queries, refetch controls, language translations, active routing state, and common mutation handlers.
- Expose hooks like `useLiveData()` and `useCopy()` to modular sub-components to prevent deep prop drilling.
- Ensure all sub-components compile cleanly with TypeScript and pass Biome check rules.
- Retain complete visual, structural, and behavioral parity with zero style drift.

**Non-Goals:**
- Creating new API endpoints or changing existing Astro actions.
- Modifying general page routing pathways or global database schema tables.
- Introducing new styles or visual layout adjustments.

## Decisions

### Decision 1: Context Provider Strategy
- **Choice**: Implement a single `VisualSystemProvider` in `src/components/unveiled/context.tsx`.
- **Rationale**: Consolidated state, data queries (TanStack Query), and translation contexts are best maintained in a central wrapper, allowing child components to remain simple and hook-driven.

### Decision 2: File Structure for Standalone Sub-components
- **Choice**: Place all new React files under `src/components/unveiled/` next to the main entrypoint:
  * `src/components/unveiled/PublicDiscover.tsx`
  * `src/components/unveiled/MemberFeed.tsx`
  * `src/components/unveiled/BookingModal.tsx`
  * `src/components/unveiled/AdminPanel.tsx`
  * `src/components/unveiled/PartnerPortal.tsx`
  * `src/components/unveiled/DiscoveryFilterPanel.tsx`
  * `src/components/unveiled/context.tsx`
- **Rationale**: Keeps all code relating to the client UI system unified in the same directory, simplifying imports.

### Decision 3: Code Extraction Process
- **Choice**: Direct copy-paste extraction of markup and event handler code from `visual-system-app.tsx` into corresponding files.
- **Rationale**: Minimizes risk of logic/styling regression by preserving precise CSS classes, structural tags, and reactive event bindings.

## Risks / Trade-offs

### [Risk] Circular dependency or missing exports → Mitigation
Moving code around in complex components can easily break TypeScript imports or cause circular dependencies.
- **Mitigation**: Create the context file `context.tsx` first, define core interfaces/hooks, import it in subcomponents, and build them incrementally. Run `bun run check` after extracting each component to catch compile issues immediately.
