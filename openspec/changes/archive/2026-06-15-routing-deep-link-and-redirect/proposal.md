## Why

The 09-iteration catalog flags two `routing`-adjacent rows as P0 and
`pending`: **`deep-link-preservation`** (the middleware drops the
intended destination when it redirects a Guest to `/[lang]/login`) and
**`redirect-after-login-table`** (the per-owner fallback destination
for an authenticated viewer who lands on a route their surface does not
own is hand-rolled in `src/lib/product-routes.ts:54` rather than
declared in a single source of truth). The `routing` capability spec
already references a "redirect-after-login table" in two scenarios
(`openspec/specs/routing/spec.md:73` and `:77`) but does not yet
mandate one. Shipping this umbrella gives the `routing` capability a
canonical, spec-anchored contract for both flows, so every other
10-iteration umbrella that adds a guarded route (e.g. `auth-aria-and-i18n`,
`discover-filters-pagination`) can rely on the same surface-mapping
table and the same deep-link round-trip behavior.

## What Changes

- Add a **deep-link preservation** flow to the middleware: when a Guest
  visits a guarded member / partner / admin route, the middleware
  SHALL append a `?redirect=<safe-relative-path>` (URL-encoded,
  including the language prefix and original query string) to the
  login URL instead of dropping the destination. The login form SHALL
  read that parameter, render the destination as a hidden input, and
  forward the viewer to it after a successful sign-in. The
  destination SHALL be validated against the `productRoutes` table
  before the redirect is issued (open-redirect protection).
- Add a **canonical redirect-after-login table** as a typed
  `redirectAfterLoginFor` function in `src/lib/product-routes.ts`,
  keyed by `ProductRouteOwner × Viewer.kind × Viewer.role`, that
  returns the safe destination for an authenticated viewer who lands
  on a route their surface does not own. The function replaces the
  in-line `redirectForAuthenticatedViewer` branch in
  `product-routes.ts:86` and is the only place those destinations
  are computed.
- Add a typed `parseSafeRedirectTarget(input, viewer)` helper that
  accepts the raw `redirect` query parameter, returns `null` for
  any value that is not a known `productRoutes` path (and for any
  cross-language value), and is the only allowed path for resolving
  a deep-link target. The helper is shared between the login
  island and the middleware so the validation rule lives in one
  place.
- Localize the new copy surfaced by the deep-link preservation flow
  ("You will be redirected to …" preview, "Cancel and go to" link,
  invalid-redirect error message) in DE and EN through
  `src/lib/i18n.ts`. A typed `RoutingCopy` shape enforces DE/EN
  parity at type-check time, and the i18n parity unit test asserts
  full coverage of the new keys.
- Add two new `### Requirement:` blocks under `## ADDED
  Requirements` in the `routing` capability spec — one for
  deep-link preservation, one for the redirect-after-login table —
  that codify the contract above (prohibited selectors,
  locale-prefix preservation, open-redirect protection, typed
  source of truth for the table, mandatory gherkin coverage per
  row).
- Add a `<component>.stories.tsx` story for each absorbed row
  (`DeepLinkPreservation.stories.tsx`, `RedirectAfterLoginTable.stories.tsx`).
  Each story renders a mock surface with mock i18n and mock auth
  state, and carries at least one `@storybook/test` `play`
  interaction test that drives the same flow as the gherkin
  scenario.
- Add a `feature.feature` per absorbed row
  (`tests/features/identity/deep-link-preservation.feature`,
  `tests/features/identity/redirect-after-login-table.feature`)
  with one happy-path scenario and one edge-case scenario, all
  using proximity + layout selectors only.
- The umbrella keeps the per-feature sub-folder format at
  `10-iteration/features/improvements/routing-deep-link-and-redirect/<row-slug>/`
  (one sub-folder per absorbed row) so the per-row Definition of
  Done (gherkin + storybook + tasks + proposal + specs.md) is
  satisfied without losing the per-row coverage.

## Capabilities

### New Capabilities

- _None_ — refactor of the existing `routing` capability.

### Modified Capabilities

- `routing`: 2 absorbed rows add one new `### Requirement:` block
  each (deep-link preservation, redirect-after-login table) under
  `## ADDED Requirements`. The new requirements codify (a) the
  locale-preserving `?redirect=` round-trip on the login challenge,
  (b) the open-redirect protection that validates the target against
  `productRoutes` before issuing the post-login redirect, and
  (c) the typed `redirectAfterLoginFor` table as the single source
  of truth for cross-surface fallbacks.

## Impact

- `src/middleware.ts`: append `?redirect=<safe-relative-path>` to
  the login URL on the Guest-guard branch, and use
  `redirectAfterLoginFor` on the authenticated cross-surface
  branch. The current `resolveMemberOnboardingRoute` call site
  remains the entry point; only the failure-destination
  computation moves into the typed table.
- `src/lib/product-routes.ts`: export `redirectAfterLoginFor`
  (replacing the in-line `redirectForAuthenticatedViewer`) and
  `parseSafeRedirectTarget` (the only validator allowed for the
  `?redirect=` parameter).
- `src/components/unveiled/auth/` (or the current login island
  location): the login form reads the `redirect` query parameter,
  renders a hidden input, and on success calls the typed
  post-login redirect. The post-login redirect uses
  `parseSafeRedirectTarget` to validate the target.
- `src/lib/i18n.ts`: add the `routing.deepLink.*` and
  `routing.redirectAfterLogin.*` bundles in DE and EN; export the
  typed `RoutingCopy` shape.
- `tests/features/identity/deep-link-preservation.feature` (new):
  one happy-path scenario (Guest visits `/[lang]/bookings` →
  login URL carries `?redirect=/en/bookings` → after sign-in the
  viewer lands on `/en/bookings`) and one edge-case scenario
  (Guest visits `/[lang]/admin` with a poisoned `?redirect=`
  already in the URL → middleware still emits the safe target →
  post-login redirect lands on the safe `/[lang]/` landing).
  Uses only proximity + layout selectors.
- `tests/features/identity/redirect-after-login-table.feature`
  (new): one happy-path scenario (Member visits `/[lang]/admin` →
  middleware redirects to the `member`-owner safe destination per
  the table) and one edge-case scenario (Partner visits
  `/[lang]/admin` → table returns the `partner`-owner destination
  per the `Partner × admin` cell). Uses only proximity + layout
  selectors.
- `src/components/unveiled/routing/DeepLinkPreservation.stories.tsx`
  (new) and `src/components/unveiled/routing/RedirectAfterLoginTable.stories.tsx`
  (new): each story carries a `play` interaction test and is
  tagged with `@story(component=…, story=…)` referencing the
  scenario id from `feature.feature`.
- `openspec/specs/routing/spec.md`: add 2 new
  `### Requirement:` blocks under `## ADDED Requirements`
  (one per absorbed row).
- `10-iteration/features/improvements/routing-deep-link-and-redirect/`
  (new): umbrella `proposal.md` + umbrella `tasks.md` + per-row
  `<row-slug>/{proposal.md, tasks.md, feature.feature,
  <component>.stories.tsx, specs.md}` sub-folders.
- Dependencies: none new. Storybook 8.6, `@storybook/test`, and the
  `@story(...)` tag schema are already shipped under
  `openspec/changes/archive/2026-06-14-gherkin-storybook-interaction-tests/`.
