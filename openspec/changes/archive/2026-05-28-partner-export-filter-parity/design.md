## Context

Currently, when a partner is in the partner portal and selects an event filter, they can see the filtered guest list in the UI. However, if they click the CSV download button to export the guest codes, the export action triggers `actions.getPartnerBookingExportRows({})` with no parameters, returning all booking rows for all events combined. We want to forward the active `eventFilter` parameter to filter the CSV file accordingly.

## Goals / Non-Goals

**Goals:**
- Add an optional `eventId` input parameter to the `actions.getPartnerBookingExportRows` server action.
- Update the backend query in `getPartnerGuestExportRows` to apply a where clause filter (`eq(bookings.eventId, eventId)`) when the `eventId` is provided.
- Bind the CSV download action callback in `visual-system-app.tsx` to forward the active `eventFilter` state.

**Non-Goals:**
- Filtering other partner operations or modifying administrative exports.

## Decisions

### 1. Extend Server Action Input Schema
We will update the action schema to `z.object({ eventId: z.string().trim().optional() })` in `src/actions/index.ts`. This is backward-compatible and standard for optional filter fields.

### 2. Conditionally Apply Query Where Clause
In `src/lib/admin-operations.ts`, inside `getPartnerGuestExportRows`, we will append the Drizzle where clause filter conditionally when `eventId` is specified.

## Risks / Trade-offs

- **Risk**: Passing a mismatched or malformed `eventId`.
  * **Mitigation**: The backend Drizzle query already joins with `events` and checks `bookings.partnerId`, ensuring that partners can only fetch records they own. If they pass a random `eventId`, the query will return an empty set.
