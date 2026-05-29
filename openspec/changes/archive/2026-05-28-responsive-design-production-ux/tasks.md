## 1. Setup & UI Primitives

- [x] 1.1 Implement a reusable `<Skeleton>` components system in `src/components/unveiled/visual-system-app.tsx` utilizing Tailwind's `animate-pulse` class.
- [x] 1.2 Replace raw text loading indicators in the member list, events grid, and partners list with the `<Skeleton>` containers.

## 2. Mobile Navigation Drawer

- [x] 2.1 Refactor `src/components/unveiled/app-shell.tsx` header to render a collapsible mobile hamburger menu button on viewports below 1024px.
- [x] 2.2 Add sidebar navigation drawer state inside the app shell that slides routes and settings options into view smoothly.

## 3. Responsive Table Grid Layouts

- [x] 3.1 Refactor table container components to support responsive layouts, using flex/grid structures instead of legacy fixed columns.
- [x] 3.2 Add styles to collapse rows into card structures below 768px in the partners directory table, events registry table, and member list.
- [x] 3.3 Ensure partner/event header images resolve smoothly and progressively with fade-in transitions.

## 4. Verification and Regression Tests

- [x] 4.1 Run standard Astro compile checks and Biome formatting via `bun run check`.
- [x] 4.2 Update Playwright visual regression test cases to verify layout scaling at mobile breakpoints.
