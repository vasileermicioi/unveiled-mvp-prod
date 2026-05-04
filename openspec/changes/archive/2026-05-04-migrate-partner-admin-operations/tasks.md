## 1. Data Model And Existing Behavior Audit

- [x] 1.1 Compare target Drizzle schema against old Firebase fields for events, partners, bookings, users, profiles, and credit ledger entries.
- [x] 1.2 Add or confirm fields for partner venue check-in tokens, partner portal linkage, booking `checkedInAt`, subscription freeze state, and ledger actor/reason data.
- [x] 1.3 Define typed operation result shapes for success, validation errors, authorization failures, not-open check-in, already-used booking, and no-eligible-booking states.
- [x] 1.4 Decide and document the partner portal first-login flow using Better Auth invitation, password reset, or generated temporary password.

## 2. Authorization And Operation Foundations

- [x] 2.1 Add shared helpers to resolve the current viewer, assert admin access, and resolve partner ownership from Better Auth session plus domain profile data.
- [x] 2.2 Add shared validation schemas for event, event series, partner, portal provisioning, check-in, freeze/unfreeze, and credit adjustment inputs.
- [x] 2.3 Add transaction helpers or service structure for operational mutations that need multi-row Drizzle/Postgres writes.

## 3. Event Operations

- [x] 3.1 Implement admin event create with required field validation, redemption configuration validation, weekday/start-time derivation, and typed action result data.
- [x] 3.2 Implement admin event update with capacity preservation based on already-booked tickets and refreshed event/admin/discovery invalidation hints.
- [x] 3.3 Implement admin event delete or deactivate behavior with relational constraint handling and safe typed failures.
- [x] 3.4 Implement event series generation from slots as a single operation that rejects empty valid-slot submissions.

## 4. Partner And Portal Operations

- [x] 4.1 Implement admin partner create/update for venue details, contact email, logo URL, token state, and portal linkage fields.
- [x] 4.2 Implement partner venue check-in token generation/rotation with unique token storage and venue QR URL display data.
- [x] 4.3 Implement partner deletion with checks for linked events, bookings, and portal users according to target relational constraints.
- [x] 4.4 Implement partner portal access provisioning through Better Auth identity linking, partner role/profile assignment, and partner ownership association.

## 5. Check-In Operations

- [x] 5.1 Implement partner/admin manual booking check-in for confirmed bookings inside the 24-hour-past to 18-hour-future check-in window.
- [x] 5.2 Enforce partner ownership on manual partner check-in so partners can only check in bookings for their own venue.
- [x] 5.3 Implement member venue QR check-in by token, selecting the closest eligible confirmed booking for that partner inside the check-in window.
- [x] 5.4 Return safe typed outcomes for invalid token, no eligible booking, not-open window, already-used booking, and forbidden access.

## 6. Admin Member Operations

- [x] 6.1 Implement authorized user listing with member rows, role, subscription status, credits, booking counts, event-open counts, and expanded history data.
- [x] 6.2 Implement freeze/unfreeze subscription status with updated member display data.
- [x] 6.3 Implement admin credit adjustment with balance update and credit ledger entry containing actor and reason data.

## 7. Display Data And Exports

- [x] 7.1 Extend admin and partner display queries with joined partner, event, booking, portal linkage, token, and check-in fields required by the specs.
- [x] 7.2 Add authorized partner export row projection for booking/code data scoped to the linked partner.
- [x] 7.3 Add authorized admin export row projection for partner, booking, and event-oriented data required by the admin UI.
- [x] 7.4 Add action result view-model data for success notices, safe errors, field errors, affected IDs, and invalidation hints.

## 8. Page Wiring

- [x] 8.1 Wire admin event forms and row actions to event create/update/delete/series operations and render returned validation or authorization failures.
- [x] 8.2 Wire admin partner forms and row actions to partner create/update/delete, token rotation, and portal provisioning operations.
- [x] 8.3 Wire partner guest row check-in actions and export controls to authorized operations/query data.
- [x] 8.4 Wire admin member refresh, freeze/unfreeze, and credit adjustment controls to member operations.
- [x] 8.5 Add or connect the member-facing venue QR check-in route flow for guests and signed-in members.

## 9. Verification

- [x] 9.1 Add focused tests for non-admin authorization failures across event, partner, portal, and member operations.
- [x] 9.2 Add tests for event redemption validation, event series empty rejection, and capacity preservation on event update.
- [x] 9.3 Add tests for partner ownership enforcement and manual/QR check-in window behavior.
- [x] 9.4 Add tests for credit adjustment ledger entries and freeze/unfreeze persistence.
- [x] 9.5 Run the project validation commands and fix regressions before marking the change ready.
