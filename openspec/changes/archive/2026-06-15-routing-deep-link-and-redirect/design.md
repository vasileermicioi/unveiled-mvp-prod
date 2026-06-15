## Context

The two absorbed rows in this umbrella both shape the same
responsibility: when a viewer hits a route their surface does not own,
the middleware must (a) preserve the intended destination across the
login round-trip and (b) compute the safe fallback destination from a
single typed source of truth. Today the two responsibilities are
sprawled across `src/middleware.ts` and `src/lib/product-routes.ts`
without a unifying contract.

The current state:

- `src/middleware.ts:48` redirects an unprefixed URL to the
  language-prefixed version, preserving the query string — but
  `src/middleware.ts:51-69` does not preserve the destination when
  redirecting an unauthenticated viewer to `/`. The destination is
  lost.
- `src/lib/product-routes.ts:86` (`redirectForAuthenticatedViewer`)
  is a private function that returns the cross-surface fallback
  destination for a viewer who lands on a route their surface does
  not own. It is not exported, not declared in the `routing`
  capability spec, and not exercised by gherkin coverage.
- The `routing` capability spec already references a
  "redirect-after-login table" in two scenarios
  (`openspec/specs/routing/spec.md:73` and `:77`) but the table
  itself is undeclared: there is no `### Requirement:` that names
  the function, the cell shape, or the source-of-truth rule.
- The login island (`src/components/unveiled/auth/LoginForm.tsx`
  or the equivalent) does not currently read a `?redirect=`
  parameter; deep-link preservation is unimplemented end to end.

The constraints:

