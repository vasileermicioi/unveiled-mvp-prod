## 1. Implement `normalizeAppPath` in `packages/orchestrator/src/index.ts`

- [x] 1.1 Add the `APP_BARE_ROUTE_SEGMENTS` `Set<string>` constant to `packages/orchestrator/src/index.ts` containing the closed set of app-shaped bare paths: `/discover`, `/how-it-works`, `/membership`, `/faq`, `/app`, `/onboarding`, `/saved`, `/bookings`, `/profile`, `/partner`, `/admin`. Re-export the constant so unit tests can iterate it.
- [x] 1.2 Add `export function normalizeAppPath(pathname: string, request: Request): string | null` to `packages/orchestrator/src/index.ts`. The function returns `null` early for any path matching the exclusion matrix (canonical `/app/...` and `/app`, `/api/...`, `/healthz`, `/readyz`, `/ladle/...`, `/favicon.ico`, `/favicon.svg`, `/logos/...`, `/fonts/...`, `/_...`, `/@...`, and any path containing `.`). For bare language prefixes matching `^/(de|en)(/.*)?$`, return `` `/app${pathname}` ``. For paths in `APP_BARE_ROUTE_SEGMENTS`, return `` `/app/${pickLangFromRequest(request)}${pathname}` ``. Return `null` for everything else.
- [x] 1.3 Reuse the existing `pickLangFromRequest(request)` helper for the bare-segment language resolution so the cookie → `Accept-Language` → `en` precedence matches the existing bare-`/app` redirect. No changes to `pickLangFromRequest` itself.

## 2. Wire `normalizeAppPath` into `packages/orchestrator/src/worker.ts`

- [x] 2.1 In the `fetch` handler's fallback branch (the `else` after `/api/*`, `/app`, `/app/`, and `/app/...` are dispatched), call `normalizeAppPath(path, request)` before forwarding to `env.LANDING.fetch(request)`. When the function returns a canonical URL, return a `302 Found` response with `Location: <canonical>` wrapped in `withSecurityHeaders(response, path)` so the orchestrator's uniform security header policy applies.
- [x] 2.2 Verify the canonical `/app/<lang>/...` paths still dispatch to `env.APP.fetch(request)` unchanged (no `302`, no redirect loop). The existing dispatch branch handles `/app/...` before the fallback; the normalization branch only fires for paths that previously fell through.
- [x] 2.3 Verify the bare `/` path still forwards to `env.LANDING.fetch(request)` (no `302`). `normalizeAppPath` returns `null` for `/` (the `langMatch` regex requires `/de` or `/en` as the first segment, and `/` is not in `APP_BARE_ROUTE_SEGMENTS`).

## 3. Wire `normalizeAppPath` into `packages/orchestrator/src/dev-proxy.ts`

- [x] 3.1 In the `dispatchPlugin()` middleware, before calling `targetForPath(pathname)`, synthesize a `Request` from the inbound headers (carry `accept-language` and `cookie` so `pickLangFromRequest` works) and call `normalizeAppPath(pathname, fakeRequest)`. When the function returns a canonical URL, return a `302 Found` response with `Location: <canonical>` and stop the middleware chain.
- [x] 3.2 Verify the Vite HMR endpoints (`/@vite/...`, `/@id/...`, `/node_modules/.vite/...`, `/_astro/...`) still forward to `http://localhost:4321` unchanged. `normalizeAppPath` returns `null` for any path starting with `/@`, `/_`, or containing `.`, so `targetForPath` runs as before.
- [x] 3.3 Verify the dev proxy's `dispatchPlugin()` still mirrors the production Worker's behavior end-to-end. Manual smoke: open `http://localhost:4320/en/admin` after `bun run dev` and confirm the response is `302 Found` with `Location: /app/en/admin` and the orchestrator's security headers applied.

## 4. Add unit tests for `normalizeAppPath` in `packages/orchestrator/src/worker.test.ts`

- [x] 4.1 Add a `describe("normalizeAppPath", …)` block with a `makeRequest(acceptLanguage?)` helper that builds a `Request` against `https://unveiled.app/` with the given `Accept-Language` (no cookie).
- [x] 4.2 Assert the bare-language cases: `/en/admin` → `/app/en/admin`; `/de` → `/app/de`; `/en/` → `/app/en/`; `/en/admin/events` → `/app/en/admin/events`.
- [x] 4.3 Assert the bare-segment cases with default English: `/discover` → `/app/en/discover`; `/admin` → `/app/en/admin`; `/membership` → `/app/en/membership`; `/how-it-works` → `/app/en/how-it-works`; `/partner` → `/app/en/partner`; `/saved` → `/app/en/saved`.
- [x] 4.4 Assert the bare-segment cases with `Accept-Language: de-DE,de;q=0.9`: `/discover` → `/app/de/discover`; `/admin` → `/app/de/admin`.
- [x] 4.5 Assert the bare-segment cases with `Cookie: unveiled_lang=DE` (no `Accept-Language`): `/admin` → `/app/de/admin`.
- [x] 4.6 Assert the exclusion matrix returns `null`: `/app/en/admin`, `/app`, `/api/openapi.json`, `/healthz`, `/readyz`, `/`, `/ladle/index.html`, `/favicon.ico`, `/logos/unveiled-logo-black.svg`, `/fonts/EKNoticeSans-Black.woff2`, `/@vite/client`, `/_astro/something.js`. Also assert `/foo` (unknown bare path) returns `null`.
- [x] 4.7 Run `bun --filter @unveiled/orchestrator test` and confirm every test passes (the existing dispatch tests plus the new `normalizeAppPath` block).

