## Context

The target app now runs Astro/React SSR with Better Auth backed by Drizzle, but `src/db/schema.ts` only contains the Better Auth tables. The legacy app stores product data in Firestore collections (`users`, `partners`, `events`, `bookings`, `waitlist`, `ledger`) and relies on array fields such as `savedEventIds`, nested user profile/subscription/behavior objects, Firestore indexes, and Firebase Auth UIDs.

This change converts those product concepts into a relational Drizzle/Postgres model. It should use `_old_app/FIRESTORE_SCHEMA.md`, `_old_app/types.ts`, `_old_app/store.ts`, and `_old_app/firestore.indexes.json` as read-only behavioral/data references, while keeping Better Auth as the identity/session owner in the target app.

The implementation should not import Firebase SDKs, reproduce the old singleton store, or implement transactional booking/payment/check-in behavior. It should establish the schema, migrations, indexes, and seed data that later changes can build on.

## Goals / Non-Goals

**Goals:**

- Add relational tables and enums for the Unveiled domain model.
- Link domain profile rows to Better Auth users without modifying Better Auth's ownership of identity.
- Preserve legacy-visible roles, subscription states, preferences, event metadata, booking states, waitlist states, ledger types, ticket types, and redemption modes.
- Replace Firestore document arrays with relational join tables where the relationship needs querying or constraints.
- Add indexes that support known discovery, booking, partner, admin, waitlist, saved-event, and ledger query patterns.
- Add deterministic local seed data for demo partners/events equivalent to the old app's built-in examples.

**Non-Goals:**

- No UI work.
- No auth/session route UX.
- No booking credit transaction, waitlist promotion, check-in, partner provisioning, payment, webhook, or scheduled email behavior.
- No live data migration from an existing Firebase project.
- No Cloudflare deployment/storage work.

## Decisions

1. **Keep Better Auth tables as identity tables and add a separate domain profile table.**

   Domain fields such as role, partner ownership, credits, subscription state, language, profile names, preferences, and behavior counters should live outside the Better Auth `user` table in a linked `user_profile` or similarly named domain table. This keeps Better Auth upgrades and adapter expectations isolated from product-specific schema.

   Alternative considered: add role and product fields directly to the Better Auth `user` table. Rejected because Better Auth owns that adapter schema, and product fields will evolve independently from auth identity.

2. **Model `savedEventIds` as a join table.**

   Firestore stores saved events as an array on the user document. Postgres should store saved events as a `saved_events` join table with a unique `(user_id, event_id)` constraint and timestamps. This supports counts, filtering, and deletion constraints without array mutation logic.

   Alternative considered: store saved IDs as JSON/array on the profile row. Rejected because saved-event lookups are part of feed and shell count behavior.

3. **Use relational tables for core entities and JSON only for flexible preference/behavior details.**

   Partners, events, bookings, waitlist entries, and ledger entries should be normalized. User preferences and behavior counters may use typed JSON columns where they are primarily loaded as whole-profile state and do not need relational joins in this change.

   Alternative considered: normalize every preference and behavior field into separate tables. Rejected for this change because it adds complexity without a current query requirement.

4. **Do not store denormalized `partnerName` as the primary display source.**

   Events should reference partners by foreign key. Display view models can join partner name/address/logo from the partner row. If later performance requires denormalized display snapshots, that should be justified by data-access work.

   Alternative considered: preserve legacy `events.partnerName` directly. Rejected because relational joins are straightforward and avoid sync bugs when partner names change.

5. **Represent business states with explicit Postgres enums or constrained text unions.**

   Role, subscription, booking, ticket, secret code mode, waitlist status, ledger type, timing mode, newsletter status, payment method, age group, and language should be constrained in schema. Prefer Drizzle enum helpers where practical, and choose consistent lower-level database values that match legacy uppercase labels when these values are business-facing.

   Alternative considered: unconstrained `text` fields. Rejected because later transactional actions depend on stable finite states.

6. **Seed only core demo partner/event data.**

   Local seed data should create old-app-equivalent demo partners and events. It should not create demo users, auth accounts, bookings, ledger entries, or payment states unless a later auth or booking change requires them.

   Alternative considered: seed a full demo account universe. Rejected because auth/password and payment flows are out of scope.

## Risks / Trade-offs

- **Risk: schema shape overfits the old Firestore model** -> Mitigation: preserve user-visible states and query needs, but use relational tables, foreign keys, joins, and constraints instead of document nesting by default.
- **Risk: later booking transactions need stricter constraints than this pass adds** -> Mitigation: include unique/idempotency-ready columns and indexes where known, but leave transaction logic to the booking change.
- **Risk: JSON preferences reduce queryability** -> Mitigation: keep JSON only for fields not currently needed for filtering/indexing; event filters and role/partner/credits/subscription remain typed/indexable.
- **Risk: Better Auth schema coupling causes migration friction** -> Mitigation: reference Better Auth `user.id` from domain tables instead of altering adapter tables beyond existing definitions.
- **Risk: seed data becomes production data accidentally** -> Mitigation: make seed script explicit/manual and idempotent, and avoid running it from migrations.

## Migration Plan

1. Add domain enums and tables to `src/db/schema.ts`, preserving existing Better Auth tables.
2. Generate a Drizzle migration.
3. Add indexes and unique constraints for known query patterns.
4. Add a manual seed script for demo partners/events that is safe to run repeatedly in development.
5. Run migration against the configured Postgres `DATABASE_URL`.
6. Run project checks and verify Drizzle Studio can inspect the new tables.

Rollback is database-schema oriented: revert the schema code and generated migration before applying it, or create a follow-up migration to drop newly added domain tables if already applied in a disposable development database. Production rollback planning should wait until live data migration is in scope.

## Open Questions

- Should user behavior stay as an aggregate JSON column, or should a later analytics/event-log change introduce normalized events?
- Should newsletter fields remain in the domain profile now, or wait for a dedicated email/newsletter change?
- Should seed data use fixed IDs from the old app (`p1`, `p2`, `e1`, `e2`) or generated UUIDs with stable slugs?
