## Why

Partner and admin screens have been visually migrated, but their operational behavior still lives in the old Firebase app. Moving this behavior now creates a clear Postgres/Drizzle-backed boundary for event CRUD, partner CRUD, portal access, check-in, exports, and admin member operations without coupling it to member booking transactions.

## What Changes

- Add server-side admin event management for create, update, delete, event-series generation, redemption validation, derived schedule fields, and remaining-capacity preservation.
- Add partner management operations for create, update, delete, check-in token generation/rotation, contact details, logo URL, venue data, and portal linkage.
- Add partner portal access provisioning through Better Auth/domain profile records, partner role assignment, and partner ownership linkage.
- Add partner/admin manual booking check-in and member venue QR check-in with server-side role and ownership enforcement.
- Add admin member operations for listing users, freezing/unfreezing subscription status, and adjusting credits through ledger entries.
- Keep CSV/export-oriented admin and partner data available from server-authorized query data.

## Capabilities

### New Capabilities
- `operations`: Covers authorized server operations for admin event/partner/member workflows, partner portal access, and check-in behavior.

### Modified Capabilities
- `pages`: Admin and partner pages must submit to and render results from the new operations instead of relying on legacy-only behavior.
- `display-data`: Admin and partner display data must expose the joined or synchronized fields needed for event, partner, member, check-in, and export-oriented views.

## Impact

- Affected old references: `_old_app/store.ts`, `_old_app/functions/src/index.ts`, `_old_app/components/AdminPanel.tsx`, and `_old_app/components/PartnerPortal.tsx`.
- Affected app areas: Astro actions/forms, admin pages, partner portal pages, Better Auth profile/role data, Drizzle schema/queries, booking status updates, credit ledger writes, and display-data query modules.
- The change does not alter member booking transaction internals, payment provider lifecycle, or daily email jobs.
