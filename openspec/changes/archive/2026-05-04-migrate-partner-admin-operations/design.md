## Context

The migrated admin and partner UI surfaces currently describe visible behavior, but the operational behavior remains in the legacy Firebase store and callable functions. The target app uses Astro actions/forms, Better Auth, Drizzle, and Postgres, so partner/admin workflows need a server-side operations layer that enforces roles, ownership, validation, and transactional data changes.

The main stakeholders are admins managing events, partners, and members; partners checking in guests and exporting booking codes; and members scanning venue QR links. Existing member booking transaction internals, payment lifecycle work, and daily email jobs stay out of scope.

## Goals / Non-Goals

**Goals:**
- Provide authorized server operations for event CRUD, event series creation, partner CRUD, portal provisioning, check-in, user listing, freeze/unfreeze, and credit adjustment.
- Preserve legacy behavior where it affects business outcomes: redemption validation, weekday/start-time derivation, remaining-capacity semantics, partner ownership checks, and the 24-hour-past to 18-hour-future check-in window.
- Feed existing admin and partner pages with action results and refreshed display view models without a page redesign.
- Keep credit changes auditable through ledger entries.

**Non-Goals:**
- Rework member booking transaction internals.
- Implement payment provider lifecycle behavior.
- Implement daily email jobs.
- Build a final storage/upload system for partner logos if deployment storage remains unresolved.

## Decisions

1. Implement an `operations` server boundary around admin and partner mutations.

   Rationale: These workflows cross event, partner, booking, user, and ledger records. A dedicated boundary keeps operational concerns separate from member booking transactions while giving pages a typed action surface.

   Alternative considered: fold this behavior into booking transaction modules. That would blur ownership because event CRUD, portal provisioning, user freezes, and exports are not booking-only behavior.

2. Use Drizzle transactions for multi-row mutations.

   Rationale: Event capacity adjustment, event series creation, booking check-in, partner deletion, portal linkage, and credit adjustments can touch multiple rows or derived counts. Transactions prevent partial writes and make action results easier to reason about.

   Alternative considered: independent writes with follow-up invalidation. That is simpler initially but risks inconsistent partner/event/member views after failures.

3. Enforce authorization in operations, not only at page routing.

   Rationale: Admin and partner pages already have route-level guards, but mutations need their own checks because actions can be called directly. Partner check-in MUST verify the booking belongs to the partner's venue before marking it used.

   Alternative considered: trust server-loaded page state. That is insufficient for protected mutation endpoints.

4. Provision partner portal access through Better Auth identity plus domain profile linkage and a generated temporary password for newly-created portal users.

   Rationale: The app already uses Better Auth/domain profiles for viewer resolution. Portal access should create or link an auth user, assign the partner role, and bind the partner ID in domain data.

   Alternative considered: legacy-style standalone credentials. That would create a second identity path and weaken role/profile consistency. Invitation and password-reset-first flows can replace the temporary password later if Better Auth email delivery is configured.

5. Treat CSV exports as authorized data projections first.

   Rationale: Existing UI needs export-oriented data and buttons, but the important backend contract is that the rows and columns are available only to authorized admins/partners. Client-side CSV generation from query data is acceptable unless server-generated files become necessary for size, audit, or privacy constraints.

   Alternative considered: server-generated files from the start. That adds file handling and storage decisions before the export scale requires it.

## Risks / Trade-offs

- Incorrect capacity preservation during event edits -> Compare old capacity and remaining capacity inside a transaction and preserve already-booked ticket counts when capacity changes.
- Check-in race conditions -> Update only eligible `CONFIRMED` bookings in a transaction with status/window predicates and return a typed already-used/not-eligible result when no row is changed.
- Partner ownership leaks -> Resolve partner ownership from Better Auth session plus domain profile on every partner operation and constrain all booking/event queries by partner ID.
- Portal provisioning temporary password handling -> Return the generated password only in the provisioning result for newly-created users and prefer a future invitation/reset flow once email delivery is configured.
- Partner logo storage uncertainty -> Persist URL fields now; defer upload mechanics unless an existing storage path is already available.
- CSV privacy exposure -> Generate export rows from the same authorized view models used by admin/partner pages and include only specified columns.

## Migration Plan

1. Add or confirm schema fields needed for partner portal linkage, venue check-in token, booking `checkedInAt`, subscription freeze state, and ledger actor/reason data.
2. Implement operations and Astro actions behind existing admin/partner routes.
3. Wire admin and partner pages to submit operations and refresh affected display data after success.
4. Backfill or generate missing partner check-in tokens where partners already exist.
5. Verify with focused action/unit tests for authorization, validation, transactions, check-in windows, and ledger writes.

Rollback is to leave legacy-free UI in place but disable the new action entry points, because the change is additive to the target app and does not require removing old app references.

## Open Questions

- Should CSV downloads be client-generated from authorized query data or server-generated files?
- Should partner logo uploads wait for a storage/deployment change, with this change persisting only logo URLs?
