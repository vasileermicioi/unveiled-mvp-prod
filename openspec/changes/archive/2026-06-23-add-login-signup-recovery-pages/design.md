## Context

The `routing` capability spec already declares `/app/<lang>/login` and
`/app/<lang>/signup` as public routes that resolve under
`/app/<lang>/...` (`openspec/specs/routing/spec.md:46`), and the
`Deep-Link Preservation On Login Challenge` requirement mandates that a
Guest visiting a guarded route be redirected to
`/app/<lang>/login?redirect=<safe-relative-path>` so the intended
destination survives the sign-in round-trip (`routing/spec.md:178`).
That branch was explicitly gated on "when a real `/app/<lang>/login`
page is mounted" — until the page exists, the contract was only
exercised by the `parseSafeRedirectTarget` unit test and the login-form
deep-link preview Ladle story.

The 2026-06-22-routing-orchestrator change did not create the pages; the
login form lived inside the `VisualSystemApp` landing view at
`/app/<lang>/`, and guests visiting a guarded route were redirected to
the bare landing, dropping the destination. Manual testing at
`http://127.0.0.1:4320/app/en/admin` confirmed that the deep-link
preservation middleware branch was active (it emits a `302` with the
`?redirect=%2Fadmin` query string per `packages/app/src/middleware.ts:80-89`),
but no dedicated page rendered — `/app/en/login` was a 404 because no
Astro page owned the route.

This change closes the loop: three dedicated Astro pages
(`login.astro`, `signup.astro`, `recovery.astro`) make the public auth
routes reachable, `VisualSystemApp` accepts an `initialMode` prop so the
dedicated pages pre-select the right form tab, and the deep-link
preservation scenario moves from "activation-gated" to the canonical
contract.

## Goals / Non-Goals

**Goals:**

- Create dedicated Astro pages for `/app/<lang>/login`,
  `/app/<lang>/signup`, and `/app/<lang>/recovery` so the public auth
  routes named in the route table render under the app surface.
- Extend `VisualSystemApp` (and the embedded `LandingPage`) to accept
  an `initialMode` prop so the dedicated pages pre-select the right
  form tab (`login`, `signup`, or `recovery`).
- Confirm and test the deep-link preservation middleware branch in
  `packages/app/src/middleware.ts:80-89`: a Guest visiting any guarded
  route is redirected to
  `/app/<lang>/login?redirect=<encoded-post-lang-path>` with status
  `302`; the login page validates the redirect through
  `parseSafeRedirectTarget` and forwards the viewer to the safe
  destination after sign-in.
- Add e2e gherkin coverage that asserts the redirect chain
  end-to-end (Guest → guarded route → login page → safe callback).
- Lift the "activation-gated" qualifier on the deep-link preservation
  scenarios in the `routing` capability spec.

**Non-Goals:**

- No new auth provider, no new auth flow. The pages reuse the existing
  `LandingPage` form (`packages/app/src/components/unveiled/visual-system-app.tsx:56`),
  the existing endpoints (`/api/account/login`, `/api/account/signup`,
  `/api/account/password-recovery`), and the existing
  `parseSafeRedirectTarget` validator
  (`packages/app/src/lib/product-routes.ts:116`).
- No changes to the route table content beyond listing the three
  public auth routes (the route table already lists `login` and
  `signup`; `recovery` is added).
- No changes to the language resolution, the `/api/*` short-circuit,
  or the orchestrator dispatch contract — those are owned by earlier
  changes (`routing-orchestrator`, `mount-api-at-api-prefix`).
- No new copy bundle; the `i18n.routing.deepLink.*` and
  `i18n.auth.*` bundles already cover the deep-link preview and the
  form labels.

## Decisions

### Decision 1: Reuse `VisualSystemApp` + `LandingPage` instead of a dedicated auth component

The auth form already lives inside the `LandingPage` component
(`packages/app/src/components/unveiled/visual-system-app.tsx:56-159`)
with a `mode` state machine (`"login" | "signup" | "recovery"`), the
matching Zod schemas (`loginSchema`, `signupSchema`,
`passwordRecoverySchema`), and the matching endpoints. Extracting a
dedicated `<AuthForm />` would duplicate the form, the validation, and
the deep-link-preview copy.

**Alternative considered:** introduce a dedicated `<AuthForm />`
component imported by all three pages. Rejected because the existing
form already does the right thing for every mode and the only
difference is the initial state and the page title — both are simple
props.

### Decision 2: Use the post-lang path form for the `?redirect=` value

The middleware encodes `postLangPath` (e.g. `/admin`, `/partner`,
`/bookings`) — not the full `/app/<lang>/...` form — for the
`?redirect=` query parameter. The compact form keeps the URL short,
avoids redundant prefixing (the lang is already in the URL), and lets
`parseSafeRedirectTarget` resolve the path against `productRoutes`
without ambiguity (`product-routes.ts:39` strips any leading
`/de|/en` before `routeForPath`, so both forms resolve to the same
route definition).

