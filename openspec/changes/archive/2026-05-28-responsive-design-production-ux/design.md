## Context

The current Unveiled web client is optimized for desktop viewports. Table elements in the administrative registry collapse poorly on smaller screens, and the main navigation header lacks a mobile menu container, leading to layout breakage on devices under 1024px. Additionally, content transitions and data loads are jarring due to the absence of unified skeleton placeholders.

## Goals / Non-Goals

**Goals:**
- Implement fully responsive, card-based collapsing layouts for all operational tables below 768px.
- Build a slide-in navigation drawer for mobile viewports using pure CSS transitions and React state.
- Create a reusable `<Skeleton>` primitive to render pulsing loading states for cards, lists, and tables.
- Polish image containers to fade in smoothly once resolved.

**Non-Goals:**
- Adding responsive grid customizers or draggable column resizing.
- Replacing the core routing structure or refactoring backend actions.

## Decisions

### 1. Responsive Table Rendering: Row Collapse vs Horizontal Scroll
- **Decision:** Row-Collapse Card Layout. Wide tables will collapse into stackable card components below 768px. Property labels (e.g., name, contact, status) will be displayed inline.
- **Alternatives Considered:** Horizontal scrolling tables. Rejected because horizontal scrolling degrades user scanner efficiency and feels unpolished on touch devices.

### 2. Collapsible Mobile Navigation Drawer
- **Decision:** Slide-in drawer backdrop overlay in `src/components/unveiled/app-shell.tsx` controlled by React state.
- **Alternatives Considered:** Desktop navigation wrapping to a secondary row. Rejected because it wastes precious vertical screen estate on small viewports.

### 3. Loading Feedback Pattern: Skeletons vs Spinners
- **Decision:** `<Skeleton>` components using Tailwind's `animate-pulse` class. Skeletons provide higher visual stability and reduce perceived load times.
- **Alternatives Considered:** Centralized loading spinner overlay. Rejected because overlay spinners block the viewport and disrupt user interaction flow.

## Risks / Trade-offs

- **[Risk]** Large tables with complex actions might become overly long card lists on mobile.
- **[Mitigation]** Use existing backend pagination limit parameters to restrict results, and keep collapsed cards compact.
