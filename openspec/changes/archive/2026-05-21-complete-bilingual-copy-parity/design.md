## Context

The legacy app centralizes German and English user-facing copy in `_old_app/translations.ts` and applies language switching across navigation, public routes, member discovery, booking, onboarding, profile, and supporting states. The migrated app already carries selected language through shell/viewer state and profile persistence, but many visible strings remain inline English in migrated components and display mappers.

This change is cross-cutting because copy is rendered in shared shell components, page components, form/action results, display-data mappers, and booking modal states. The legacy app remains a reference source only; migrated runtime code must not import from `_old_app/`.

## Goals / Non-Goals

**Goals:**

- Provide a typed German/English copy source for migrated public and member user-visible flows.
- Keep copy selection deterministic from the current viewer language or guest language cookie.
- Replace hardcoded user-facing route labels, form labels, CTAs, empty states, status messages, and booking outcome copy where parity is required.
- Keep display data and UI components aligned so route landmarks can be asserted in both languages.
- Cover representative public and member language switching/persistence behavior in automated tests.

**Non-Goals:**

- Add languages beyond German and English.
- Rewrite product copy beyond legacy-equivalent wording needed for parity.
- Translate admin-only internal operations labels where legacy did not provide translated equivalents.
- Add an external localization service, runtime translation API, or browser-driven machine translation.

## Decisions

1. Use a migrated typed dictionary rather than importing `_old_app/translations.ts`.

   The legacy file is the source of truth for parity analysis, but migrated code should own a target-native dictionary with TypeScript types for supported languages and key groups. This keeps `_old_app/` reference-only and lets the compiler catch missing keys as strings move out of components. The alternative, directly importing the legacy translation module, would couple production code to legacy runtime structure and make cleanup harder.

2. Organize copy by migrated route and display concern.

   Dictionary groups should follow migrated surfaces such as shell, public pages, member discovery, booking modal, onboarding, profile, saved/bookings, forms, and shared states. This is easier to apply to current view models than preserving every legacy key shape. The alternative, a one-to-one legacy key migration, preserves history but tends to leak obsolete component boundaries into the target app.

3. Resolve selected language before building display data.

   Server-side loaders, mappers, and action result builders should receive or derive the selected `DE`/`EN` language before creating display labels and messages. UI components should mostly render localized display strings instead of making independent language decisions. Component-local translation lookup is acceptable for purely presentational shared controls when the language prop is explicit.

4. Preserve current persistence boundaries.

   Guest language changes should write the existing language cookie. Authenticated member language changes should update the profile language through the existing authorized profile/preference action path, then refresh viewer/shell display state. This avoids a parallel preference store and keeps route hydration consistent.

5. Test landmarks, persistence, and stale-state boundaries instead of every string.

   Unit tests should protect dictionary completeness and key display builders. Playwright parity smoke should assert representative DE/EN public and member landmarks plus persistence after reload or navigation. Booking tests should specifically cover success, waitlist, and safe failure states because stale modal state can otherwise mix old copy with the current language.

## Risks / Trade-offs

- Incomplete legacy inventory -> Use route-based inventory against `_old_app/translations.ts` and visible legacy components before replacing migrated strings.
- Dictionary drift from display models -> Type dictionary keys and route/display builders so missing language entries fail tests or type checks.
- Mixed-language action results after a language toggle -> Pass the selected language into action result builders and invalidate refreshed shell/member data after profile language updates.
- Over-translating operational surfaces -> Limit this change to public and member parity plus shared shell/status text; keep admin-only internal labels English unless legacy provided translated equivalents.
- Large component churn -> Replace copy incrementally by surface, with focused tests per surface, while avoiding unrelated layout or data-flow refactors.
