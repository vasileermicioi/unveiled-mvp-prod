## Why

The `routing` capability spec (`openspec/specs/routing/spec.md:178`) declares
the deep-link preservation contract — a Guest who visits a guarded member,
partner, or admin route SHALL be redirected to
`/app/<lang>/login?redirect=<safe-relative-path>` — and gates that branch
behind "when a real `/app/<lang>/login` page is mounted". The
`2026-06-22-routing-orchestrator` change did not create those pages: the
login form lived inside the `VisualSystemApp` landing view at
`/app/<lang>/`, and guests visiting a guarded route were redirected to the
bare landing (`/app/<lang>/`), dropping the destination. The open redirect
contract was only exercised by the `parseSafeRedirectTarget` unit test.

This change creates the three dedicated public auth pages
(`/app/<lang>/login`, `/app/<lang>/signup`, `/app/<lang>/recovery`) and
activates the deep-link preservation middleware so a guest hitting
`/app/en/admin` is redirected to
`/app/en/login?redirect=%2Fadmin` (and the post-login redirect lands on
the validated destination). It also extends the `VisualSystemApp` to
accept an `initialMode` prop so the dedicated pages pre-select the right
form tab (`login` / `signup` / `recovery`).

## What Changes

- Add three dedicated Astro pages under the app surface so the public
  auth routes named in the route table actually render:
  - `packages/app/src/pages/[lang]/login.astro` — frontmatter reads the
    `lang` param, resolves the viewer via `getViewer`, parses the
    `redirect` query parameter through `parseSafeRedirectTarget`,
    builds a safe `callbackURL`, and renders `VisualSystemApp` with
    `initialView="landing"` and `initialMode="login"`.
  - `packages/app/src/pages/[lang]/signup.astro` — same pattern with
    `title="Sign up | Unveiled"` and `initialMode="signup"`.
  - `packages/app/src/pages/[lang]/recovery.astro` — same pattern with
    `title="Password recovery | Unveiled"` and `initialMode="recovery"`.
- Extend `packages/app/src/components/unveiled/visual-system-app.tsx` so
  `LandingPage` accepts an `initialMode?: "login" | "signup" | "recovery"`
  prop (default `"login"`) that initializes the local `mode` state, and
  forward it through `VisualSystemApp`'s props.
- Activate the deep-link preservation middleware in
  `packages/app/src/middleware.ts`: when the route table flags the
  current path as member / partner / admin AND the viewer is a Guest,
  redirect to `${APP_BASE_PREFIX}${langPrefix}/login?redirect=${encodeURIComponent(`${postLangPath}${url.search}`)}`
  with status `302`. The `redirect=` value preserves the original query
  string. The login page passes the safe-validated `callbackURL` to the
  auth form so the post-login redirect lands on the validated
  destination (or the per-surface fallback when the target is rejected
  by `parseSafeRedirectTarget`).
- Add e2e gherkin coverage under
  `tests/features/identity/deep-link-preservation.feature` (with a
  co-located `<component>.ladle.tsx` Ladle harness) asserting:
  - a Guest visiting `/app/<lang>/admin`, `/app/<lang>/partner`, or
    `/app/<lang>/bookings` is redirected to
    `/app/<lang>/login?redirect=<encoded-post-lang-path>` with status
    `302`;
  - the query string is preserved across the redirect
    (`/app/<lang>/admin?tab=metrics` →
    `/app/<lang>/login?redirect=%2Fadmin%3Ftab%3Dmetrics`);
  - `/app/<lang>/login` and `/app/<lang>/login?redirect=%2Fadmin` render
    the login form (response `200`);
  - the open-redirect target `https://evil.example/x` is rejected by
    `parseSafeRedirectTarget` and the form falls back to the safe
    per-surface destination.
- Update the `routing` capability spec with a `## MODIFIED Requirements`
  block: the deep-link preservation scenarios are no longer
  activation-gated; the public auth pages exist and the middleware
  branch is the canonical entry path.
- Update the `app-shell` capability spec with a `## MODIFIED
  Requirements` block: the `VisualSystemApp` accepts `initialMode` so
  the dedicated auth pages pre-select the correct form tab.

## Capabilities

### New Capabilities

_None._ The three pages implement the public auth routes already
declared in the `routing` capability's route table.

