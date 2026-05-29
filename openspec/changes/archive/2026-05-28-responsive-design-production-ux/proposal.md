## Why

The current web interface is tailored primarily for desktop views. Large, data-dense tables (like events, partners, and member registers) break layout boundaries on mobile viewports. Additionally, the navigation bars overflow on narrow screens without a responsive mobile menu, and transitions between data states lack professional loading feedback (e.g., skeletons or progress indicators). To ensure a production-grade experience on all devices, the application must be updated to be mobile-first and visually polished during content transitions.

## What Changes

- **Responsive Table Layouts:**
  - Convert wide tables (admin partners, events, guest lists, and billing reports) into responsive flex-based grid structures.
  - On viewports below `768px`, collapse table rows into self-contained "cards" displaying property labels alongside values.
- **Mobile Navigation Drawer:**
  - Introduce a responsive navigation bar header with a collapsible mobile hamburger menu.
  - Animate slide-in sidebar menus for mobile devices using Tailwind/CSS state transitions, keeping the layout clean and accessible.
- **Skeleton & Pulse States:**
  - Implement reusable `<Skeleton>` pulse containers representing textual and card data layers.
  - Replace raw loading indicators or empty views with skeleton blocks during data fetching phases (e.g., in the booking dashboard, search interfaces, and admin views).
- **Smooth Image Placeholders:**
  - Ensure uploaded event and partner header images resolve gracefully using progressive styling and fade-in transitions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ui-system`: Add reusable Skeleton structures and media queries for responsive components.
- `app-shell`: Introduce mobile-specific drawer controls and hamburger layout components.

## Impact

- `src/components/unveiled/app-shell.tsx`: Refactor primary layout/sidebar wrappers to adapt dynamically across mobile/tablet/desktop breakpoints.
- `src/components/unveiled/visual-system-app.tsx`: Apply responsive stack layout patterns to administrative and reporting tables, and inject `<Skeleton />` components into loading conditions.
