## Why

In the partner portal, a partner can filter the guest list by event. However, when downloading the guest code CSV file, the application triggers `actions.getPartnerBookingExportRows({})` with no parameters. This causes the partner to download the codes and booking info for all their events combined, ignoring the selection in the event dropdown.

## What Changes

- Update `actions.getPartnerBookingExportRows` schema in `src/actions/index.ts` to accept an optional `eventId` field in the input.
- Update `getPartnerGuestExportRows` query in `src/lib/admin-operations.ts` to apply an optional where clause filter (`eq(bookings.eventId, eventId)`) if `eventId` is provided.
- In `visual-system-app.tsx`, pass the selected event ID filter (`eventFilter`) to the `actions.getPartnerBookingExportRows({ eventId: eventFilter })` call on CSV download click.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `forms-actions`: Extend partner export action schema to support event filtering.
- `operations`: Update data query layer to filter partner booking records by event.

## Impact

- `src/actions/index.ts`: Add `eventId` parameter to the action input schema and pass it to the DB helper.
- `src/lib/admin-operations.ts`: Modify `getPartnerGuestExportRows` function signature and query filtering.
- `src/components/unveiled/visual-system-app.tsx`: Pass the `eventFilter` state to the server action trigger.
