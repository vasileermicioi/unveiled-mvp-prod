## Why

The archived `2026-06-22-routing-orchestrator` change moved the Astro app to `/app/*` but did not audit every app-owned asset and link. Manual testing surfaced seven regressions: the logo `<img src>` resolves to `https://unveiled.app/logos/...` (orchestrator dispatches to landing → 404), the `@font-face` URLs request `/fonts/...` (404 → fallback font), and every app-owned navigation link (hero CTAs, nav items, language switcher, membership, logout, back button, logo home link) is missing the `/app` prefix. The asset files themselves (logo SVGs, EKNoticeSans font files) live in `dist/client/logos/` and `dist/client/fonts/` but are not served by the app because `packages/app/public/` is empty. This change rewrites every app-owned asset and link to use the canonical `/app/...` form, copies the asset files into `packages/app/public/`, and centralises the prefix in a shared `APP_BASE_PREFIX` constant so the next router change cannot regress the same set of references.

## What Changes

- Copy the logo SVGs (`unveiled-logo-black.svg`, `unveiled-logo-white.svg`) and the EKNoticeSans font files (`EKNoticeSans-Black.woff2`, `.woff`, `.otf`) into `packages/app/public/logos/` and `packages/app/public/fonts/` so the Astro dev server (and production build with `base: "/app"`) serves them at `/app/logos/...` and `/app/fonts/...`.
- Update the logo `<img src>` in `packages/app/src/components/unveiled/app-shell.tsx` to `/app/logos/unveiled-logo-${variant}.svg`.
- Update the `@font-face` `src` URLs in `packages/app/src/styles/global.css` to `/app/fonts/EKNoticeSans-Black.{woff2,woff,otf}`.
- Update the hero CTA `href` values in `packages/app/src/components/unveiled/visual-system-app.tsx` (`EXPLORE ACCESS`, `HOW IT WORKS`) to `/app/${selectedLanguage.toLowerCase()}/discover` and `/app/${selectedLanguage.toLowerCase()}/how-it-works`.
- Update the nav view-model `prefix` in `packages/app/src/lib/auth-display.ts` (all four occurrences) to use `APP_BASE_PREFIX` from the new `~/lib/app-base` helper.
- Update the logo home `<a href>` in `packages/app/src/components/unveiled/app-shell.tsx` to `/app/${shell.language.selected.toLowerCase()}/`.
- Update the back-link `<a href>` in `packages/app/src/components/unveiled/PublicDiscover.tsx` to `/app/${selectedLanguage.toLowerCase()}/`.
- Update the client-side navigators in `packages/app/src/components/unveiled/context.tsx` (language switcher, membership, logout) to build URLs with `${APP_BASE_PREFIX}/...` and rewrite the language switcher's path-swap to strip the `/app` base before swapping the lang prefix and re-prepend `/app`.
- Add a shared `packages/app/src/lib/app-base.ts` exporting `APP_BASE_PREFIX = "/app"` and `stripAppBase(pathname: string): string` (strips `/app`, returns `/` for the exact `/app` or `/app/` case, leaves paths without the base unchanged, does not match `/apple`).
- Add unit tests for `stripAppBase` covering `/app/en/discover` → `/en/discover`, `/app` → `/`, `/en/discover` → unchanged, `/app/` → `/`, and `/apple` → unchanged.
- Update the `app-package` and `routing` capability specs with `## MODIFIED Requirements` blocks that codify the `/app/...` prefix on app-owned assets and navigation links.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `app-package`: the app's static assets (logo SVGs, font files) are served from `packages/app/public/` and referenced in the HTML with the `/app/...` prefix. The `@font-face` URLs resolve to `/app/fonts/...`.
- `routing`: all app-owned navigation links (nav items, hero CTAs, logo home link, language switcher, membership, logout, back link) use the canonical `/app/<lang>/...` form. The nav view model in `packages/app/src/lib/auth-display.ts` prepends `APP_BASE_PREFIX` to every `prefix` definition; the client-side navigators in `context.tsx` use the same constant.

## Impact

- **New files:** `packages/app/public/logos/unveiled-logo-black.svg`, `packages/app/public/logos/unveiled-logo-white.svg`, `packages/app/public/fonts/EKNoticeSans-Black.woff2`, `.woff`, `.otf`, `packages/app/src/lib/app-base.ts`, `packages/app/src/lib/app-base.test.ts` (or appended to `middleware.test.ts`).
- **Modified files:**
  - `packages/app/src/components/unveiled/app-shell.tsx` — logo `<img src>` and logo home `<a href>`.
  - `packages/app/src/styles/global.css` — `@font-face` `src` URLs.
  - `packages/app/src/components/unveiled/visual-system-app.tsx` — hero CTA `href` values.
  - `packages/app/src/components/unveiled/PublicDiscover.tsx` — back-link `href`.
  - `packages/app/src/components/unveiled/context.tsx` — language switcher, membership, logout.
  - `packages/app/src/lib/auth-display.ts` — import `APP_BASE_PREFIX`, update all four `prefix` definitions.
  - `openspec/specs/app-package/spec.md` — `## MODIFIED Requirements`.
  - `openspec/specs/routing/spec.md` — `## MODIFIED Requirements`.
- **Removed files:** _none._
- **Dependencies changed:** _none._
- **Risks:**
  - Asset path regressions in production if any reference slips back to the un-prefixed form. Mitigation: Astro's `base: "/app"` rewrite covers built HTML/CSS/JS; the manual verification in the Definition of Done (`curl http://localhost:4320/app/en/ | grep '/app/'`) catches missed references.
  - Cross-package impact on the nav view model: changing the `prefix` value affects every nav item rendered by `auth-display.ts`. Mitigation: existing nav unit tests and the curl verification cover every item; the constant is centralised so a future router move is a one-line change.