## Why

The current application contains several hardcoded mock placeholders and instruction texts (e.g., `"Stripe card fields mount here"`, `"Series builder" defaults like "04 May - 30 May"`, and custom error strings). To make the application production-ready, all text content must be driven by internationalization (i18n) schemas, and mock/placeholder strings must be replaced with proper localized copy or dynamic empty states.

## What Changes

- **Update `i18n.ts` (`appCopy`):** Add missing translations for all admin views, placeholder hints, action validation feedback, and billing status messages in both German (`DE`) and English (`EN`).
- **Remove Mock Placeholders:** 
  - Replace static Stripe UI text placeholders (e.g., `"Stripe Kartenfelder erscheinen hier"`) with standard integration container divs that dynamically load Stripe Elements when selected.
  - Clear hardcoded `defaultValue` string prompts in the Event Series Builder and replace them with actual date picker and day selection inputs.
- **Widen Translation Coverage:** Replace any remaining hardcoded strings in `visual-system-app.tsx` with calls to `copyFor(lang)` or `appCopy[lang]`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ui-system`: Extend the central localization copy mapping with admin and checkout form translation keys, and eliminate mock text elements in the user interface.
- `forms-actions`: Support correct validation messages matching the selected browser language.

## Impact

- `src/lib/i18n.ts`: Declare additional keys under `admin` and `booking` translation schemas.
- `src/components/unveiled/visual-system-app.tsx`: Bind all static UI text segments to `copyFor(selectedLanguage)`.
