## 1. Inventory And Dictionary

- [x] 1.1 Inventory `_old_app/translations.ts`, `_old_app/App.tsx`, and `_old_app/components/*.tsx` for German/English public, member, booking, onboarding, profile, and shared shell copy.
- [x] 1.2 Map legacy copy to migrated route/display concerns and identify admin-only operational labels that remain English.
- [x] 1.3 Create or complete a typed migrated translation dictionary for supported languages `DE` and `EN`.
- [x] 1.4 Add dictionary/type coverage that fails when required German or English keys are missing.

## 2. Language Resolution And Persistence

- [x] 2.1 Verify guest language hydration reads the existing language cookie and safely defaults invalid or missing values.
- [x] 2.2 Verify authenticated viewer hydration reads selected language from the profile and safely defaults invalid or missing values.
- [x] 2.3 Wire guest language toggle updates to persist only the guest cookie.
- [x] 2.4 Wire authenticated language toggle updates through the authorized profile/preference action and refresh viewer/shell display state.

## 3. Display Data Localization

- [x] 3.1 Update public route display builders and mappers to include selected language and localized labels/messages.
- [x] 3.2 Update member discovery, saved, bookings, onboarding, profile, and membership display builders to include localized labels/messages.
- [x] 3.3 Update booking, waitlist, voucher, secret-code, and safe failure result builders to derive visible copy from the current selected language.
- [x] 3.4 Remove component reliance on hardcoded English fallbacks where display data is responsible for visible copy.

## 4. UI And Route Integration

- [x] 4.1 Replace hardcoded shell navigation, public navigation action, status banner, and shell wrapper copy with localized display strings.
- [x] 4.2 Replace public route headings, CTAs, form labels, validation copy, and empty-state strings with localized display strings.
- [x] 4.3 Replace member route headings, controls, form labels, status messages, and empty-state strings with localized display strings.
- [x] 4.4 Replace booking modal outcome, redemption, waitlist, support, loading, copied, and failure strings with localized display strings.
- [x] 4.5 Keep admin-only internal operations labels English unless legacy provided translated equivalents.

## 5. Regression Coverage

- [x] 5.1 Add focused tests for guest language cookie persistence across reloads or navigation.
- [x] 5.2 Add focused tests for authenticated profile language persistence and refreshed shell/member display state.
- [x] 5.3 Add tests for booking success, waitlist, and safe failure outcomes to ensure selected-language copy is current and not stale.
- [x] 5.4 Extend Playwright parity smoke to assert representative German and English public route landmarks.
- [x] 5.5 Extend Playwright parity smoke to assert representative German and English authenticated member route landmarks.

## 6. Verification

- [x] 6.1 Run OpenSpec validation/status for `complete-bilingual-copy-parity`.
- [x] 6.2 Run the project type/check command used by this repository.
- [x] 6.3 Run the focused unit and Playwright parity tests that cover bilingual copy and persistence.
