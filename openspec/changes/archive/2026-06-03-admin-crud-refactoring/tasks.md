## 1. UI Form Prefilling and Edit Controls

- [x] 1.1 Add `editingEventId` and `editingPartnerId` React state hooks in `visual-system-app.tsx`.
- [x] 1.2 Add "Edit" action buttons in the Event and Partner table rows.
- [x] 1.3 Update form headers dynamically (e.g. "Edit Event" vs "New Event") depending on the editing state.
- [x] 1.4 Populate the event and partner forms with properties of the selected record when in edit mode.

## 2. Safety Deletion Confirmation Dialog

- [x] 2.1 Implement a confirmation modal using the custom `ModalShell` component in `visual-system-app.tsx`.
- [x] 2.2 Route delete button clicks to open the confirmation modal instead of triggering instant deletion.
- [x] 2.3 Connect the modal actions to trigger actual delete mutations (`actions.deleteEvent`, `actions.deletePartner`) or close the modal on cancel.

## 3. Form Validation and Error Localization

- [x] 3.1 Verify that form validation handles update fields (like `id`) alongside standard properties in Zod schemas.
- [x] 3.2 Update server actions to return detailed validation error results in the user's active language.
- [x] 3.3 Ensure the client-side panels display error validation notices inline and clear them upon subsequent edits.

## 4. Verification and Playwright Integration Tests

- [x] 4.1 Run standard Astro compile checks and formatting tools.
- [x] 4.2 Run transaction integration test suites to check CRUD updates and confirm deletions.
