## Context

The `routing-orchestrator` change archived on `2026-06-22` moved the Astro app under `/app/*` (the orchestrator dispatches `/app/*` → app, `/api/*` → API, `/*` → landing, `/healthz` + `/readyz` → orchestrator). The Astro `base: "/app"` config rewrites the *build output* (every `<link>`, `<script>`, and Astro-managed asset reference) under `/app/...`, but it does not retroactively fix hand-written asset references inside the React island source. Manual testing (per `opencode-error-prompt.txt`) surfaced seven classes of un-prefixed references inside `packages/app/src/`:

1. Logo `<img src>` in `app-shell.tsx` — `/logos/...` instead of `/app/logos/...`.
2. `@font-face src` URLs in `global.css` — `/fonts/...` instead of `/app/fonts/...`.
3. Hero CTA `href` values in `visual-system-app.tsx` — `/<lang>/discover` and `/<lang>/how-it-works` instead of `/app/<lang>/...`.
4. Nav `prefix` in `auth-display.ts` — `/${language.toLowerCase()}` instead of `${APP_BASE_PREFIX}/${language.toLowerCase()}`.
5. Logo home `<a href>` in `app-shell.tsx` and back link in `PublicDiscover.tsx` — `/<lang>/` instead of `/app/<lang>/`.
6. Client-side language switcher, membership, logout in `context.tsx` — all build URLs without `/app`.
7. The asset files (logo SVGs, EKNoticeSans font files) live in `dist/client/logos/` and `dist/client/fonts/` but the app's `packages/app/public/` is empty, so the Astro dev server returns 404 for `/app/logos/...` and `/app/fonts/...`.

This change rewrites every app-owned asset and link to use the canonical `/app/...` form, copies the asset files into `packages/app/public/`, and centralises the prefix in a single `APP_BASE_PREFIX` constant so the next router change cannot regress the same set of references.

## Goals / Non-Goals

**Goals:**

- Every app-owned asset (`<img src>`, `@font-face src`) renders under the `/app/...` URL prefix in both dev (`http://localhost:4321/app/...`) and production (`http://unveiled.app/app/...`).
- Every app-owned navigation link (nav items, hero CTAs, logo home, back link, language switcher, membership, logout) uses the canonical `/app/<lang>/...` form.
- The `/app` base is a single source of truth: one exported constant (`APP_BASE_PREFIX`) plus one `stripAppBase` helper, both in `packages/app/src/lib/app-base.ts`.
- The asset files (logo SVGs, font files) live in `packages/app/public/` so the Astro dev server (and the production build) serves them at `/app/logos/...` and `/app/fonts/...` without manual configuration.

**Non-Goals:**

- Changing the orchestrator's dispatch contract (`/app/*` → app, `/api/*` → API, `/*` → landing) — that contract is owned by the `routing-orchestrator` change.
- Changing the Astro `base: "/app"` config — it already does the right thing for build-output rewrites; this change fixes only the hand-written references that bypass it.
- Adding a new landing or API surface — out of scope.
- Refactoring the nav view model shape (`packages/app/src/lib/auth-display.ts` returns the same nav items; only the `prefix` value changes).

## Decisions

### Single `APP_BASE_PREFIX` constant in `packages/app/src/lib/app-base.ts`

The prefix is centralised so the next router change is a one-line edit. The constant lives at `packages/app/src/lib/app-base.ts` because:

- It is consumed by the app-side nav view model (`auth-display.ts`), the app shell (`app-shell.tsx`), the global stylesheet (`global.css`), the discover back link (`PublicDiscover.tsx`), the hero CTA (`visual-system-app.tsx`), and the client-side navigator (`context.tsx`) — all under `packages/app/src/`.
- It is co-located with `stripAppBase`, which is the only utility that needs to know how to undo the prefix (for the client-side language switcher).

Alternatives considered:

- **Reading the prefix from `import.meta.env.BASE_URL`.** Astro exposes the configured base at build time, but reading it inside a React island at runtime requires the island to import Astro internals, which is fragile across the SSR/hydration boundary. A plain constant is simpler and matches the repo's "no magic globals" convention.
- **Hoisting `APP_BASE_PREFIX` into `@unveiled/design-system` or `@unveiled/api`.** Rejected: the prefix is an app-package concern (the landing package lives at `/`, the API package lives at `/api/*`; only the app is mounted at `/app/*`). Hoisting it would force the landing and API packages to depend on a constant they never use.

### `stripAppBase` is a pure, deterministic helper

The language switcher in `context.tsx` needs to strip `/app` from the current path, swap the language prefix, and re-prepend `/app`. A pure helper is preferable to inlining the path-rewrite logic because:

