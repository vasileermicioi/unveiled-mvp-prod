## Why

Currently, database query helpers fetch all entries from tables (such as all bookings, all events, and all user profiles) without pagination boundaries. As the application grows, large datasets will trigger out-of-memory errors, API timeouts, and slow rendering. Supporting limit/offset pagination on both frontend and backend is a production-level requirement.

## What Changes

- **Backend Pagination Parameters**: Update database queries in `src/lib/admin-operations.ts` and `src/lib/data-access/` to accept `limit` and `offset` variables (defaulting to e.g., 20 items per page).
- **Server Action Schema Updates**: Extend server action inputs (`actions.listUsers`, `actions.getAdminExportRows`, and live queries) to accept `page` and `pageSize` integer fields.
- **Frontend Pagination Controls**: Add compact Pagination Controls (Previous/Next page buttons, Page indicator, and Page-Size selector) to the admin members list, partners list, and events grid.
- **Drizzle Database Indexing**: Declare indexes in `src/db/schema.ts` on frequently sorted or filtered columns (e.g. `userProfiles.lastName`, `bookings.createdAt`, `partners.name`) to prevent full table scans.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `data-access`: Support limit/offset options across query methods.
- `operations`: Update user, event, and partner retrieval helpers with pagination metadata (e.g., total count, hasMore pages).

## Impact

- `src/db/schema.ts`: Define indexes on search and sort keys for fast retrieval.
- `src/lib/admin-operations.ts`: Update functions like `getPartnerGuestExportRows`, `listUsers`, and event lists with page logic.
- `src/components/unveiled/visual-system-app.tsx`: Add a reusable `Pagination` control component and wire it to state hooks.