## 5. Extend gherkin coverage in `tests/features/core-platform/orchestrator/feature.feature`

- [x] 5.1 Add a `Scenario: GET /en/admin normalizes to /app/en/admin` asserting the response status is `302` and the `Location` header is `/app/en/admin`. Tag with `@ladle(component=OrchestratorDispatch, story=BareLanguageNormalizesToCanonicalAppPath)`.
- [x] 5.2 Add a `Scenario: GET /de normalizes to /app/de` asserting `302` and `Location: /app/de`. Tag with `@ladle(component=OrchestratorDispatch, story=BareLanguageRootNormalizesToCanonicalAppRoot)`.
- [x] 5.3 Add a `Scenario: GET /discover normalizes to /app/en/discover` asserting `302` and `Location: /app/en/discover` (default English, no `Accept-Language`). Tag with `@ladle(component=OrchestratorDispatch, story=BareSegmentNormalizesToCanonicalAppPath)`.
- [x] 5.4 Add a `Scenario: GET /admin normalizes to /app/en/admin` asserting `302` and `Location: /app/en/admin`. Tag with `@ladle(component=OrchestratorDispatch, story=BareAdminSegmentNormalizesToCanonicalAppPath)`.
- [x] 5.5 Add a `Scenario: GET /membership normalizes to /app/en/membership` asserting `302` and `Location: /app/en/membership`. Tag with `@ladle(component=OrchestratorDispatch, story=BareMembershipSegmentNormalizesToCanonicalAppPath)`.
- [x] 5.6 Add a `Scenario: GET /en/admin/events normalizes to /app/en/admin/events` asserting `302` and `Location: /app/en/admin/events`. Tag with `@ladle(component=OrchestratorDispatch, story=BareLanguageDeepPathNormalizesToCanonicalAppPath)`.
- [x] 5.7 Add a `Scenario: GET / does not normalize (landing home)` asserting the response status is `200` and the body is the landing hero. Tag with `@ladle(component=OrchestratorDispatch, story=LandingRootIsNotNormalized)`.
- [x] 5.8 Add a `Scenario: GET /app/en/discover does not normalize (canonical path)` asserting the response status is `200` and the body is the app's discover page. Tag with `@ladle(component=OrchestratorDispatch, story=CanonicalAppPathIsNotNormalized)`.
- [x] 5.9 Confirm `bun run ladle:coverage` references the new stories and exits zero (the coverage script walks `@ladle(...)` tags in `feature.feature` and matches them against the stories exported from `tests/features/core-platform/orchestrator/orchestrator-dispatch.ladle.tsx`).

## 6. Update the capability specs

- [x] 6.1 Update `openspec/specs/routing-orchestrator/spec.md` so the `Orchestrator Worker Dispatches The Public URL Surface` requirement includes the `normalizeAppPath` invocation and the `302` response shape, and so the existing scenarios remain accurate (the canonical `/app/<lang>/...` scenarios are unchanged; the bare-language and bare-segment cases are added under the same requirement).
- [x] 6.2 Add a `Scenario: Orchestrator normalizes app-shaped paths to the canonical form` under the `Canonical /[lang]/... Route Table Exists` requirement in `openspec/specs/routing/spec.md`, asserting that a Guest visiting `/en/admin` is redirected to `/app/en/admin` by the orchestrator's path normalization (linking the `routing` capability to the `routing-orchestrator` capability's normalization layer).
- [x] 6.3 Verify no other capability spec mentions path normalization. `grep -R "normalizeAppPath\|path normalization\|bare route segment\|bare language prefix"` against `openspec/specs/` returns only `openspec/specs/routing-orchestrator/spec.md` and `openspec/specs/routing/spec.md`.

## 7. Final validation

- [x] 7.1 Run `bun run check` (covers `astro check`, `biome check .`, `bun run specs:check`, `bun run tokens:check`, `bun run ladle:coverage`, `bun run wrangler:check`, `bun run arch:check`). All must pass; the orchestrator-side gates (`bun --filter @unveiled/orchestrator test`, `bun run wrangler:check`, `bun run ladle:coverage`, `bun run tokens:check`) are clean by construction since the change touches only request-handling code and the orchestrator's static config.
- [x] 7.2 Run `bun --filter @unveiled/orchestrator test` and confirm the `normalizeAppPath` block plus all 21 existing dispatch tests pass.
- [x] 7.3 Run `PLAYWRIGHT_BASE_URL=http://localhost:4320/ bunx playwright test --project=real-route tests/parity/gherkin.spec.ts --grep "normalizes|does not normalize"` and confirm every gherkin scenario tagged `@ladle(...)` for normalization passes end-to-end against the orchestrator's port-4320 proxy.
- [x] 7.4 Run `openspec validate orchestrator-path-normalization` and confirm the validator reports valid (proposal, specs, design, and tasks all parse and reference each other correctly).
- [ ] 7.5 Promote the change through preview → production via the chained deploy (`bun run deploy:cloudflare`); confirm `https://unveiled.app/en/admin` returns `302 Found` with `Location: /app/en/admin` on the production hostname. (Maintainer step — gated on `wrangler --remote` credentials.)
- [ ] 7.6 Archive the change via `openspec archive orchestrator-path-normalization` once the PR merges. (Maintainer step after merge.)
