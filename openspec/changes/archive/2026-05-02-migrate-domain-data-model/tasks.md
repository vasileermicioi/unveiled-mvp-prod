## 1. Schema Planning And Guardrails

- [x] 1.1 Review `_old_app/FIRESTORE_SCHEMA.md`, `_old_app/types.ts`, `_old_app/store.ts`, and `_old_app/firestore.indexes.json` for domain fields, states, relationships, and query patterns
- [x] 1.2 Review current `src/db/schema.ts`, existing Drizzle migrations, and Better Auth adapter tables to confirm identity-table constraints
- [x] 1.3 Confirm implementation does not import Firebase runtime modules or modify `_old_app/`

## 2. Domain Enums And User Profile

- [x] 2.1 Add Drizzle enum or constrained value definitions for roles, subscription statuses, newsletter statuses, payment methods, age groups, languages, booking statuses, waitlist statuses, ticket types, secret code modes, timing modes, and ledger types
- [x] 2.2 Add a user domain profile table linked to Better Auth users with role, optional partner linkage, credits, language, names, onboarding state, subscription fields, billing/provider identifiers, and timestamps
- [x] 2.3 Add profile preference storage for age group, interests, moods, districts, max distance, timing, preferred days, preferred languages, accessibility, newsletter state, and preference update timestamps
- [x] 2.4 Add behavior/audit storage for session, event-open, booking, waitlist, save/unsave, filter, recent-event, last-view, last-seen, and last-filter values

## 3. Core Domain Tables

- [x] 3.1 Add partner table with name, address, contact email, logo URL, venue check-in token, portal user linkage, and timestamps
- [x] 3.2 Add event table with partner foreign key, event content, category/type, timing fields, address/neighborhood, coordinates, image URL, tags, pricing, capacity, redemption configuration, accessibility/language/age targeting, and timestamps
- [x] 3.3 Add booking table with user, event, and partner references, ticket count, total credits, booking status, redemption fields, idempotency key, check-in timestamp, and timestamps
- [x] 3.4 Add waitlist table with event/user references, requested quantity, waitlist status, and timestamps
- [x] 3.5 Add credit ledger table with user reference, signed amount, balance after mutation, ledger type, description, optional idempotency key, and timestamp
- [x] 3.6 Add saved events join table with user/event references, timestamps, and uniqueness per user/event

## 4. Indexes Constraints And Display Derivation

- [x] 4.1 Add foreign keys and delete/update behavior that keeps domain rows consistent with Better Auth users, partners, and events
- [x] 4.2 Add discovery indexes for events by date, category, partner, and date-range filtering
- [x] 4.3 Add booking indexes for member bookings, partner guest lists, partner status queries, event booking queries, and created-date ordering
- [x] 4.4 Add waitlist, ledger, and saved-event indexes for event/user/timestamp/count access patterns
- [x] 4.5 Add uniqueness or idempotency-ready constraints for saved events and future booking/ledger transactional operations
- [x] 4.6 Verify relational rows can provide existing display-data fields for events, users, bookings, partner rows, admin rows, shell counts, discovery labels, and operational metrics

## 5. Migrations And Seed Data

- [x] 5.1 Generate a Drizzle migration for the new domain schema
- [x] 5.2 Add a manual idempotent seed script for old-app-equivalent demo partners and events
- [x] 5.3 Ensure seed data avoids creating Better Auth accounts, passwords, payment customers, bookings, or ledger entries
- [x] 5.4 Run migrations against the configured `DATABASE_URL`
- [x] 5.5 Run the seed script against a development database and verify repeated runs do not duplicate rows

## 6. Verification

- [x] 6.1 Run `bun run check`
- [x] 6.2 Run Drizzle generation/migration checks available in the repo
- [x] 6.3 Inspect the migrated database schema with Drizzle Studio or direct SQL to confirm tables, enums, indexes, and constraints
- [x] 6.4 Run `openspec validate migrate-domain-data-model --strict`
- [x] 6.5 Update task checkboxes as implementation and verification steps are completed