### Modified Capabilities

- `routing`: the deep-link preservation middleware branch is active
  (no longer "activation-gated"). A Guest visiting a guarded member,
  partner, or admin route is redirected to
  `/app/<lang>/login?redirect=<safe-relative-path>` (URL-encoded, query
  string preserved). The dedicated `/app/<lang>/signup` and
  `/app/<lang>/recovery` pages are listed in the route table as
  public-owner routes that resolve under `/app/<lang>/...`.
- `app-shell`: the `VisualSystemApp` (and the embedded `LandingPage`)
  accept an `initialMode` prop so the dedicated auth pages pre-select
  the right form tab.

## Impact

- **New files:**
  - `packages/app/src/pages/[lang]/login.astro`
  - `packages/app/src/pages/[lang]/signup.astro`
  - `packages/app/src/pages/[lang]/recovery.astro`
  - `tests/features/identity/deep-link-preservation.ladle.tsx`
    (Ladle harness co-located with the existing feature file).
- **Modified files:**
  - `packages/app/src/components/unveiled/visual-system-app.tsx` —
    add `initialMode` prop to `LandingPage` (and forward it through
    `VisualSystemApp`'s props).
  - `packages/app/src/middleware.ts` — deep-link preservation redirect
    is the canonical branch for the Guest × guarded-route cell (already
    in place per `middleware.ts:80-89`; this change confirms and tests
    it).
  - `openspec/specs/routing/spec.md` — `## MODIFIED Requirements`
    block lifting the activation-gated qualifier on the deep-link
    preservation scenarios and adding the public `signup` / `recovery`
    routes to the route-table scenario.
  - `openspec/specs/app-shell/spec.md` — `## MODIFIED Requirements`
    block adding `initialMode` to the `VisualSystemApp` contract.
- **Removed files:** _none._
- **Dependencies changed:** _none._
- **Risks:**
  - **Redirect loop.** A naive redirect could create a loop
    (`/app/en/login?redirect=/admin` → middleware sees the path as not
    requiring auth → no redirect). Mitigation: the middleware only
    runs the deep-link redirect for routes that match a non-public
    `productRoutes` entry. `/login`, `/signup`, `/recovery` resolve to
    `routeForPath` returning `undefined`, so `middleware.ts:58-60` falls
    through to `next()` and the page renders.
  - **`parseSafeRedirectTarget` rejects valid post-lang redirects.**
    The middleware encodes `postLangPath` (e.g. `/admin`, not
    `/en/admin`). The helper (`product-routes.ts:134-143`) strips any
    leading `/de|/en` before `routeForPath`, so both forms resolve to
    the same route definition. Verified by reading the helper.
  - **Auth form state across mode switches.** The `LandingPage`
    component manages `mode` state internally. When the user
    navigates between dedicated pages (e.g. via the navbar "Sign up"
    link), the new `initialMode` prop re-initializes the form so the
    correct tab is active without a click.
  - **Tests currently fail on a not-yet-mounted dev proxy.** Per
    `AGENTS.md` §8 the Definition of Done requires
    `GET /app/en/login` → `200`. The page exists and renders, but a
    full e2e run requires `bun run dev` to be running. The task list
    pins the gherkin suite to `PLAYWRIGHT_BASE_URL=http://localhost:4320/`
    so it fails loudly if the proxy is not up.

## Definition of Done

- [ ] `packages/app/src/pages/[lang]/login.astro`,
      `signup.astro`, `recovery.astro` exist and render.
- [ ] `VisualSystemApp` accepts an `initialMode` prop and forwards it
      to `LandingPage`'s mode state.
- [ ] `parseSafeRedirectTarget` accepts the post-lang path form
      (`/admin`) that the middleware emits.
- [ ] `curl -sI http://localhost:4320/app/en/login` → `200 OK`.
- [ ] `curl -sI http://localhost:4320/app/en/admin` → `302` with
      `Location: /app/en/login?redirect=%2Fadmin`.
- [ ] `PLAYWRIGHT_BASE_URL=http://localhost:4320/ bunx playwright test
      --project=real-route tests/parity/gherkin.spec.ts --grep
      "deep-link|login"` reports the new scenarios passing.
- [ ] `bun run check` passes locally.
- [ ] `openspec validate add-login-signup-recovery-pages` passes.