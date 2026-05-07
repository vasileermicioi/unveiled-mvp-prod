## Context

The current app has operational server code for admin and partner workflows, including `src/lib/admin-operations.ts`, action handlers in `src/actions/index.ts`, and repository/query support in `src/lib/data-access/repositories.ts`. The visible `/admin` and `/partner` UI still needs to consume those live reads and mutations with the same operational coverage that existed in the legacy AdminPanel and PartnerPortal.

The main constraints are preserving authorization and ownership checks in server code, preserving the existing action result envelope, and avoiding a redesign of the operational UI. The implementation should make the current surfaces functional with live data, row refreshes, safe errors, and export behavior.

## Goals / Non-Goals

**Goals:**

- Load partner portal data from the authenticated partner context and expose guest, event, QR token, check-in, and export controls.
- Load admin dashboard, event, partner, and member data from authorized admin loaders and repositories.
- Submit admin and partner operations through existing typed actions, then invalidate or refetch affected query surfaces.
- Render validation, authorization, conflict, and business-rule failures in the existing form or row action locations.
- Keep protected data access server-scoped and enforce partner ownership/admin role before returning rows.

**Non-Goals:**

- Introduce a new admin or partner visual design.
- Add analytics beyond legacy-visible counts, member history summaries, and export columns.
- Change check-in window rules or the action result envelope.
- Add first-class asset storage for event or partner image uploads; image URL fields remain sufficient unless existing upload support is already complete.

## Decisions

1. Use route-owned initial data with hydrated islands for interaction.

   `/admin` and `/partner` should authorize on the server, load the initial view models, and pass serializable data into interactive React islands. The islands should use the same query keys and fetcher shapes as client refetches. This keeps protected reads server-owned while still allowing row refresh after actions.

   Alternative considered: client-only operational fetching. That would make first render weaker, increase loading churn, and make protected-route behavior easier to get wrong.

2. Split admin data by operational tab where practical.

   The admin route may load dashboard shell data initially, but event, partner, and member tabs should have separate query keys/fetchers so one mutation does not require refetching every heavy admin dataset. Member details/history should load or expand separately when the row is opened if the existing component structure allows it.

   Alternative considered: one monolithic admin payload. It is simpler, but it increases payload size and makes invalidation less precise.

3. Keep server actions as the mutation boundary.

   Event, series, partner, token rotation, portal provisioning, member freeze/unfreeze, credit adjustment, and manual check-in should call the existing action/operation layer rather than embedding mutation logic in components. Actions return the existing result envelope with safe errors, success data, and invalidation hints.

   Alternative considered: page-local API route mutations. That duplicates behavior and risks diverging from the established operation contracts.

4. Use scoped export data returned from authorized server reads unless streaming becomes necessary.

   Partner exports should return only rows owned by the partner. Admin exports should use admin-authorized query paths and the current export columns. Client-side CSV generation is acceptable for the expected operational data size; API route streaming can be added later if row counts prove too large.

   Alternative considered: streaming exports in this pass. It adds route complexity before there is evidence the current export size requires it.

5. Treat QR token state as partner display data plus explicit admin mutation.

   Partner rows and partner portal data should show QR URL or missing-token state. Token generation/rotation remains an admin-only mutation that updates partner rows and partner portal display data after success.

   Alternative considered: auto-generate tokens during partner load. That turns a read into a write and obscures auditability.

## Risks / Trade-offs

- Protected rows could leak through broad fetchers -> Keep every operational fetcher scoped by resolved viewer role/partner ownership before reading rows.
- Admin payloads could become large -> Use tab-level query keys and member detail fetches where practical.
- Mutation success could leave stale rows visible -> Require each action result to include invalidation hints for the exact affected admin, partner, public, member, and export query keys.
- Export behavior may outgrow client-side CSV generation -> Keep export row generation behind server query helpers so it can move to a streaming route without changing authorization semantics.
- Existing action coverage may be incomplete for one visible legacy control -> Prefer adding a narrow action wrapper over moving mutation logic into UI components.
