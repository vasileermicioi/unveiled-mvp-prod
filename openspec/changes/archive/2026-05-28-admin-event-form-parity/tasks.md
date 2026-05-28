## 1. UI Form Component Updates

- [x] 1.1 Declare state variables `ticketType` (default `SECRET_CODE`) and `secretCodeMode` (default `MANUAL`) inside the `AdminPanel` component in `src/components/unveiled/visual-system-app.tsx`
- [x] 1.2 Replace the hardcoded category string in the form submission with a dropdown select input `name="category"` rendering standard event category options (Kultur, Theater, Kino, Museum, Ausstellung, Konzert, Talk/Lesung, Comedy, Tanz/Performance)
- [x] 1.3 Add a dropdown select input `name="ticketType"` or button toggles to let admins choose between "Workaround Password" (`SECRET_CODE`) and "Promo Code" (`VOUCHER`), updating the local state
- [x] 1.4 Conditionally render fields in the form based on `ticketType` state:
  - If `VOUCHER`: show `TextInput` fields for `promoCode` and `eventWebsiteUrl`
  - If `SECRET_CODE`: show dropdown select input `name="secretCodeMode"` (options MANUAL, SHARED_GENERATED, UNIQUE_PER_BOOKING) and a text input for `secretCode` (only visible/required when mode is MANUAL)
- [x] 1.5 Add a checkbox group `name="languages"` for selecting event languages (DE, EN, TR, AR, NON_VERBAL) with custom display labels (e.g. DE, EN, Turki, Arabic, Non-Verbal)
- [x] 1.6 Add a checkbox group `name="targetAgeGroups"` for selecting target age groups (18-25, 26-35, 36-50, 50+)
- [x] 1.7 Add inputs `name="address"` and `name="neighborhood"` for location details, setting sensible defaults (e.g. "Berlin", "Mitte")

## 2. Form Submission Integration

- [x] 2.1 Update the event form's `onSubmit` handler to read category, ticketType, secretCodeMode, secretCode, promoCode, eventWebsiteUrl, languages (via `formData.getAll`), targetAgeGroups (via `formData.getAll`), address, and neighborhood from the FormData object
- [x] 2.2 Construct the payload object for `actions.saveEvent` dynamically using the values extracted from FormData, replacing the previous hardcoded values
- [x] 2.3 Reset the new state fields and checkboxes upon successful event creation/save

## 3. Verification

- [x] 3.1 Run `bun run check` to verify there are no TypeScript compilation errors
- [x] 3.2 Run parity regression suite using `bun run test:parity` to ensure that existing and modified parity tests pass successfully
