## 1. Routing and Dynamic Page Migration

- [x] 1.1 Move existing Astro page files from `src/pages/*.astro` to `src/pages/[lang]/*.astro`.
- [x] 1.2 Implement the root router and locale detector redirect in `src/pages/index.astro`.
- [x] 1.3 Update links across all page navigation components to prepend the dynamic active `lang` prefix.

## 2. Navigation Shell & Language Switcher Refactor

- [x] 2.1 Modify navigation components inside `app-shell.tsx` to handle dynamic prefix routes.
- [x] 2.2 Refactor the language selector inside `app-shell.tsx` to execute a route-preserving path rewrite.
- [x] 2.3 Sync the `unveiled_lang` cookie on language switcher activation to allow auth callback fallbacks.

## 3. Schema & Form Validation i18n

- [x] 3.1 Audit Zod schemas in `src/lib/forms/schemas.ts` and bind error properties to dynamically localized translation functions.
- [x] 3.2 Update server actions to return validation error payloads localized to the request context.
- [x] 3.3 Bind client form overlays to render validation errors in the active route language.

## 4. Modals and Copy Cleanup

- [x] 4.1 Audit deletion confirmation modals on the Admin panel and translate all buttons and body text.
- [x] 4.2 Replace placeholder copy (e.g., Stripe sandbox instructions) with clean, production-ready strings in German and English.

## 5. Validation & Tests

- [x] 5.1 Run local compiler check `npm run check` and Biome formatters to verify layout integrity.
- [x] 5.2 Refactor parity smoke test targets to assert page elements under `/de/` and `/en/` subroutes.
- [x] 5.3 Verify root redirect behavior manually and via end-to-end assertions.
