## Context

Currently, the Unveiled Admin Panel rendering logic mounts and renders the dashboard metrics stat panels, the entire list of events, the event save form, the event series builder, the list of partner venues, the partner edit form, the member registry list, and member detail panels all in a single long scrollable page. This design details how we will restructure this view into modular tabs and synchronize the active selection with the browser URL.

## Goals / Non-Goals

**Goals:**
- Restructure the admin dashboard view into tabbed views: `Metrics`, `Events`, `Partners`, and `Members`.
- Synchronize tab state with the URL query parameters (e.g., `/admin?tab=partners`), allowing direct links to specific pages and preservation of view state on refresh.
- Enforce conditional rendering for non-active tabs to reduce DOM overhead and memory footprint.

**Non-Goals:**
- Splitting the admin panel into physically separate Astro pages.
- Rewriting or modifying database schemas.

## Decisions

### 1. URL Query Parameter Synchronization
We will synchronize the active tab using URL query parameters (e.g., `?tab=partners`).
- **RATIONALE:** By placing active tab state in the URL query string, we gain native deep-linking support, browser back/forward history compatibility, and state persistence across page reloads.
- **ALTERNATIVES CONSIDERED:** Local React `useState` state only. This would reset the active tab back to the default tab on page refresh and make sharing direct links to specific views impossible.

### 2. Server-Side Initial Tab Resolution
We will resolve the initial tab choice on the server side inside the Astro page loader (`src/pages/admin.astro`) and pass it as a prop to `VisualSystemAppContent`.
- **RATIONALE:** Parsing the tab parameter on the server prevents layout flashes and content shifts during client hydration.
- **IMPLEMENTATION DETAIL:** The Astro loader will inspect `Astro.url.searchParams.get("tab")`, normalize it to a valid tab identifier (defaulting to `"metrics"`), and pass it down.

### 3. Conditional Rendering (Unmounting Active Tab Views)
We will conditionally render views based on the active tab (e.g., `{activeTab === 'events' && <AdminEventsTab />}`) rather than hiding inactive panels via CSS (`display: none`).
- **RATIONALE:** Hiding panels via CSS still incurs full React render runs and mounts thousands of DOM nodes. Conditional unmounting keeps the document tree lightweight and improves interaction responsiveness.

## Risks / Trade-offs

- **[Risk]** Client-side form states are lost when switching tabs (due to unmounting).
  - **Mitigation:** Form fields in tabs (like the event creation form) use native browser behaviors and do not need to preserve half-completed draft states across tab switches. Important dashboard metrics or query caches are managed in parent contexts or React Query caches to prevent re-fetching overhead.
- **[Risk]** Mismatched path structures if search parameters are cleared.
  - **Mitigation:** Fallback to `"metrics"` default tab choice when the `tab` parameter is omitted or contains an unrecognized string.
