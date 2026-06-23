## MODIFIED Requirements

### Requirement: Local Dev Boots All Workers Behind A Single Proxy

The root `bun run dev` command SHALL boot the API Worker, the app Astro Worker, the landing Astro Worker, and the orchestrator dev proxy behind a single local port (4320). The dev proxy SHALL be implemented as a Vite plugin (`packages/orchestrator/src/dev-proxy.ts` exporting `dispatchPlugin()` and wired through `packages/orchestrator/vite.config.ts`) and SHALL forward:

- `/api/*` → `http://localhost:8787` (Wrangler dev for the API Worker)
- `/app/*` → `http://localhost:4321` (Astro dev for `@unveiled/app`)
- `/@vite/`, `/@id/`, `/@fs/`, `/node_modules/`, `/src/`, and `/__vite_ping` → `http://localhost:4321` (Vite-internal module-resolution paths, owned by the app's Vite dev server)
- `/`, `/ladle/*`, `/favicon.ico`, and any other top-level path → `http://localhost:4322` (Astro dev for `@unveiled/landing`)

The orchestrator's `dev` script SHALL NOT start until the three downstream dev servers are listening on their declared ports. The dev proxy SHALL NOT apply the orchestrator's production CSP / HSTS / security header policy; it is a transparent HTTP and WebSocket passthrough so Vite's HMR (WebSocket upgrades and blob workers) works when developing through port 4320.

The legacy `Bun.serve` proxy (`packages/orchestrator/src/dev-server.ts`) SHALL be retained as an alternative export (via `package.json` `exports["./dev-server"]`) for environments where Vite is unavailable; it SHALL NOT be the default `dev` script.

#### Scenario: bun run dev boots all four Workers

- **WHEN** a contributor runs `bun run dev` at the repo root
- **THEN** the command fans out to `bun --filter @unveiled/api run dev`, `bun --filter @unveiled/app run dev`, `bun --filter @unveiled/landing run dev`, and `bun --filter @unveiled/orchestrator run dev`
- **AND** the orchestrator's `dev` script is `wait-on tcp:8787 tcp:4321 tcp:4322 && vite --config vite.config.ts` (so the Vite plugin owns port 4320).

#### Scenario: Single port serves the entire URL surface

- **WHEN** a contributor opens `http://localhost:4320/` after `bun run dev`
- **THEN** they see the landing hero (forwarded from `http://localhost:4322/`)
- **AND** `http://localhost:4320/app/<lang>/discover` resolves to the app's discover page (forwarded from `http://localhost:4321/app/<lang>/discover`)
- **AND** `http://localhost:4320/api/openapi.json` resolves to the API Worker's Hono OpenAPI document (forwarded from `http://localhost:8787/api/openapi.json`).

#### Scenario: Vite-internal paths are forwarded to the app's Vite dev server

- **WHEN** a contributor opens `http://localhost:4320/@vite/client` after `bun run dev`
- **THEN** the Vite plugin forwards the request to `http://localhost:4321/@vite/client`
- **AND** the response status is `200` with `Content-Type: text/javascript`
- **AND** the equivalent paths `/@id/...`, `/@fs/...`, `/node_modules/...`, `/src/...`, and `/__vite_ping` are forwarded the same way.

#### Scenario: WebSocket upgrades are proxied to the upstream Vite dev server

- **WHEN** a browser opens `ws://localhost:4320/?token=...` (Vite HMR) after `bun run dev`
- **THEN** the Vite plugin forwards the upgrade to `ws://localhost:4321/?token=...`
- **AND** the `101 Switching Protocols` response from the upstream is returned to the client
- **AND** subsequent frames are piped bidirectionally between the client and the upstream.

#### Scenario: Production CSP is not applied in dev

- **WHEN** any request reaches the orchestrator's Vite dev proxy
- **THEN** the response does NOT include the orchestrator's production `Content-Security-Policy` / `Strict-Transport-Security` / `X-Frame-Options` policy
- **AND** Vite's HMR blob worker is allowed by the browser's default dev policy (no `worker-src` enforcement by the proxy).

## ADDED Requirements

### Requirement: Vite Dev Proxy Forwards WebSocket Upgrades And Vite-Internal Paths

The Vite dev proxy (`packages/orchestrator/src/dev-proxy.ts` exporting `dispatchPlugin()`) SHALL expose both an HTTP middleware and an `httpServer.on('upgrade')` handler so that development through the orchestrator's port 4320 supports Vite HMR and React-island hydration.

The HTTP middleware SHALL resolve a request to one of three upstreams by path prefix:

- `/api/*` (or `/api`) → `http://localhost:8787`
- `/app/*` (or `/app`) → `http://localhost:4321`
- `/@vite/`, `/@id/`, `/@fs/`, `/node_modules/`, `/src/`, or `/__vite_ping` → `http://localhost:4321`
- everything else → `http://localhost:4322`

The upgrade handler SHALL forward `Upgrade` and `Connection: upgrade` headers verbatim to the upstream that matches the request path's prefix, write the upstream's `101 Switching Protocols` response back to the client, and pipe both directions of the duplex socket.

The proxy SHALL answer `/healthz` with `200` and body `ok`, and `/readyz` with `200` and a dev envelope `{"status":"ok","surfaces":{"api":"dev","app":"dev","landing":"dev"}}`, without invoking any upstream. The proxy SHALL apply the orchestrator's `normalizeAppPath` (exported from `packages/orchestrator/src/index.ts`) to non-health requests so manual testing on `http://localhost:4320/<bare-path>` mirrors production redirects.

The proxy SHALL NOT apply the orchestrator's production CSP / HSTS / `X-Content-Type-Options` / `Referrer-Policy` / `X-Frame-Options` policy. The dev proxy is a transparent HTTP and WebSocket passthrough.

#### Scenario: GET /healthz returns 200 with body "ok"

- **WHEN** a contributor issues `GET http://localhost:4320/healthz`
- **THEN** the Vite plugin returns `200` with body `ok` and `Content-Type: text/plain; charset=utf-8`
- **AND** no upstream is invoked.

#### Scenario: GET /readyz returns a dev envelope

- **WHEN** a contributor issues `GET http://localhost:4320/readyz`
- **THEN** the Vite plugin returns `200` with body `{"status":"ok","surfaces":{"api":"dev","app":"dev","landing":"dev"}}` and `Content-Type: application/json`
- **AND** no upstream is invoked.

#### Scenario: Bare app paths redirect through normalizeAppPath

- **WHEN** a contributor opens `http://localhost:4320/app` with no language preference set
- **THEN** the Vite plugin returns `302` with `Location: /app/en/`
- **AND** no upstream is invoked for the redirect response.

#### Scenario: /api/* is forwarded to the API Worker

- **WHEN** a contributor issues `GET http://localhost:4320/api/openapi.json`
- **THEN** the Vite plugin forwards the request to `http://localhost:8787/api/openapi.json`
- **AND** the response status and headers from the upstream are returned to the client.

#### Scenario: /app/* is forwarded to the app Astro dev server

- **WHEN** a contributor issues `GET http://localhost:4320/app/en/discover`
- **THEN** the Vite plugin forwards the request to `http://localhost:4321/app/en/discover`
- **AND** the response status and headers from the upstream are returned to the client.

#### Scenario: Vite-internal paths are forwarded to the app Vite dev server

- **WHEN** a contributor issues `GET http://localhost:4320/@vite/client`
- **THEN** the Vite plugin forwards the request to `http://localhost:4321/@vite/client`
- **AND** the response is `200` with `Content-Type: text/javascript`.

#### Scenario: WebSocket upgrade for HMR is forwarded

- **WHEN** a browser opens `ws://localhost:4320/?token=...` (Vite HMR)
- **THEN** the Vite plugin forwards the upgrade to `ws://localhost:4321/?token=...`
- **AND** the `101 Switching Protocols` response from the upstream is written back to the client
- **AND** subsequent HMR frames are piped bidirectionally between the client and the upstream.

#### Scenario: Unknown upgrade targets are rejected

- **WHEN** a WebSocket upgrade arrives for a path that does not match any prefix (`/api/`, `/app/`, `/@vite/`, `/@id/`, `/@fs/`, `/node_modules/`, `/src/`, `/__vite_ping`)
- **THEN** the Vite plugin destroys the client socket (the upgrade is not proxied to the landing Worker, which has no HMR endpoint).

#### Scenario: Production CSP is not applied

- **WHEN** any request reaches the Vite dev proxy
- **THEN** the response does NOT include the orchestrator's production `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, or `X-Frame-Options` headers
- **AND** Vite's HMR blob worker is not blocked by a missing `worker-src` directive.