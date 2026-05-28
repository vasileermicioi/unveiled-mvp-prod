## 1. Backend Action and Operation Updates

- [x] 1.1 Update `getAdminExportRows` function signature in `src/lib/admin-operations.ts` to accept an optional `partnerId: string` parameter before the `database` parameter
- [x] 1.2 In `getAdminExportRows` (`src/lib/admin-operations.ts`), conditionally apply an `eq(bookings.partnerId, partnerId)` filter to the drizzle query where clause when `partnerId` is provided
- [x] 1.3 Update `getAdminExportRows` action schema in `src/actions/index.ts` from `jsonInputSchema` to `z.object({ partnerId: z.string().trim().optional() })`
- [x] 1.4 Update the `getAdminExportRows` action handler in `src/actions/index.ts` to pass `input.partnerId` to the query helper function

## 2. Frontend UI Wiring

- [x] 2.1 Declare a new React state variable `exportPartnerId` (default `""`) inside the `AdminPanel` component in `src/components/unveiled/visual-system-app.tsx`
- [x] 2.2 Bind the "Export partner" `<SelectInput>` component to `exportPartnerId` state and update it via `onChange`
- [x] 2.3 Pass `{ partnerId: exportPartnerId || undefined }` to `actions.getAdminExportRows` when triggering the partner export CSV download callback

## 3. Verification

- [x] 3.1 Run `bun run check` to verify there are no TypeScript compile or formatting errors
- [x] 3.2 Run parity regression suite using `bun run test:parity` to verify all tests pass successfully
