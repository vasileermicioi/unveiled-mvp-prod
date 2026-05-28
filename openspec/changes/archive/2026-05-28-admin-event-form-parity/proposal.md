## Why

When an administrator creates or edits an event, the form submission logic currently hardcodes several critical parameters (such as the category "Theater", ticket type "SECRET_CODE", code strategy "MANUAL", secret code "UNVEILED", language "DE", and age group "26-35"). This makes it impossible for admins to set up different types of events (e.g., films with promo codes, exhibitions, Turkish-language events, etc.). Restoring full control over these fields aligns the new admin panel with legacy features.

## What Changes

- Add form inputs to the admin event creation/edit form in `visual-system-app.tsx`:
  - **Category Select**: Dropdown containing options (Kultur, Theater, Kino, Museum, Ausstellung, Konzert, etc.).
  - **Ticket Type Toggles**: Select or button toggle to choose between "Workaround Password" (`SECRET_CODE`) and "Promo Code" (`VOUCHER`).
  - **Conditional Ticket Fields**:
    - If `VOUCHER`: show inputs for `promoCode` and `eventWebsiteUrl`.
    - If `SECRET_CODE`: show dropdown for `secretCodeMode` (MANUAL, etc.) and text input for `secretCode`.
  - **Languages Selection**: Multi-select/checkbox group for event languages (DE, EN, Turki, Arabic, Non-Verbal, etc.).
  - **Target Age Groups**: Checkbox group for age ranges (18-25, 26-35, 36-50, 50+).
  - **Location Fields**: Inputs for address and neighborhood/district.
- Read these values from the `FormData` in the submission handler and forward them to the `actions.saveEvent` server action.

## Capabilities

### New Capabilities

### Modified Capabilities
- `forms-actions`: Connect all form fields in the admin event creator to the server action payload.

## Impact

- `src/components/unveiled/visual-system-app.tsx`: Wire dynamic form fields and update the `actions.saveEvent` submission mapping to use user-entered values.
