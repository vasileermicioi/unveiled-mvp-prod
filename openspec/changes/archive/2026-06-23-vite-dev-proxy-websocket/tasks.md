## 1. Vite Dev Proxy Implementation

- [x] 1.1 Add `packages/orchestrator/src/dev-proxy.ts` exporting `dispatchPlugin(): Plugin`. The plugin registers an HTTP middleware that resolves a path to one of three upstreams (`/api/*` → `:8787`, `/app/*` or Vite-internal paths (`/@vite/`, `/@id/`, `/@fs/`, `/node_modules/`, `/src/`, `/__vite_ping`) → `:4321`, else → `:4322`) and proxies via Node's `http.request`. The plugin also registers an `httpServer.on('upgrade')` handler that proxies WebSocket upgrades using Node's `http.request({ headers: { ...req.headers, host: target.host } })` and pipes both directions of the duplex socket on receipt of the upstream's `101 Switching Protocols` response. Upstream URLs are read from `process.env.{API,APP,LANDING}_UPSTREAM` with the documented defaults.
- [x] 1.2 Add `packages/orchestrator/vite.config.ts` wiring `dispatchPlugin()` with `defineConfig({ server: { port: 4320, strictPort: true, host: '127.0.0.1' }, plugins: [dispatchPlugin()] })`.
- [x] 1.3 Update `packages/orchestrator/package.json` `dev` script to `wait-on tcp:8787 tcp:4321 tcp:4322 && vite --config vite.config.ts`. Confirm `vite` and `wait-on` are present in `devDependencies`.
- [x] 1.4 Confirm `packages/orchestrator/src/dev-server.ts` is retained and exported via `package.json` `exports["./dev-server"]`. Add a header comment noting it is the `Bun.serve` alternative for environments where Vite is unavailable (no code change to the proxy itself).

## 2. Dev Proxy Health And Normalization

- [x] 2.1 The Vite plugin's HTTP middleware answers `/healthz` with `200` and body `ok` (`Content-Type: text/plain; charset=utf-8`) without invoking any upstream.
- [x] 2.2 The Vite plugin's HTTP middleware answers `/readyz` with `200` and body `{"status":"ok","surfaces":{"api":"dev","app":"dev","landing":"dev"}}` (`Content-Type: application/json`) without invoking any upstream.
- [x] 2.3 The Vite plugin applies `normalizeAppPath` (exported from `packages/orchestrator/src/index.ts`) to non-health requests, forwarding only `accept-language` and `cookie` headers into the synthesized `Request`, so dev parity with production redirects is preserved.

## 3. Gherkin Coverage

- [x] 3.1 Add a scenario to `tests/features/core-platform/orchestrator/feature.feature`: `GET /@vite/client returns 200 with Content-Type text/javascript`. The scenario asserts `When the visitor opens /@vite/client` → `Then the response status is 200` → `And the Content-Type is text/javascript`.

## 4. OpenSpec And Docs

- [x] 4.1 Add `## MODIFIED Requirements` and `## ADDED Requirements` blocks to `openspec/specs/routing-orchestrator/spec.md` covering: WebSocket upgrade proxying, Vite-internal-path forwarding, `/healthz` and `/readyz` answers, `normalizeAppPath` parity, and the no-CSP-in-dev rule. Files at `openspec/changes/vite-dev-proxy-websocket/specs/routing-orchestrator/spec.md`.
- [x] 4.2 Update `AGENTS.md` toolchain table to reflect the Vite-based dev proxy (`bun run dev` boots four Workers behind Vite on port 4320; `dev:bun` script remains for the `Bun.serve` alternative). Update the `Definition of Done` to include `curl -sI http://localhost:4320/@vite/client returns 200 text/javascript` as a manual smoke test for the dev proxy.

## 5. Validation

- [x] 5.1 Run `bun run check` and confirm no regressions (Biome, `astro check`, specs / tokens / wrangler / arch drift checks).
- [x] 5.2 Run `openspec validate vite-dev-proxy-websocket` and confirm clean validation.
- [x] 5.3 Manual browser test: `bun run dev`, open `http://localhost:4320/app/en/`, edit a file in `packages/app/src/`, confirm Vite HMR reloads the page without a full refresh, and confirm no CSP errors in the browser console.
- [x] 5.4 Manual `curl` smoke test: `curl -sI http://localhost:4320/@vite/client` returns `200 OK` with `Content-Type: text/javascript`.
- [x] 5.5 Run the gherkin parity suite scoped to the new scenario: `PLAYWRIGHT_BASE_URL=http://localhost:4320/ bunx playwright test --project=real-route tests/parity/gherkin.spec.ts --grep "@vite/client"` reports 1 passed.