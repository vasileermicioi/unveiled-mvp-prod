## 1. Place Asset Files In `packages/app/public/`

- [x] 1.1 Copy `unveiled-logo-black.svg` and `unveiled-logo-white.svg` into `packages/app/public/logos/` from the existing `dist/client/logos/` location.
- [x] 1.2 Copy `EKNoticeSans-Black.woff2`, `EKNoticeSans-Black.woff`, and `EKNoticeSans-Black.otf` into `packages/app/public/fonts/` from the existing `dist/client/fonts/` location.
- [x] 1.3 Verify the dev server serves the assets at `http://localhost:4321/app/logos/unveiled-logo-black.svg` and `http://localhost:4321/app/fonts/EKNoticeSans-Black.woff2` (`curl -I` returns 200).

## 2. Add Shared `app-base` Helper

- [x] 2.1 Create `packages/app/src/lib/app-base.ts` exporting `APP_BASE_PREFIX = "/app"` and `stripAppBase(pathname: string): string`.
- [x] 2.2 `stripAppBase` returns `/` for the exact `/app` and `/app/` cases, returns the path with `/app` stripped for `/app/...` cases, and returns the input unchanged for paths without the base (including `/apple`).
- [x] 2.3 Create `packages/app/src/lib/app-base.test.ts` with the five documented edge cases: `stripAppBase("/app/en/discover")` → `/en/discover`, `stripAppBase("/app")` → `/`, `stripAppBase("/en/discover")` → unchanged, `stripAppBase("/app/")` → `/`, `stripAppBase("/apple")` → unchanged.

## 3. Update Static Asset References

- [x] 3.1 Update the logo `<img src>` in `packages/app/src/components/unveiled/app-shell.tsx` to `/app/logos/unveiled-logo-${variant}.svg`.
- [x] 3.2 Update the `@font-face src` URLs in `packages/app/src/styles/global.css` to `/app/fonts/EKNoticeSans-Black.{woff2,woff,otf}`.

## 4. Update Navigation Links

- [x] 4.1 Update the hero CTA `href` values in `packages/app/src/components/unveiled/visual-system-app.tsx` to `/app/${selectedLanguage.toLowerCase()}/discover` and `/app/${selectedLanguage.toLowerCase()}/how-it-works`.
- [x] 4.2 Update the logo home `<a href>` in `packages/app/src/components/unveiled/app-shell.tsx` to `/app/${shell.language.selected.toLowerCase()}/`.
- [x] 4.3 Update the back-link `<a href>` in `packages/app/src/components/unveiled/PublicDiscover.tsx` to `/app/${selectedLanguage.toLowerCase()}/`.

## 5. Update Nav View Model

- [x] 5.1 Import `APP_BASE_PREFIX` from `~/lib/app-base` in `packages/app/src/lib/auth-display.ts`.
- [x] 5.2 Update all four `prefix` definitions (lines 24, 59, 99, 120) from `/${language.toLowerCase()}` to `${APP_BASE_PREFIX}/${language.toLowerCase()}`.

## 6. Update Client-Side Navigators

- [x] 6.1 Update the language switcher in `packages/app/src/components/unveiled/context.tsx` to use `APP_BASE_PREFIX` for the destination path; use `stripAppBase` to remove the existing `/app` base before swapping the lang prefix, then re-prepend `APP_BASE_PREFIX`.
- [x] 6.2 Update the membership handler in `context.tsx` to navigate to `${APP_BASE_PREFIX}/${language}/membership`.
- [x] 6.3 Update the logout handler in `context.tsx` to navigate to `${APP_BASE_PREFIX}/${language}/` before issuing the `/api/auth/sign-out` call.

## 7. Verify

- [x] 7.1 `bun --filter @unveiled/app test src/lib/app-base.test.ts` passes.
- [x] 7.2 `bun run check` passes (umbrella: `astro check` + `biome check .` + `bun run specs:check` + `bun run tokens:check` + `bun run ladle:coverage` + `bun run wrangler:check` + `bun run arch:check`).
- [x] 7.3 `curl http://localhost:4320/app/en/ | grep '/app/logos/'` returns the logo `<img src>` line.
- [x] 7.4 `curl http://localhost:4320/app/en/ | grep '/app/fonts/'` returns the served CSS link for the font.
- [x] 7.5 `curl http://localhost:4320/app/en/ | grep '/app/en/discover'` returns the hero CTA `<a href>`.
- [x] 7.6 `curl http://localhost:4320/app/en/ | grep '/app/en/'` returns at least one nav item per category (discover, how, membership, faq, member, saved, bookings, profile, partner, admin).
- [x] 7.7 `openspec validate app-asset-paths-and-links` passes.