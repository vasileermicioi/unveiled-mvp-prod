## 1. Data Access And View Models

- [x] 1.1 Audit existing admin and partner loaders, repositories, query keys, and actions against the new operations, pages, display-data, forms-actions, and data-access specs.
- [x] 1.2 Implement or complete the partner operations read model for partner details, QR token display state, event options, guest rows, check-in state, aggregate counts, and export availability.
- [x] 1.3 Implement or complete admin dashboard read data for counts, recent bookings, export partner options, and export state.
- [x] 1.4 Implement or complete admin event read data for event rows, partner options, form option lists, export rows, and public-discovery invalidation targets.
- [x] 1.5 Implement or complete admin partner read data for partner rows, portal linkage, QR token state, venue QR URLs, form values, and dependent invalidation targets.
- [x] 1.6 Implement or complete admin member read data for member rows, provider fields where available, freeze state, credits, booking/event-open/saved/waitlist counts, preferences, history summaries, ledger rows, and eligibility-affecting fields.
- [x] 1.7 Define precise operational query keys and invalidation helpers for partner portal, partner guest/export rows, admin dashboard, admin events, admin partners, admin members, member profile, member ledger, booking eligibility, wallet, and public/member discovery.

## 2. Server Actions And Export Boundaries

- [x] 2.1 Verify event create/update/delete and series-create actions use existing schemas, authorization, result envelope, and invalidation hints for admin, discovery, partner option, and export queries.
- [x] 2.2 Verify partner create/update/delete, QR token rotation, and portal provisioning actions use existing schemas, authorization, result envelope, and invalidation hints for admin, partner portal, public partner, event option, dashboard, and export queries.
- [x] 2.3 Verify member freeze/unfreeze and credit adjustment actions use existing authorization, audit/ledger behavior, result envelope, and invalidation hints for admin member, profile, ledger, eligibility, wallet, and dashboard queries.
- [x] 2.4 Verify partner manual check-in actions enforce ownership and check-in-window rules, return safe failures, and invalidate partner portal, guest-list, export, and booking queries.
- [x] 2.5 Implement authorized partner and admin export row access through server action or route boundaries before client CSV download behavior runs.

## 3. Partner Portal UI Wiring

- [x] 3.1 Wire `/partner` route-owned initial data into the partner portal island with serializable data matching the partner query fetcher shape.
- [x] 3.2 Replace static partner portal details, QR state, event options, guest counts, and guest rows with live partner-scoped display data.
- [x] 3.3 Connect guest search and event filtering to live rows without broadening partner ownership scope.
- [x] 3.4 Connect guest check-in row actions to the authorized check-in action, render row/form failures, clear stale success state, and refresh affected rows after success.
- [x] 3.5 Connect partner guest/code export controls to authorized export rows and render safe export failures.

## 4. Admin Operations UI Wiring

- [x] 4.1 Wire `/admin` route-owned initial data into admin dashboard, event, partner, and member islands using tab-level query keys where practical.
- [x] 4.2 Replace static dashboard counts, recent bookings, export partner options, and export controls with live admin data.
- [x] 4.3 Connect event form, event row edit/delete/export actions, and series builder submission to existing event operations with visible validation and safe failure states.
- [x] 4.4 Connect partner form, QR token rotation, portal access creation, and partner deletion controls to existing partner operations with visible validation and safe failure states.
- [x] 4.5 Connect member refresh, expand, freeze/unfreeze, and credit adjustment controls to existing member operations with visible validation and safe failure states.
- [x] 4.6 Ensure each successful admin operation invalidates or refetches the affected operational, public, member, partner, and export rows before presenting dependent data as current.

## 5. Verification

- [x] 5.1 Add or update focused tests for partner-scoped reads, partner check-in ownership, and partner export scoping.
- [x] 5.2 Add or update focused tests for admin event, partner, member, token, provisioning, and export authorization paths.
- [x] 5.3 Add or update UI/action tests for visible success/error handling and stale success-state clearing on admin and partner operation forms.
- [x] 5.4 Run the project typecheck/build checks and targeted tests for affected data-access, action, and operational UI modules.
- [x] 5.5 Manually smoke `/partner` and `/admin` with seeded admin, partner, and member data to confirm rows render, mutations refresh, protected failures are safe, and exports are scoped.
