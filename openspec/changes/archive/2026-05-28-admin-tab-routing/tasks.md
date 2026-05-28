## 1. Setup and Server Routing

- [x] 1.1 Add tab translation strings to DE and EN translation configurations in `i18n.ts`
- [x] 1.2 Update the Astro page logic in `src/pages/admin.astro` to parse the `tab` query parameter from the URL, validate/normalize it, and pass it as an initial prop to the React `VisualSystemApp` component.

## 2. React Router Component Updates

- [x] 2.1 Update the properties interface of `VisualSystemApp` and `VisualSystemAppContent` in `visual-system-app.tsx` to accept the server-resolved `initialTab` parameter.
- [x] 2.2 Add and initialize the React state `activeTab` inside `AdminPanel`, and create a synchronization handler `updateTab` to update the state and update the URL query parameter using `history.pushState`.
- [x] 2.3 Add a browser listener on the `popstate` event inside `AdminPanel` to sync the tab view state when clicking the back or forward navigation buttons.

## 3. Tab Rendering Restructuring

- [x] 3.1 Implement a tab navigation header component at the top of the admin page inside `AdminPanel` using the brand's styling primitive style.
- [x] 3.2 Move the metrics stats panels and the export bookings panel under the `Metrics` tab view, rendering them conditionally.
- [x] 3.3 Move the events list table, the event creation form, and the event series builder panel under the `Events` tab view, rendering them conditionally.
- [x] 3.4 Move the partner creation form and the partner lists panel under the `Partners` tab view, rendering them conditionally.
- [x] 3.5 Move the member registry, member search field, and credit/billing override panels under the `Members` tab view, rendering them conditionally.

## 4. Verification and Contract Tests

- [x] 4.1 Run standard Astro checks and Biome linter via `bun run check` to verify TypeScript type safety and styling formats.
- [x] 4.2 Run the full contract tests suite `bun run test:parity:contracts` to ensure tab routing and operations integration do not break any existing contracts.
- [x] 4.3 Manually verify deep-linking (e.g. going to `/admin?tab=partners`), state persistence, browser back/forward buttons, and conditional tab unmounting behavior.
