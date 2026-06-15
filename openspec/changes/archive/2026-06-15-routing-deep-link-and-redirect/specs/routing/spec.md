## ADDED Requirements

### Requirement: Deep-Link Preservation On Login Challenge
The routing spec SHALL guarantee that a Guest who visits a guarded member, partner, or admin route is redirected to `/[lang]/login?redirect=<safe-relative-path>` (with `<safe-relative-path>` URL-encoded, including the language prefix and original query string) so the intended destination survives the sign-in round-trip, and the login form SHALL forward the viewer to that destination after a successful sign-in once the target has been validated against the canonical route table. The middleware branch that emits the deep-link redirect SHALL be activated when a real `/[lang]/login` page is mounted; until then the contract is exercised by the `parseSafeRedirectTarget` unit test and the login-form deep-link preview story.

#### Scenario: Guest visits a member route and the destination survives the login challenge
- **WHEN** a Guest visits `/[lang]/bookings` while not authenticated and the deep-link preservation middleware branch is active (a public `/[lang]/login` page exists)
- **THEN** the middleware issues a 302 to `/[lang]/login?redirect=%2F<lang>%2Fbookings` (the destination is preserved and URL-encoded)
- **AND** the destination is rendered on the login form as a hidden input

#### Scenario: Guest visits a member route with a query string and the query string survives the login challenge
- **WHEN** a Guest visits `/[lang]/bookings?status=upcoming` while not authenticated and the deep-link preservation middleware branch is active
- **THEN** the middleware issues a 302 to `/[lang]/login?redirect=%2F<lang>%2Fbookings%3Fstatus%3Dupcoming` (the query string is preserved and URL-encoded)
- **AND** after a successful sign-in the viewer lands on `/[lang]/bookings?status=upcoming`

#### Scenario: Deep-link target is validated against the canonical route table
- **WHEN** the login form receives a `?redirect=` value
- **THEN** the value is passed through `parseSafeRedirectTarget` which returns `null` for any value that is not a known `productRoutes` path (and for any cross-language value)
- **AND** when the helper returns `null` the form falls back to the `routing.deepLink.fallbackDestination` for the active viewer kind
- **AND** no open-redirect target (off-site URL, foreign host, protocol-relative URL, double-slash path) is ever issued by the post-login redirect

#### Scenario: Open-redirect attempts are rejected
- **WHEN** the `?redirect=` value is `https://evil.example/x`, `//evil.example/x`, or any value not present in `productRoutes`
- **THEN** `parseSafeRedirectTarget` returns `null`
- **AND** the post-login redirect lands on the safe fallback destination for the active viewer kind
- **AND** no off-site navigation is ever issued

#### Scenario: Deep-link copy is localized in DE and EN
- **WHEN** the login form renders the deep-link preview
- **THEN** the preview string is read from `i18n.routing.deepLink.preview` and the cancel-link string is read from `i18n.routing.deepLink.cancel`
- **AND** the typed `RoutingCopy` shape in `src/lib/i18n.ts` enforces DE/EN parity at type-check time
- **AND** the i18n parity unit test asserts full coverage of the new keys

#### Scenario: Deep-link preservation is gherkin-disciplined
- **WHEN** a contributor reads `tests/features/identity/deep-link-preservation.feature`
- **THEN** at least one happy-path scenario asserts the destination survives the round-trip (driving the login form directly with a `?redirect=` parameter, since the middleware branch is activation-gated on a public login page)
- **AND** at least one edge-case scenario asserts the open-redirect rejection behavior
- **AND** every step uses only proximity + layout selectors (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`, `getByRole`, `getByLabel`, `getInside`)

### Requirement: Canonical Redirect-After-Login Table
The routing spec SHALL declare a single typed source of truth, `redirectAfterLoginFor(viewer, owner)`, that returns the safe destination for an authenticated viewer who lands on a route their surface does not own, and every cross-surface redirect in the middleware SHALL be routed through that function.

#### Scenario: The function is the only place cross-surface destinations are computed
- **WHEN** a contributor reads `src/middleware.ts`
- **THEN** the only call site that returns a cross-surface fallback destination is `redirectAfterLoginFor(viewer, owner)`
- **AND** no inline string literal under `src/middleware.ts` names a fallback destination for a `member`, `partner`, or `admin` route

#### Scenario: Member visiting an admin route lands on the member safe destination
- **WHEN** a Member (`role: USER`) visits `/[lang]/admin`
- **THEN** the middleware calls `redirectAfterLoginFor(viewer, "admin")`
- **AND** the returned destination is the `member`-owner safe route for the active viewer (per the table)
- **AND** the request is redirected with status 302

#### Scenario: Partner visiting an admin route lands on the partner safe destination
- **WHEN** a Partner (`role: PARTNER` with a `partnerId`) visits `/[lang]/admin`
- **THEN** the middleware calls `redirectAfterLoginFor(viewer, "admin")`
- **AND** the returned destination is the `partner`-owner safe route for the active viewer (per the table)
- **AND** the request is redirected with status 302

#### Scenario: Admin visiting a partner route lands on the admin safe destination
- **WHEN** an Admin (`role: ADMIN`) visits `/[lang]/partner`
- **THEN** the middleware calls `redirectAfterLoginFor(viewer, "partner")`
- **AND** the returned destination is the `admin`-owner safe route for the active viewer (per the table)
- **AND** the request is redirected with status 302

#### Scenario: The table is the routing spec's source of truth
- **WHEN** a contributor opens a PR that adds a new fallback destination
- **THEN** the change updates `redirectAfterLoginFor` in `src/lib/product-routes.ts`
- **AND** the change adds a `#### Scenario:` block to the `Canonical Redirect-After-Login Table` requirement that names the new `viewer.kind × viewer.role × owner` cell
- **AND** the change does not introduce a second source of truth for cross-surface fallbacks

#### Scenario: The table is gherkin-disciplined
- **WHEN** a contributor reads `tests/features/identity/redirect-after-login-table.feature`
- **THEN** at least one happy-path scenario asserts a Member-visit-admin redirect lands on the member safe destination
- **AND** at least one edge-case scenario asserts a Partner-visit-admin redirect lands on the partner safe destination
- **AND** every step uses only proximity + layout selectors (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`, `getByRole`, `getByLabel`, `getInside`)

#### Scenario: The table is storybook-disciplined
- **WHEN** a contributor reads `10-iteration/features/RedirectAfterLoginTable.stories.tsx`
- **THEN** at least one story renders the table with a `Member × admin` cell and carries a `play` interaction test
- **AND** at least one story renders the table with a `Partner × admin` cell and carries a `play` interaction test
- **AND** every story is tagged with `@story(component=RedirectAfterLoginTable, story=…)` referencing the scenario id from `feature.feature`