**Alternative considered:** encode the full `/app/<lang>/...` form
(e.g. `/app/en/admin`). Rejected because it duplicates the lang prefix
in every deep-link URL and makes the URL longer without changing the
validator's behavior. The current `parseSafeRedirectTarget` already
accepts both forms.

### Decision 3: `initialMode` prop default is `"login"`

The default is `"login"` because `/app/<lang>/` (the bare landing)
still renders the auth form for the most common case (a Guest who
needs to sign in). The dedicated pages opt into `signup` or
`recovery` explicitly.

**Alternative considered:** default to `"recovery"` so the form starts
on the password-recovery tab. Rejected because that would regress the
landing page for the common sign-in case.

### Decision 4: Pages do not add new routes to `productRoutes`

`/login`, `/signup`, and `/recovery` are public-owner routes that
resolve under `/app/<lang>/...`, but they do not need to be in the
`productRoutes` table (which is keyed by `ShellNavItemId` and used for
the navbar active-state derivation). The navbar already does not have
nav items for these pages; they are reached through the language toggle
and the post-login redirect only. Adding them to the table would force
the navbar to render them as nav items, which is not the desired UX.

**Alternative considered:** add `login`, `signup`, `recovery` as
public-owner entries in `productRoutes`. Rejected because the navbar
does not need to surface them (they are reached through the navbar's
"Sign in" / "Become a member" controls, which already navigate to
`/app/<lang>/login` and `/app/<lang>/signup` via direct URL).

### Decision 5: Deep-link preservation scenario is now canonical, not activation-gated

The original spec language ("while the deep-link preservation middleware
branch is active (a public `/app/<lang>/login` page exists)") is
lifted — the page now exists, so the branch is the canonical entry
path. The scenario body is unchanged; only the activation-gated
qualifier is removed.

## Risks / Trade-offs

- **Redirect loop** — A naive redirect could loop if `/app/en/login`
  is treated as a guarded route. Mitigation: `middleware.ts:58-60`
  falls through to `next()` when `routeForPath(internalPath)` returns
  `undefined`, which is exactly the case for `/en/login`,
  `/en/signup`, and `/en/recovery` (they are not in `productRoutes`).
- **`parseSafeRedirectTarget` rejects valid post-lang paths** — The
  helper accepts both `/admin` (post-lang) and `/en/admin` (full) forms
  by stripping any leading `/de|/en` before `routeForPath`. Verified
  by reading `product-routes.ts:116-147`.
- **Tests cannot run without a live dev proxy** — Per `AGENTS.md` §8,
  the Definition of Done requires the orchestrator dev proxy to be
  running on port 4320 for the e2e suite to assert the redirect chain.
  The task list pins `PLAYWRIGHT_BASE_URL=http://localhost:4320/` and
  runs the gherkin via `bun run test:e2e` so the suite fails loudly if
  the proxy is down.
- **Mode state lost across navigations** — When the user navigates
  from `/app/<lang>/login` to `/app/<lang>/signup` via the navbar
  "Become a member" link, the `LandingPage` re-mounts with the new
  `initialMode` so the correct tab is active without a click. No
  state needs to be preserved across pages.

## Migration Plan

- The three pages and the `initialMode` prop are additive — no
  existing routes, props, or tests change behavior.
- The deep-link preservation middleware branch already emits the
  correct `?redirect=%2Fadmin` redirect; the change only confirms it
  is active and adds gherkin coverage.
- The `routing` and `app-shell` capability specs receive `## MODIFIED
  Requirements` / `## ADDED Requirements` blocks. After the change is
  archived, the spec blocks fold into `openspec/specs/routing/spec.md`
  and `openspec/specs/app-shell/spec.md`.
- Deploy order: `api` → `app` → `landing` → `orchestrator` (per
  `AGENTS.md` §7 `bun run deploy:cloudflare`). The auth pages live in
  the `app` package; no orchestrator or landing changes are needed.

## Open Questions

- Should the dedicated signup page set `viewer.kind = "guest"` with
  `?intent=signup` so the landing copy ("Already a member? Sign in")
  is mirrored on the signup surface? The current `signup.astro` does
  not pass an `intent` query parameter, so the LandingPage renders the
  default `copy.auth.defaultMessage`. The DE/EN copy parity test
  covers the default message; the intent-specific copy is out of scope
  for this change.
- Should the recovery page redirect authenticated viewers to the
  per-surface safe destination? The current `recovery.astro` renders
  the recovery form regardless of viewer kind. The deeper UX
  decision (redirect logged-in users away from the recovery page)
  belongs to a separate auth-flow change.