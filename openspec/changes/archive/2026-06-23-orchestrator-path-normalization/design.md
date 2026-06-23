## Context

The routing orchestrator (`packages/orchestrator/src/worker.ts`, capability `routing-orchestrator`, modeled in `openspec/specs/routing-orchestrator/spec.md`) is the Cloudflare Worker entry point for the public hostname. Its `fetch` handler dispatches `url.pathname` with a strict prefix match:

- `/api/*` → `env.API.fetch(request)`
- `/app/*` → `env.APP.fetch(request)`
- `/healthz` → liveness `200 ok`
- `/readyz` → readiness probe (composes downstream health)
- everything else → `env.LANDING.fetch(request)`

In local dev, `packages/orchestrator/src/dev-proxy.ts` mirrors the same dispatch via a Vite middleware listening on port 4320 and forwarding to `http://localhost:8787` (API Worker), `http://localhost:4321` (Astro app dev), and `http://localhost:4322` (Astro landing dev).

The `routing` capability declares the canonical URL space as `/app/<lang>/...` (per `openspec/specs/routing/spec.md`: "the route table records that the route is mounted at `/app/<lang>/...`"). But the orchestrator has no layer that recognizes "app-shaped" paths delivered without the `/app` prefix. A request to `/en/admin`, `/de`, `/discover`, `/admin`, or `/membership` does not start with `/app/`, so the orchestrator forwards it to the landing Worker, which 404s on unknown paths. From the user's perspective (`opencode-error-prompt.txt`):

> `http://127.0.0.1:4320/en/admin` → 404

The same problem occurs in production: bookmarks pointing at `/en/admin`, landing-page links that drop the `/app` base, and Playwright e2e tests that use `baseURL: http://localhost:4320/` and navigate to a relative `/en/admin` path all 404 because the orchestrator forwards them to the landing Worker.

The orchestrator already has language-resolution primitives in `packages/orchestrator/src/index.ts`: `pickLangFromRequest(request: Request)` reads the `unveiled_lang` cookie, then `Accept-Language`, then defaults to `en`. The dispatch contract for bare `/app` and `/app/` (redirect to `/app/<lang>/`) is already wired in `worker.ts` via the `appBarePathRedirect` helper. Path normalization extends the same idea to every other "app-shaped" path.

## Goals / Non-Goals

**Goals:**

- Redirect "app-shaped" paths (bare language prefixes and bare route segments) to the canonical `/app/<lang>/...` form with `302 Found` and the orchestrator's uniform security headers.
- Centralize the normalization rules in a single exported function (`normalizeAppPath`) so the production Worker and the Vite dev proxy stay in lockstep.
- Honor the user's language preference (`unveiled_lang` cookie, then `Accept-Language`, then `en`) when picking `<lang>` for bare route segments.
- Exclude canonical paths, API paths, health probes, Ladle assets, favicon, app static assets, Vite internals, and the bare landing `/` from normalization (so no redirect loops, no surprises for static asset URLs).
- Cover the rules with unit tests in `packages/orchestrator/src/worker.test.ts` (the existing `describe("normalizeAppPath", …)` block) and gherkin scenarios in `tests/features/core-platform/orchestrator/feature.feature` driving the orchestrator's port-4320 proxy end-to-end.

**Non-Goals:**

- Rewriting the dispatch contract. `/api/*`, `/app/*`, `/healthz`, `/readyz`, and the `LANDING` fallback stay exactly as they are today; normalization only adds a `302` response for app-shaped paths that previously fell through to `LANDING`.
- Adding i18n support to the landing surface. The landing stays single-language; normalization only affects app-shaped paths.
- Changing the canonical `/app/<lang>/...` route table. The route table is the source of truth (per the `routing` capability); normalization is a redirect layer on top of it, not a replacement.
- Migrating bookmarks at the database level. Redirects are handled in the orchestrator; no client-side migration is required.

## Decisions

### Decision 1 — Co-locate `normalizeAppPath` with `pickLangFromRequest` in `packages/orchestrator/src/index.ts`

**Rationale:** The orchestrator already owns `pickLangFromRequest`, `appBarePathRedirect`, `SUPPORTED_APP_LANGS`, `DEFAULT_APP_LANG`, and the dispatch constants in `packages/orchestrator/src/index.ts`. Path normalization is a sibling concern: it uses the same language-resolution helper and the same constant set. Putting `normalizeAppPath` next to those primitives means both the production Worker and the Vite dev proxy can import the function with a single relative path (`./index`), which keeps the call sites symmetric and prevents the "rules drift between Worker and dev proxy" failure mode.

**Alternatives considered:**

