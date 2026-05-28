## Why

The admin panel provides an "Export partner" dropdown menu alongside the CSV download button. However, the dropdown is currently uncontrolled and the click action triggers `actions.getAdminExportRows({})` without passing the selected partner. This results in the admin always downloading all bookings for all partners, instead of filtering down to the chosen partner.

## What Changes

- Update `actions.getAdminExportRows` schema in `src/actions/index.ts` to accept an optional `partnerId` field in the input.
- Update `getAdminExportRows` query in `src/lib/admin-operations.ts` to apply a where clause filter (`eq(bookings.partnerId, partnerId)`) if `partnerId` is provided.
- In `visual-system-app.tsx`, bind the "Export partner" `<SelectInput>` component to a local state variable (e.g., `exportPartnerId`).
- Pass the selected `partnerId` to `actions.getAdminExportRows({ partnerId })` inside the CSV download action callback.

## Capabilities

### New Capabilities

### Modified Capabilities
- `forms-actions`: Extend export actions schema to support partner filtering.
- `operations`: Update data query layer to conditionally filter bookings.

## Impact

- `src/actions/index.ts`: Add `partnerId` parameter to the action input schema and pass it to the DB helper.
- `src/lib/admin-operations.ts`: Modify `getAdminExportRows` function signature and add query filtering.
- `src/components/unveiled/visual-system-app.tsx`: Bind the dropdown state and pass it to the server action trigger.