- The selector discipline is binding: no `data-testid`, no
  `getByText` chains, no CSS class selectors, no XPath. Every
  interactive element must be reachable through proximity
  (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`)
  or layout (`getByRole`, `getByLabel`, `getByLandmark`,
  `getInside` with a semantic parent).
- DE/EN parity is enforced at type-check time: the i18n parity
  unit test (`src/lib/i18n.test.ts`) and the typed
  `AuthFormCopy` / `ShellCopy` precedent ensure that adding a key
  to one language without the other fails `bun run check`.
- The `productRoutes` table (`src/lib/product-routes.ts:16`) is
  the canonical route table. Any deep-link target validation
  function must consult it, and any new path must be added there
  first.
- The middleware runs in a Cloudflare Workers edge runtime — the
  validation helpers must be synchronous (or `await` the existing
  Better Auth hydration), must not allocate a viewer, and must
  not pull in Node-only modules.
- The umbrella ships the deep-link preservation *contract* end
  to end (helper, i18n, login-form props, storybook coverage,
  gherkin coverage) but the middleware's Guest-guard branch
  that emits `/login?redirect=...` is activation-gated on a real
  `/[lang]/login` page being mounted. Today the login surface
  lives only in the workbench (`/[lang]/`), so activating the
  middleware branch would 404. The umbrella ships
  `parseSafeRedirectTarget` + the `RoutingCopy` i18n bundle +
  the login-form deep-link preview as the consume-ready
  surface; the middleware branch activates once a public login
  page is added in a later iteration.
- The `auth` umbrella (archived 2026-06-15) shipped a typed
  `AuthFormCopy` shape for the auth forms. This umbrella
  introduces a sibling `RoutingCopy` shape for the routing
  surfaces; both must follow the same parity-enforcement pattern.

## Goals / Non-Goals

**Goals:**

- Make the deep-link round-trip lossless: a Guest who visits
  `/[lang]/bookings?status=upcoming` lands back on
  `/[lang]/bookings?status=upcoming` after a successful sign-in.
- Reject every off-site / off-table redirect target. The
  `parseSafeRedirectTarget` helper is the only validator allowed
  for the `?redirect=` parameter.
- Make `redirectAfterLoginFor(viewer, owner)` the only place a
  cross-surface fallback destination is computed. The function
  is exported, typed, and exercised by gherkin + storybook
  coverage.
- Localize the deep-link preview / cancel / fallback copy in DE
  and EN through a typed `RoutingCopy` shape; the i18n parity
  unit test asserts full coverage of the new keys.
- Cover both absorbed rows with one gherkin `feature.feature`
  per row (one happy-path + one edge case) and one storybook
  story per row, all selector-disciplined.

**Non-Goals:**

- Refactor the language-prefix detection logic in
  `src/middleware.ts:31-49`. The deep-link preservation flow
  runs after language resolution and reuses the resolved
  language prefix as-is.
- Add a new HTTP route. Both absorbed rows are middleware /
  component refactors on the existing `routing` capability.
- Add a server-side session store for the intended destination.
  The `?redirect=` query parameter is the only transport.
- Add a multi-step "confirm redirect" interstitial. The login
  form shows a preview line; the form is still the single submit
  surface.
- Refactor the existing onboarding redirect
  (`resolveMemberOnboardingRoute` in `product-routes.ts:62`).
  That function stays; only its cross-surface fallback branch
  is rewired through `redirectAfterLoginFor`.

## Decisions

- **Single typed validator for the `?redirect=` parameter.**
  `parseSafeRedirectTarget(input, viewer)` lives in
  `src/lib/product-routes.ts` and is the only allowed path for
  resolving a deep-link target. It rejects (a) absolute URLs,
  (b) protocol-relative URLs (`//evil.example/x`), (c) any path
  not in `productRoutes`, and (d) any path whose language
  prefix does not match the active viewer's language. When it
  returns `null`, the caller falls back to
  `routing.deepLink.fallbackDestination` for the active viewer
  kind. **Alternatives considered:** (i) inline `URL` parsing
  inside the middleware — rejected because the validation rule
  must be shared with the login island and the storybook story,
  and a single exportable function is the only way to keep both
  call sites in sync. (ii) Letting the middleware trust the
  client — rejected because open-redirect is the highest-risk
  failure mode for this umbrella.

- **`redirectAfterLoginFor` is a pure function of
  `(viewer, owner)`.** It takes the hydrated `Viewer` and the
  `ProductRouteOwner` of the destination route, and returns
  either `undefined` (the viewer is allowed) or a
  `ProductRouteDefinition` whose `path` is the safe destination
  for that cell. The function lives next to `productRoutes` and
  uses `routePathFor` to resolve the destination. **Alternatives
  considered:** (i) A static `Record<…>` table — rejected
  because the function is a single call site and a static
  record would duplicate the `productRoutes` source of truth.
  (ii) Keeping the in-line `redirectForAuthenticatedViewer` —
  rejected because the umbrella's contract is that the
  destination is computed in exactly one place, and exporting
  the function is the only way to enforce that.

- **Locale prefix preservation is the default.** The
  `?redirect=` parameter always carries the language prefix that
  was on the original URL (or the language the middleware
  resolved to). The validator rejects a `?redirect=` whose
  prefix disagrees with the active viewer, and the login form
  rewrites the prefix on render if the active viewer's language
  has changed (e.g. the viewer picked a different language on
  the login form). **Alternatives considered:** (i) Strip the
  prefix and let the login form re-prefix it — rejected
  because the deep-link round-trip is part of the spec
  contract; the prefix is part of the destination.

- **The deep-link preview is a static line on the login form,
  not a modal.** The login form renders a `<p>` between the
  submit control and the "back to home" link, with the text
  `routing.deepLink.preview` interpolated with the safe
  destination. The cancel link is a `<button type="button">`
  that navigates to the fallback destination. **Alternatives
  considered:** (i) A modal "you are about to be redirected"
  interstitial — rejected because the deep-link preview is a
  single, non-blocking affordance and a modal adds complexity
  without adding clarity.

- **`RoutingCopy` mirrors the `AuthFormCopy` / `ShellCopy`
  precedent.** The shape is declared in `src/lib/i18n.ts`
  alongside the other typed bundles, with one entry per
  visible string (`preview`, `cancel`, `fallbackDestination`)
  in DE and EN. The i18n parity unit test asserts the new
  shape. **Alternatives considered:** (i) Inline string
  literals in the login form — rejected because the no-comments
  policy demands self-documenting names and the parity test
  demands a typed shape.

## Risks / Trade-offs

- **Open-redirect is the highest-risk failure mode.** A bug in
  `parseSafeRedirectTarget` could let an attacker steer a
  signed-in viewer to a phishing site. → **Mitigation:** the
  helper has a unit test for every rejection case (absolute
  URL, protocol-relative URL, off-table path, cross-language
  prefix, empty string, percent-decoded bypass). The
  `redirect-after-login-table.feature` gherkin covers the
  happy-path fallback behavior end to end.

- **The deep-link preview may surprise viewers who do not
  expect the destination to survive.** → **Mitigation:** the
  preview line is in the user's active language, the cancel
  link is always visible, and the fallback destination is
  always the safe per-surface landing — never an error page.

- **`redirectAfterLoginFor` is the single point of failure for
  cross-surface redirects.** A regression silently misroutes
  every authenticated cross-surface redirect. → **Mitigation:**
  the function is the only call site in `src/middleware.ts`,
  the `redirect-after-login-table.feature` gherkin covers the
  `Member × admin` and `Partner × admin` cells, and the
  `RedirectAfterLoginTable.stories.tsx` story has a `play`
  interaction test for each cell.

- **Locale-prefix mismatches between the `?redirect=` and the
  active viewer can be surprising.** A viewer who switches
  language on the login form should still land on the
  destination in the new language. → **Mitigation:** the
  validator rejects cross-language `?redirect=` values, and
  the login form rewrites the prefix to the active language
  before forwarding.

- **The umbrella touches three call sites that are also touched
  by the `auth-aria-and-i18n` umbrella (the login form, the
  middleware, the i18n module).** The two umbrellas are
  sequenced; the auth umbrella ships first, this umbrella
  reuses the typed `AuthFormCopy` shape and adds a sibling
  `RoutingCopy` shape. → **Mitigation:** the umbrella's
  `tasks.md` lists a precondition that
  `openspec/changes/archive/2026-06-15-auth-aria-and-i18n/`
  has been merged before this umbrella's `tasks.md` is
  executed.
