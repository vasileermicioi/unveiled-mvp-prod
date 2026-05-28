## Context

Currently, the admin panel in `src/components/unveiled/visual-system-app.tsx` has a partner filter dropdown ("Export partner") alongside the booking CSV export button. However, the select component is uncontrolled, and the export button triggers `actions.getAdminExportRows({})` without passing any partner filter. This results in the export action returning bookings across all partners regardless of the selected option.

## Goals / Non-Goals

**Goals:**
- Bind the "Export partner" select input to a state variable in the `AdminPanel` component.
- Pass the selected partner's ID to `actions.getAdminExportRows` when triggering the export.
- Update `actions.getAdminExportRows` schema and its DB query function to support filtering results by an optional `partnerId`.

**Non-Goals:**
- Changing database schemas or altering how CSV data is generated.
- Modifying other export actions.

## Decisions

### 1. Update Server Action Input Schema
- **Choice**: Change the action input schema for `getAdminExportRows` in `src/actions/index.ts` from `jsonInputSchema` to `z.object({ partnerId: z.string().trim().optional() })`.
- **Rationale**: This explicitly documents and validates that `getAdminExportRows` can accept an optional `partnerId` string parameter, leveraging Astro Actions' type-safe schema checks.

### 2. State Binding in React component
- **Choice**: Add an `exportPartnerId` state variable initialized to `""`. Use `e.currentTarget.value` in the `onChange` callback of `SelectInput` to update it.
- **Rationale**: An explicit state hook is standard in React to manage uncontrolled elements. When the export action is invoked, we pass `{ partnerId: exportPartnerId || undefined }` to handle the "All partners" fallback case correctly.

## Risks / Trade-offs

- **[Risk]**: Passing an invalid partnerId string (e.g. empty string) to query helper.
  - **Mitigation**: Standardize on `exportPartnerId || undefined` at the action call level, and only append the where condition in `getAdminExportRows` if the parameter is a non-empty string.
