## 1. Setup & Localization Extensions

- [x] 1.1 Add new dictionary translation keys for administrative views, table headings, and toast messages in `src/lib/i18n.ts`.
- [x] 1.2 Add checkout form translation keys for Stripe billing methods, SEPA Direct Debit mandates, and dynamic status states in `src/lib/i18n.ts`.

## 2. Dynamic Stripe Elements Integration

- [x] 2.1 Replace static placeholder text fields (`copy.stripeCard` and `copy.stripeSepa`) with mountable HTML container target divs in `src/components/unveiled/visual-system-app.tsx`.
- [x] 2.2 Wire client-side Stripe loader logic (`loadStripe`) using the config publishable key, initializing card/SEPA elements on checkout dialog activation.

## 3. Event Series Builder Upgrades

- [x] 3.1 Remove the hardcoded date series default range string from the Event Series Builder input inside `src/components/unveiled/visual-system-app.tsx`.
- [x] 3.2 Implement dynamic date range picker and weekday checkbox options within the administrative series builder form.

## 4. Localized Action Validations

- [x] 4.1 Update validation error formatting schemas in `src/lib/forms/action-result.ts` to select and format error responses according to the caller's locale.
- [x] 4.2 Validate that the user's active locale parameter is safely forwarded to all server-action handlers.

## 5. Verification & Testing

- [x] 5.1 Run visual regression and smoke check tests to confirm form element layout remains clean.
- [x] 5.2 Verify bilingual language toggles correctly localize all newly added admin and checkout text fields.