- New file `packages/orchestrator/src/path-normalization.ts`. Rejected: it would split the language primitives across two files, force the Worker and the dev proxy to import from two places, and add a new file to the orchestrator's public surface for no real encapsulation win (the function is the single source of truth for the rules and is unit-tested directly).
- Inline the function inside `worker.ts` and duplicate in `dev-proxy.ts`. Rejected: that's exactly the divergence risk we're mitigating. Unit tests would also have to live in two places.

### Decision 2 — Use a `Set<string>` for `APP_BARE_ROUTE_SEGMENTS`, not a regex

**Rationale:** The list of app-shaped route segments is a closed set owned by the `routing` capability's route table (`/discover`, `/how-it-works`, `/membership`, `/faq`, `/app`, `/onboarding`, `/saved`, `/bookings`, `/profile`, `/partner`, `/admin`). A `Set<string>` makes the membership check O(1), is easier to read, and is the same shape the `routing` spec uses to enumerate the surfaces. A regex like `^/(discover|how-it-works|...)$` would couple the dispatch to regex syntax and make it harder to extend the set when the route table grows.

**Alternatives considered:**

- Derive `APP_BARE_ROUTE_SEGMENTS` from the `routing` route table at runtime. Rejected: the orchestrator is a Cloudflare Worker with no access to the repo's TypeScript source; it would need a generated JSON manifest, which is a much bigger lift for no win at this stage. The current set is maintained by hand in `packages/orchestrator/src/index.ts` and unit-tested; if it ever drifts from the route table, a CI check can compare the two.
- Allow deep segments like `/discover/events/123`. Rejected: only the canonical segments are bare-app redirects; deep paths under `/discover/events/...` are already on the app surface if `/discover/...` is, so they don't need a redirect. The set is intentionally flat.

### Decision 3 — Apply the orchestrator's uniform security headers on the `302` response

