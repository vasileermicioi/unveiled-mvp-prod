## Why

The `routing-orchestrator` change (archived as `2026-06-22-routing-orchestrator`; spec at `openspec/specs/routing-orchestrator/spec.md`) shipped a local dev proxy at `packages/orchestrator/src/dev-server.ts` — a `Bun.serve` HTTP server that uses `fetch()` to forward requests to the three downstream dev servers. The original design in `routing-orchestrator/design.md:60-62` and `tasks.md:4.3` actually required a **Vite-based** dev proxy (`packages/orchestrator/src/dev-proxy.ts` as a Vite plugin, wired via `vite --config packages/orchestrator/vite.config.ts`). The implementation diverged: the `Bun.serve` proxy replaced the planned Vite proxy, and it has three concrete failures in dev:

1. **No WebSocket upgrade support.** The `Bun.serve` proxy's `Fetcher.connect()` throws (`"local dev fetcher does not accept TCP connections"`). Vite's dev servers (app on 4321, landing on 4322) use WebSocket connections for Hot Module Replacement. When a browser opens a page through the orchestrator's port 4320, the HMR client opens a WebSocket to `ws://localhost:4320/?token=...` and the proxy rejects it. HMR is dead; the browser console shows `WebSocket connection to 'ws://127.0.0.1:4320/?token=...' failed` followed by `[vite] server connection lost. Polling for restart...`.
2. **No Vite-internal-path support.** Vite serves module-resolution paths like `/@vite/client`, `/@id/...`, `/@fs/...`, `/node_modules/...`, `/src/...`, and `/__vite_ping`. None start with `/app/` (the app's base) or `/api/`, so the dispatch's prefix matching falls through to the landing Worker, which 404s. React islands fail to hydrate; the page renders but the client-side JavaScript is broken.
3. **CSP blocks Vite HMR blob worker.** The orchestrator's production CSP (`packages/orchestrator/src/index.ts`) does not include `worker-src`; Vite's HMR blob worker falls back to `script-src` and the browser blocks it.

This change replaces the `Bun.serve` proxy with a proper Vite plugin that handles HTTP, WebSocket upgrades, and Vite-internal paths, and does not apply the production CSP in dev. The `Bun.serve` proxy is retained as an export for environments where Vite is unavailable.

## What Changes

- Add `packages/orchestrator/src/dev-proxy.ts` exporting `dispatchPlugin(): Plugin`. The plugin:
  - Registers an HTTP middleware that answers `/healthz` (200 `ok`) and `/readyz` (200 dev envelope), applies the orchestrator's `normalizeAppPath` (so dev mirrors production redirects), and proxies by path prefix:
    - `/api/*` → `http://localhost:8787`
    - `/app/*` → `http://localhost:4321`
    - `/@vite/`, `/@id/`, `/@fs/`, `/node_modules/`, `/src/`, `/__vite_ping` → `http://localhost:4321`
    - everything else → `http://localhost:4322`
  - Registers an `httpServer.on('upgrade')` handler that proxies WebSocket upgrades (Vite HMR) to the same upstream as the HTTP dispatch. The handler forwards `Upgrade` and `Connection: upgrade` headers and pipes both directions of the duplex socket on receipt of the upstream's `101 Switching Protocols` response.
  - Does NOT apply the production CSP / HSTS / security headers. The dev proxy is a transparent HTTP/WebSocket proxy; the app's Vite dev server handles its own headers. Vite HMR's blob worker is allowed by the browser's default dev policy.
- Add `packages/orchestrator/vite.config.ts` with `defineConfig({ server: { port: 4320, strictPort: true, host: '127.0.0.1' }, plugins: [dispatchPlugin()] })`.
- Update `packages/orchestrator/package.json` so `dev` runs `wait-on tcp:8787 tcp:4321 tcp:4322 && vite --config vite.config.ts`. The `Bun.serve` proxy is no longer the default.
- Retain `packages/orchestrator/src/dev-server.ts` as a `Bun.serve` alternative, exported via `package.json` (`./dev-server`) but no longer wired to the `dev` script. Add a header comment noting it is the alternative for environments where Vite is unavailable.
- Add a gherkin scenario in `tests/features/core-platform/orchestrator/feature.feature`: `GET /@vite/client returns 200 with Content-Type text/javascript`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `routing-orchestrator`: the dev proxy is a proper Vite plugin (not a `Bun.serve` proxy). It handles WebSocket upgrades (Vite HMR) and Vite's internal paths (`/@vite/`, `/@id/`, `/@fs/`, `/node_modules/`, `/src/`, `/__vite_ping`). The production CSP is not applied in dev. This restores Vite HMR and React-island hydration when developing through the orchestrator's port 4320.

### Removed Capabilities

_None._ (The `Bun.serve` proxy is retained as an alternative export; it is not removed.)

## Impact

- **New files:** `packages/orchestrator/vite.config.ts`, `packages/orchestrator/src/dev-proxy.ts`.
- **Modified files:**
  - `packages/orchestrator/package.json` — `dev` script changed to use `vite --config vite.config.ts`.
  - `packages/orchestrator/src/dev-server.ts` — header comment noting it is the `Bun.serve` alternative (no code change to the proxy itself).
  - `tests/features/core-platform/orchestrator/feature.feature` — add the `GET /@vite/client` scenario.
  - `openspec/specs/routing-orchestrator/spec.md` — `## MODIFIED Requirements` block under `Local Dev Boots All Workers Behind A Single Proxy`.
- **Removed files:** _none._
- **Dependencies changed:** `vite` and `wait-on` are already devDependencies in `packages/orchestrator/package.json`. No new deps.
- **Risks:**
  - WebSocket upgrade header forwarding. The proxy must forward `Upgrade` / `Connection: upgrade` headers and correctly handle the `101 Switching Protocols` handshake. Mitigation: the proxy uses Node's `http.request` (not `fetch`); the handshake is verified by the new gherkin scenario for `/@vite/client` (200 with `text/javascript`) and by manual browser testing (HMR works after a file edit, no CSP errors in the console).
  - Vite-internal-path collision. With the proxy, all `/@vite/...` paths go to the app's Vite dev server. The landing has no Vite-internal paths. Mitigation: prefix match is restricted to the documented Vite prefixes, and the app is the only Vite-using upstream.
  - Port conflicts. Vite's `strictPort: true` makes the dev proxy fail fast if port 4320 is in use. Mitigation: if the port is in use, Vite logs an error and the `bun run dev` script exits non-zero, which is the desired behavior.