- The edge cases (`/app` → `/`, `/app/` → `/`, `/apple` → `/apple`, `/en/discover` → unchanged) are easy to regress if the logic is inlined.
- The unit tests in `packages/app/src/lib/app-base.test.ts` lock the edge cases into the contract.

The helper returns `pathname` unchanged when the path does not begin with `/app` and handles the exact `/app` and `/app/` cases by returning `/`. The `/apple` edge case is covered by a leading-slash boundary check (`pathname === "/app" || pathname.startsWith("/app/")`).

### Assets live in `packages/app/public/`

The Astro dev server (and the production build, with `base: "/app"`) serves files in `public/` under the configured base path automatically. Putting the logo SVGs and the EKNoticeSans font files under `packages/app/public/logos/` and `packages/app/public/fonts/` means:

- Dev: `curl http://localhost:4321/app/logos/unveiled-logo-black.svg` returns the file.
- Production: the same files are emitted into the build's `dist/client/` and are served by the Cloudflare Worker via the orchestrator's `ASSETS` binding.

The source files are copied from the existing `dist/client/logos/` and `dist/client/fonts/` locations (the orchestrator's top-level static assets in production). The repo commits the copies into `packages/app/public/` so a clean checkout (`bun install && bun run dev`) boots with the assets in place.

### No change to the Astro `base: "/app"` config

The existing config handles every Astro-managed asset rewrite correctly. The regressions are hand-written references inside React islands and the global CSS — places the `base` rewrite cannot reach. No config change is needed; only source-level edits.

### Updated files (per the proposal's Impact section)

- `packages/app/src/components/unveiled/app-shell.tsx` — logo `<img src>` and logo home `<a href>`.
- `packages/app/src/styles/global.css` — `@font-face` `src` URLs.
- `packages/app/src/components/unveiled/visual-system-app.tsx` — hero CTA `href` values.
- `packages/app/src/components/unveiled/PublicDiscover.tsx` — back-link `href`.
- `packages/app/src/components/unveiled/context.tsx` — language switcher, membership, logout.
- `packages/app/src/lib/auth-display.ts` — import `APP_BASE_PREFIX`, update all four `prefix` definitions.

### New files

- `packages/app/public/logos/unveiled-logo-black.svg`, `unveiled-logo-white.svg`.
- `packages/app/public/fonts/EKNoticeSans-Black.woff2`, `.woff`, `.otf`.
- `packages/app/src/lib/app-base.ts` — exports `APP_BASE_PREFIX` and `stripAppBase`.
- `packages/app/src/lib/app-base.test.ts` — locks `stripAppBase` edge cases.

## Risks / Trade-offs

- **Asset path regressions in production.** If any reference slips back to the un-prefixed form, the production build will silently 404. Mitigation: Astro's `base: "/app"` rewrite covers the build output; the manual verification in the Definition of Done (`curl http://localhost:4320/app/en/ | grep '/app/'`) catches missed hand-written references; the `bun run check` umbrella catches type errors. The `APP_BASE_PREFIX` constant is the only place `/app` is hardcoded, so a missed reference would have to be a string literal — easy to grep for in review.
- **Cross-package impact on the nav view model.** Changing the `prefix` value affects every nav item rendered by `auth-display.ts` (the `discover`, `how`, `membership`, `faq`, `member`, `saved`, `bookings`, `profile`, `partner`, `admin` items). Mitigation: existing nav unit tests cover the nav rendering; the constant is centralised so a future router move is a one-line change.
- **Font fallback in dev if `packages/app/public/fonts/` is missing.** The current `@font-face src` URLs already 404 in dev (the fonts only exist in `dist/client/fonts/`). This change copies them into `packages/app/public/fonts/`, so dev and production agree on the served path. Mitigation: a `bun install` after merge will populate the directory; the new asset files are committed alongside the source edits so a clean checkout works without a build step.
- **`stripAppBase` regressions in the language switcher.** The helper's edge cases (`/app` → `/`, `/app/` → `/`, `/apple` → unchanged, no-base → unchanged) are the kind of bug that only surfaces when a user actually navigates through the language switcher. Mitigation: the `app-base.test.ts` unit tests lock all five documented cases; the gherkin scenario in the `routing` spec exercises the swap end-to-end.

## Migration Plan

This change is purely additive at the source level (new constants, new files in `public/`, string-literal swaps to use the constant). No data migration, no schema change, no deploy coordination is required. The deploy order is unchanged (api → app → landing → orchestrator). Rollback is a `git revert` of the change; the worst-case visible regression is the prior 404s on `/logos/...` and `/fonts/...`, which is the current production state.

## Open Questions

_None._ All seven references identified in `opencode-error-prompt.txt` are scoped, and the `APP_BASE_PREFIX` constant resolves the next-router-change question by centralising the prefix.