**Rationale:** The orchestrator already applies `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, and `X-Frame-Options` to every non-API response (see the `Orchestrator Applies Uniform Security Headers` requirement in `routing-orchestrator`). A `302` redirect returned by the orchestrator is a non-API response and must carry the same headers so the policy is uniform across the dispatch surface. The existing `withSecurityHeaders(response, path)` helper handles this; the normalization branch reuses it.

**Alternatives considered:**

- Return the `302` without the security headers. Rejected: that creates a class of responses that bypass the policy, which is exactly the kind of inconsistency the uniform-header requirement was added to prevent.
- Compose a separate "redirect CSP" policy. Rejected: there is no need; the headers are header-value pairs, not response-specific. The `302` response is an orchestrator-owned response; it carries the orchestrator's policy.

### Decision 4 — Run normalization in the `worker.ts` `fetch` handler before the `LANDING` fallback, not in the Astro app's middleware

**Rationale:** The orchestrator already owns the dispatch contract (per `routing-orchestrator`: "a Cloudflare Worker that owns the public URL surface and dispatches requests"). The Astro app's middleware runs only when the request reaches `env.APP.fetch(request)`, which means a path that 404s on landing never reaches the app. Moving normalization into the orchestrator fixes the bug at the layer that owns the public URL surface. It also keeps the rule in the same place for the dev proxy (the dev proxy mirrors the orchestrator's behavior, not the app's middleware behavior).

**Alternatives considered:**

- Add a middleware to `packages/app/src/middleware.ts` that 301-redirects bare app-shaped paths back to the canonical form. Rejected: the app's middleware is reached only after the orchestrator has already routed the request to `APP`, so it can't intercept paths the orchestrator never sends there. The 404 happens upstream.
- Use Cloudflare Pages' `_redirects` file in the app Worker. Rejected: Pages redirects run after the orchestrator's service binding dispatch in this topology; the orchestrator's `APP` binding is the entry point to the app, so the redirect would only fire for paths already in `/app/*`.

### Decision 5 — Default `<lang>` to `en` for bare route segments when no preference is set

**Rationale:** The app surface is bilingual (`SUPPORTED_APP_LANGS = ["en", "de"]`, `DEFAULT_APP_LANG = "en"`), and the existing `appBarePathRedirect` and `pickLangFromRequest` helpers already use `en` as the default. Choosing a deterministic default keeps the redirect predictable for the common case (no cookie, no `Accept-Language`) and matches the behavior of the bare-`/app` redirect that's already shipped.

**Alternatives considered:**

- Return `null` (no redirect) when no preference is set. Rejected: that would leave the user on a 404, which is the bug we're fixing.
- Echo back the requested language from `navigator.language` via a separate hint header. Rejected: the Worker doesn't see the navigator's language; it only sees `Accept-Language` from the inbound request.

### Decision 6 — Exclude Vite internals and any path with a `.` from normalization

**Rationale:** Vite uses paths like `/@vite/client`, `/@id/...`, `/node_modules/.vite/...`, and `/_astro/...` during dev; redirecting these would break HMR. The exclusion list (`/...`, `/_...`, paths containing `.`) covers the Vite prefix set and any static asset path. The same exclusion runs in both the production Worker and the dev proxy, so Vite HMR continues to work.

**Alternatives considered:**

- Maintain an explicit allowlist of "real" app-shaped paths. Rejected: the allowlist would have to be updated every time Vite adds a new internal prefix, and the runtime cost of the regex check is negligible.
- Exclude only `/@...`. Rejected: Vite also uses `/_astro/...` and `/node_modules/.vite/...`; excluding only `/@...` would still redirect the rest.

## Risks / Trade-offs

- **Redirect loops.** A naive implementation could redirect `/app/en/admin` to itself or chain redirects. → Mitigation: `normalizeAppPath` returns `null` for any path starting with `/app/` (or equal to `/app`); canonical paths bypass normalization entirely. Unit tests assert `null` for `/app/en/admin` and `/app`.
- **Language detection on bare segments.** Picking `en` by default may surprise a German-speaking user without an `Accept-Language` header. → Mitigation: `pickLangFromRequest` reads `unveiled_lang` first, then `Accept-Language`, then `en`; unit tests assert all three branches. The cookie path is the highest priority so a user who has set their preference is always respected.
- **Vite HMR endpoints.** Vite internal paths (`/@vite/...`, `/@id/...`, `/_astro/...`, `/node_modules/.vite/...`) must not be redirected or HMR breaks. → Mitigation: `normalizeAppPath` excludes any path starting with `/@` or `/_`, and any path containing `.`. The dev proxy applies the same rule so manual testing preserves HMR.
- **Bare `/` redirect.** `/` is the landing home and MUST NOT be redirected. → Mitigation: the `langMatch` regex requires `/de` or `/en` as the first segment (`^/(de|en)(/.*)?$`); `/` does not match. `/` is also not a member of `APP_BARE_ROUTE_SEGMENTS`. Unit test asserts `null` for `/`.
- **Worker / dev-proxy divergence.** If the rules change in one place and not the other, dev and prod will drift. → Mitigation: both call sites import `normalizeAppPath` from `packages/orchestrator/src/index.ts`, so the rules live in exactly one place. Unit tests in `worker.test.ts` cover the function directly; the dev proxy's `dispatchPlugin()` is a thin wrapper that synthesizes a `Request` from the inbound headers.
- **`unveiled_lang` cookie domain.** The cookie must be visible to the orchestrator's hostname (not just the app's hostname) for the cookie-based lang resolution to work. → Mitigation: the orchestrator's `isPublicHost` helper already covers `unveiled.app`, `www.unveiled.app`, `*.unveiled.app`, `localhost`, and `127.0.0.1`, so the cookie path the app sets will be visible to the orchestrator. The cookie is set at `Domain=unveiled.app` (per `api-package` / `auth` capability), so it's sent to all subdomains.
- **URL-encoding edge cases.** Paths with percent-encoded characters (e.g. `/admin/events%2F123`) need to round-trip through the redirect. → Mitigation: `normalizeAppPath` operates on `url.pathname`, which is the decoded form; the `Location` header value is the canonical path string. The Cloudflare `Request`/`URL` constructors preserve the raw URL on `request.url`, so the redirect target is set from the already-decoded pathname and re-encoded by the client's `Location` parser. Unit tests cover ASCII cases; if percent-encoded paths become a problem, a follow-up can add a `encodeURI` pass before setting `Location`.

## Migration Plan

- **No database migration.** The change is purely in the orchestrator's request handling.
- **No data backfill.** No user data is touched.
- **No cookie migration.** The `unveiled_lang` cookie is unchanged.
- **Deploy order:** unchanged. `bun run deploy:cloudflare` still chains `api` → `app` → `landing` → `orchestrator`. The orchestrator's bundle picks up the new `normalizeAppPath` branch on the next deploy; no warm-up step is needed.
- **Rollback:** revert the orchestrator's bundle (`wrangler deploy --config wrangler.orchestrator.toml` with the previous `dist/worker.js`). The redirect is a `302 Found` (not `301 Moved Permanently`), so clients do not cache it; rollback takes effect immediately.
- **Feature flag:** none. The redirect is unconditional for app-shaped paths; if a regression is found, revert the orchestrator's bundle.

## Open Questions

- _None at archive time._ The implementation matches the proposal and the spec deltas. The unit tests cover the function directly; the gherkin scenarios drive the port-4320 proxy end-to-end. A full multi-Worker `bun run test:e2e` run is a maintainer step gated on `wrangler --remote` credentials, as with the previous orchestrator changes.
