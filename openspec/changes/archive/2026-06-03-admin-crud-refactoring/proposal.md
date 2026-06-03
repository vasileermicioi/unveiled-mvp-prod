## Why

The administrative interface currently only supports the creation of new events and partner venues. There is no user interface in the Admin Panel to edit existing records. Additionally, delete operations execute immediately without any confirmation, presenting a significant risk of accidental data deletion. To meet production standards, the admin dashboard must support complete CRUD lifecycles with robust client/server form validation, clear error messages, and safety confirmation checks before executing destructive actions.

## What Changes

- **Edit Modals and Forms:**
  - Build edit panels (`edit-event` and `edit-partner` states) in `AdminPanel`.
  - Provide "Edit" action buttons next to each row in the Events and Partners tables.
  - Prefill the forms with existing database values (retrieved from query states) and link them to the server actions using their unique record IDs.
- **Delete Confirmation Modal:**
  - Introduce a reusable delete confirmation dialog in `visual-system-app.tsx` utilizing `ModalShell`.
  - Enforce explicit confirmation ("Are you sure you want to delete this partner/event? This action cannot be undone.") before making delete calls.
- **Form Validation & Server Error Feedback:**
  - Add client-side form validation using `react-hook-form` to validate email formats, date validity, capacity limits, and required fields.
  - Catch server action errors (such as record conflict, foreign key check failures, or missing fields) and present them as user-friendly, translated inline messages.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `operations`: Add editing interface and deletion safety checks (confirmation dialogs) for partners and events in the Admin operations dashboard.
- `forms-actions`: Support prefilled forms and input validation updates for partner and event editing.

## Impact

- `src/components/unveiled/visual-system-app.tsx`: Integrate edit forms and confirmation dialogs in the events and partners dashboard views.
- `src/actions/index.ts`: Refactor save actions (`saveEvent`, `savePartner`) to return localized validation errors when update fields fail constraints.
