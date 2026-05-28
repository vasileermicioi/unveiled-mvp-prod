## 1. Backend Schema and Action Updates

- [x] 1.1 Update `getPartnerGuestExportRows` function signature in `src/lib/admin-operations.ts` to accept an optional `eventId: string` parameter before the `database` parameter
- [x] 1.2 In `getPartnerGuestExportRows` (`src/lib/admin-operations.ts`), conditionally apply an `eq(bookings.eventId, eventId)` filter to the Drizzle query where clause when `eventId` is provided
- [x] 1.3 Update `getPartnerBookingExportRows` action schema in `src/actions/index.ts` from `jsonInputSchema` to `z.object({ eventId: z.string().trim().optional() })`
- [x] 1.4 Update the `getPartnerBookingExportRows` action handler in `src/actions/index.ts` to pass `input.eventId` to the query helper function

## 2. Frontend UI Wiring

- [x] 2.1 Update the CSV download callback in `src/components/unveiled/visual-system-app.tsx` inside the `PartnerPortal` component to pass `{ eventId: eventFilter || undefined }` to the `actions.getPartnerBookingExportRows` action

## 3. Verification

- [x] 3.1 Run `bun run check` to verify there are no TypeScript compile or formatting errors
- [x] 3.2 Run parity regression suite using `bun run test:parity` to verify all tests pass successfully
