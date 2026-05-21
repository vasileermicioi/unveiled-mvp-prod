## Why

The legacy app supports German and English copy through `_old_app/translations.ts`, but the migrated app still renders many public, member, booking, onboarding, profile, and shell strings as hardcoded English. Completing bilingual copy parity prevents mixed-language flows and gives the parity suite a durable contract for language switching and persistence.

## What Changes

- Inventory legacy translation keys and visible strings by route and map them to migrated public, member, booking, onboarding, profile, and shared shell surfaces.
- Introduce or complete a typed German/English translation dictionary aligned to migrated view models and route surfaces.
- Replace hardcoded user-visible route labels, form labels, CTAs, empty states, status banners, modal text, and booking outcome copy where language parity is required.
- Persist guest language selection in the existing guest cookie and authenticated member language selection in the member profile.
- Ensure booking, waitlist, and booking failure states render in the selected language without stale mixed-language copy.
- Add unit and Playwright parity coverage for language persistence and representative German and English public/member route landmarks.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `app-shell`: Shell navigation, language toggle, status messages, and shared wrappers render localized copy and persist selected language for guests and authenticated viewers.
- `pages`: Public, member, onboarding, profile, booking, saved, and bookings route landmarks render legacy-equivalent German and English copy.
- `ui-system`: Reusable controls, forms, modal states, empty states, loading states, and error states receive localized display labels and messages.
- `display-data`: Display models expose selected language and localized labels/messages needed by public, member, and booking surfaces.
- `auth`: Viewer hydration and member profile actions preserve selected language for authenticated members while guest requests use the persisted language cookie.

## Impact

- Affected legacy references include `_old_app/translations.ts`, `_old_app/App.tsx`, and `_old_app/components/*.tsx`.
- Affected migrated code includes `src/components/unveiled/app-shell.tsx`, `src/components/unveiled/visual-system-app.tsx`, `src/lib/auth-display.ts`, `src/lib/data-access/mappers.ts`, route loaders/actions, and tests that assert visible copy.
- Affected specs include `app-shell`, `pages`, `ui-system`, `display-data`, and `auth`.
- Testing impact includes focused dictionary/type coverage, language persistence tests, and Playwright parity smoke assertions for representative German and English public and member paths.
- No new languages, professional copy rewrite, translation service integration, or broad admin-only internal label translation is introduced.
