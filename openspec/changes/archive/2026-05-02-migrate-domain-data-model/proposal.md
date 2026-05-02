## Why

The migrated app currently has Better Auth persistence but no relational product data model for Unveiled's core domain. The old product model lives in Firebase Auth, Firestore collections, callable functions, and TypeScript store types; this change establishes the Drizzle/Postgres schema foundation needed before rebuilding feature routes, actions, and data loaders.

## What Changes

- Add a Drizzle/Postgres domain schema for user profiles, partner venues, events, bookings, waitlist entries, credit ledger entries, saved events, and user behavior/audit data.
- Preserve legacy user-visible business states while adapting them to relational constraints and Better Auth user identity.
- Replace Firestore array and document patterns with relational tables, foreign keys, indexes, and unique constraints where appropriate.
- Add indexes for discovery, bookings, partner portal, admin, waitlist, saved events, and ledger query patterns.
- Add generated migrations and local seed data equivalent to the old demo partners/events.
- Keep booking transaction behavior, auth session UX, payment provider integration, and live Firebase data migration out of scope.

## Capabilities

### New Capabilities

- `domain-data`: Relational database contract for Unveiled domain entities, enums, relationships, indexes, and seed data.

### Modified Capabilities

- `display-data`: Clarify that display view models can be derived from the new relational domain rows while preserving existing UI-visible fields.

## Impact

- Affected code: `src/db/schema.ts`, Drizzle migrations under `drizzle/`, seed scripts, database-related package scripts, and any new schema helper modules.
- Affected systems: Postgres/Neon development database, Better Auth user table references, future Astro Actions and TanStack Query loaders.
- Affected data contracts: domain values behind event cards, profile panels, bookings, partner portal rows, admin rows, shell counts, and derived statistics.
- Non-goals: no UI changes, no booking/payment/check-in implementation, no Firebase runtime imports, and no live production Firebase migration.
