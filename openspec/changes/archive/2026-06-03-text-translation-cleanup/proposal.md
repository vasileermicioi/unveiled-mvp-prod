## Why

For a production-ready ("PROD") release, the application must present a polished, fully localized experience to both German and English speakers. Currently, several sections of the UI contain hardcoded English messages, instruction copy, and placeholder text (e.g. mock billing cards, warning alerts, and form validation strings). Additionally, server-side database operation errors propagate raw messages instead of properly localized notifications. Furthermore, the active language setting needs to be reflected as part of the page URL path to allow clean bookmarking and locale-consistent sharing.

## What Changes

- **Route-Based Language Routing:**
  - Structure all Astro pages under a dynamic `[lang]` parameter directory (e.g. `src/pages/[lang]/app.astro`, `src/pages/[lang]/discover.astro`, etc.) where `lang` supports `de` and `en`.
  - Redirect default root `/` visits to `/en/` or `/de/` based on client cookie detection or browser language headers.
  - Ensure the language switcher controls in the navigation shell dynamically rewrite the path to toggle between `/de/...` and `/en/...` on the exact same page, rather than resetting to a default page.
- **Comprehensive String & Modal Translation:**
  - Audit and extract all remaining inline/hardcoded strings in `visual-system-app.tsx` and `app-shell.tsx` into `src/lib/i18n.ts`.
  - Add translations for new CRUD components (edit forms, confirm labels, buttons) in both `DE` and `EN`.
  - Double check that all user interaction confirmation modals (e.g., delete confirmation popup, booking confirmations) and state notices are fully translated.
- **System and Validation Error Translation:**
  - Standardize all action failure states (e.g., `conflict`, `not_found`, `unauthorized`, `invalid_token`) to map to localized messages in the frontend.
  - Upgrade Zod schema validators in `src/lib/forms/schemas.ts` to return localized validation error copy based on the active route language setting.
- **Elimination of Placeholders:**
  - Replace mockup descriptions (such as `"Stripe card fields mount here"`) with clean, production-ready explanations of payment workflows.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `app-shell`: Expand the central localization dictionaries (`appCopy`) and update the navigation language switcher to support route-based language paths.
- `pages`: Re-organize page routing structures to support dynamic locale parameters.
- `forms-actions`: Support dynamic language parameter bindings in form validators/actions and localize all action errors.
- `operations`: Localize all admin operations confirmation modals and alerts.


## Impact

- `src/lib/i18n.ts`: Declare additional keys under `admin`, `booking`, `actions`, and `errors`.
- `src/lib/forms/schemas.ts`: Modify validation schemas to reference dynamic, localized message functions.
- `src/components/unveiled/app-shell.tsx` & `src/components/unveiled/visual-system-app.tsx`: Bind form submission handlers, confirmation dialogs, and navigation shell language controls to support route-based language paths.
- `src/pages/[lang]/`: Re-organize page structures to support dynamic locale parameters.
