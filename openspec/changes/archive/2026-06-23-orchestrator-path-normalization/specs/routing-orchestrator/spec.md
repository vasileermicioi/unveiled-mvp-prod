# routing-orchestrator Specification (Delta)

## MODIFIED Requirements

### Requirement: Orchestrator Worker Dispatches The Public URL Surface

A Cloudflare Worker SHALL be the single entry point for the public URL surface. The Worker SHALL inspect `url.pathname` and dispatch each request to the matching downstream service binding:

- `/api/*` → `env.API.fetch(request)`
- `/app/*` → `env.APP.fetch(request)`
- everything else (including `/`, `/ladle/*`, `/favicon.ico`, and any other top-level static asset) → `env.LANDING.fetch(request)`
- `/healthz` → orchestrator-owned liveness response (`200` with body `"ok"`)
- `/readyz` → orchestrator-owned readiness response (see `Readiness Probe Composes Downstream Health` requirement)

Before the `LANDING` fallback runs, the Worker SHALL call `normalizeAppPath(pathname, request)` (exported from `packages/orchestrator/src/index.ts`). When `normalizeAppPath` returns a canonical URL, the Worker SHALL respond with `302 Found` and `Location: <canonical>`, applying the orchestrator's uniform security headers (see `Orchestrator Applies Uniform Security Headers`). The Vite dev proxy in `packages/orchestrator/src/dev-proxy.ts` SHALL call the same `normalizeAppPath` function before forwarding, so manual testing on `http://localhost:4320/<bare-path>` mirrors production behavior.

The Worker SHALL live at `packages/orchestrator/src/worker.ts` and SHALL be the `main` entry of `wrangler.orchestrator.toml`.

#### Scenario: /api/* is forwarded to the API Worker

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** the orchestrator returns `env.API.fetch(request)` without buffering the body
- **AND** no Astro, Hono, or other downstream middleware runs before the binding call.

#### Scenario: /app/* is forwarded to the app Worker

- **WHEN** a request arrives at any path under `/app/*`
- **THEN** the orchestrator returns `env.APP.fetch(request)` without buffering the body.

#### Scenario: Everything else is forwarded to the landing Worker

- **WHEN** a request arrives at `/`, `/ladle/*`, `/favicon.ico`, or any other path not under `/api/` or `/app/`
- **THEN** the orchestrator returns `env.LANDING.fetch(request)` without buffering the body.

#### Scenario: /healthz returns 200 "ok"

- **WHEN** a request arrives at `/healthz`
- **THEN** the orchestrator returns a `200` response with body `"ok"` and `Content-Type: text/plain; charset=utf-8`
- **AND** no downstream Worker is invoked.

#### Scenario: /readyz dispatches to the readiness probe

- **WHEN** a request arrives at `/readyz`
- **THEN** the orchestrator invokes the readiness probe (see `Readiness Probe Composes Downstream Health`)
- **AND** returns either `200` (all downstream Workers green) or `503` (any downstream Worker red) with a safe JSON envelope.

#### Scenario: Service binding latency is not amplified by the orchestrator

- **WHEN** the orchestrator forwards a request to a downstream Worker via service binding
- **THEN** it returns the upstream `Response` object directly without buffering the body
- **AND** `ReadableStream` bodies (Stripe webhook raw body, future SSE endpoints) stream end-to-end through the binding.

#### Scenario: Bare /app and /app/ are redirected to /app/<lang>/

- **WHEN** a request arrives at the bare paths `/app` or `/app/` (no language segment)
- **THEN** the orchestrator returns `302` with `Location: /app/<lang>/` where `<lang>` is resolved from (in order) the `unveiled_lang` cookie, the `Accept-Language` request header (matching `de`), or the default `en`
- **AND** the original query string is preserved on the `Location` header (e.g. `/app?venuePartner=abc&venueToken=xyz` → `/app/en/?venuePartner=abc&venueToken=xyz`)
- **AND** paths already under `/app/<lang>/...` are forwarded to the app Worker unchanged (no redirect loop).

#### Scenario: Bare language prefix is redirected to /app/<lang>/...

- **WHEN** a request arrives at `/en`, `/en/`, `/de`, `/en/admin`, or any path matching `^/(de|en)(/.*)?$` (excluding `/app/...`)
- **THEN** the orchestrator returns `302` with `Location: /app<pathname>` (e.g. `/en/admin` → `/app/en/admin`; `/de` → `/app/de`)
- **AND** the response carries the orchestrator's uniform security headers.

#### Scenario: Bare route segment is redirected to /app/<lang><path>

- **WHEN** a request arrives at any path in the `APP_BARE_ROUTE_SEGMENTS` set (`/discover`, `/how-it-works`, `/membership`, `/faq`, `/app`, `/onboarding`, `/saved`, `/bookings`, `/profile`, `/partner`, `/admin`)
- **THEN** the orchestrator returns `302` with `Location: /app/<lang><pathname>` where `<lang>` is resolved by `pickLangFromRequest` (cookie first, then `Accept-Language`, default `en`)
- **AND** the response carries the orchestrator's uniform security headers.

#### Scenario: Bare route segment respects the unveiled_lang cookie

- **WHEN** a request arrives at `/admin` with a `Cookie: unveiled_lang=DE` header
- **THEN** the orchestrator returns `302` with `Location: /app/de/admin`.

#### Scenario: Bare route segment respects Accept-Language: de

- **WHEN** a request arrives at `/discover` with `Accept-Language: de-DE,de;q=0.9` and no `unveiled_lang` cookie
- **THEN** the orchestrator returns `302` with `Location: /app/de/discover`.

#### Scenario: Canonical /app/<lang>/... paths are forwarded unchanged

- **WHEN** a request arrives at any path under `/app/<lang>/...` (e.g. `/app/en/discover`)
- **THEN** `normalizeAppPath` returns `null`
- **AND** the orchestrator forwards the request to `env.APP.fetch(request)` without redirect.

#### Scenario: Normalization excludes /api/* and /healthz and /readyz

- **WHEN** a request arrives at any path under `/api/*`, `/healthz`, or `/readyz`
- **THEN** `normalizeAppPath` returns `null`
- **AND** the request flows through the normal dispatch (no `302`).

#### Scenario: Normalization excludes /, Ladle, favicon, and app static assets

- **WHEN** a request arrives at `/`, `/ladle/*`, `/favicon.ico`, `/favicon.svg`, `/logos/*`, or `/fonts/*`
- **THEN** `normalizeAppPath` returns `null`
- **AND** the request flows through the normal dispatch (landing for `/` and static assets, app or landing for the rest per the dispatch contract).

#### Scenario: Normalization excludes Vite internals and any path with a file extension

- **WHEN** a request arrives at `/@vite/client`, `/@id/...`, `/@fs/...`, `/_astro/...`, or any path containing `.`
- **THEN** `normalizeAppPath` returns `null`
- **AND** the dev proxy forwards the request to the matching dev server (the production Worker falls through to the dispatch).

#### Scenario: Unknown bare paths are forwarded to the landing Worker

- **WHEN** a request arrives at a path that is not in `APP_BARE_ROUTE_SEGMENTS` and does not match the language-prefix regex (e.g. `/foo`)
- **THEN** `normalizeAppPath` returns `null`
- **AND** the orchestrator forwards the request to `env.LANDING.fetch(request)` (which 404s on unknown paths).

## ADDED Requirements

_None._

## REMOVED Requirements

_None._
