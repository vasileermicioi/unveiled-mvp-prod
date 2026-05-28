## 1. Database Schema & Indexing

- [x] 1.1 Add database indexes on `userProfiles.lastName` and `partners.name` in `src/db/schema.ts`.
- [x] 1.2 Generate and run database migrations using drizzle-kit.

## 2. Backend Query & Server Actions Updates

- [x] 2.1 Update query methods in `src/lib/data-access/` to support `limit` and `offset` parameters and return `totalCount` and `hasMore` metadata.
- [x] 2.2 Update query methods in `src/lib/admin-operations.ts` to support limit/offset pagination.
- [x] 2.3 Update server action schemas in `src/actions/` to accept `page` and `pageSize` properties.

## 3. React Frontend Component & Hooks Integration

- [x] 3.1 Build a reusable pagination control component in `src/components/unveiled/visual-system-app.tsx`.
- [x] 3.2 Add pagination state hooks for admin members directory and bind controls to the list.
- [x] 3.3 Add pagination state hooks for partners directory and bind controls to the list.
- [x] 3.4 Add pagination state hooks for events registry and bind controls to the list.

## 4. Verification and Regression Tests

- [x] 4.1 Run standard Astro compile checks and Biome formatting via `bun run check`.
- [x] 4.2 Update parity test suites to support and verify paginated loaders.
- [x] 4.3 Run smoke and contract test suites to verify pagination flow.
