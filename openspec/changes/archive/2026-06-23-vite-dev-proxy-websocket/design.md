## Context

The `routing-orchestrator` change introduced the orchestrator Worker and a local dev proxy. The original design (in `routing-orchestrator/design.md`) specified that the dev proxy should be a Vite plugin (`packages/orchestrator/src/dev-proxy.ts`), wired via `vite --config packages/orchestrator/vite.config.ts`. The shipped implementation diverged: `packages/orchestrator/src/dev-server.ts` is a `Bun.serve` HTTP server that runs the production `worker.ts` against a synthesized `env` whose service bindings are replaced with `Fetcher` proxies that use `fetch()` to forward to the three local dev servers.

That proxy has three concrete failures when developing through port 4320:

1. **`Fetcher.connect()` throws.** The Vite dev servers use WebSocket connections for HMR. The `Bun.serve` proxy cannot proxy the upgrade and rejects it (`local dev fetcher does not accept TCP connections`).
2. **No Vite-internal-path support.** Vite's module-resolution paths (`/@vite/`, `/@id/`, `/@fs/`, `/node_modules/`, `/src/`, `/__vite_ping`) do not start with `/api/` or `/app/`, so they fall through to the landing Worker and 404. React islands fail to hydrate.
3. **Production CSP blocks Vite's HMR blob worker** (when CSP is applied). The orchestrator's `Content-Security-Policy` does not include `worker-src`; Vite's HMR blob worker is blocked by the `script-src` fallback.

The implementation has already landed in the working tree: `packages/orchestrator/vite.config.ts`, `packages/orchestrator/src/dev-proxy.ts` (a Vite plugin), and the `dev` script in `packages/orchestrator/package.json` now run Vite against that config. The legacy `Bun.serve` proxy is retained as an export via `package.json` `exports["./dev-server"]` for environments where Vite is unavailable. This change documents the architecture, codifies the spec deltas, and locks in the gherkin coverage.

Stakeholders: anyone running `bun run dev` and editing files in `packages/app/src/` or `packages/landing/src/`. The previous behavior broke HMR and React hydration, so the change unblocks all client-side development through port 4320.

## Goals / Non-Goals

**Goals:**

- Restore Vite HMR when developing through the orchestrator's port 4320 (WebSocket upgrades proxied to the upstream Vite dev server).
- Restore React-island hydration by forwarding Vite-internal paths (`/@vite/`, `/@id/`, `/@fs/`, `/node_modules/`, `/src/`, `/__vite_ping`) to the app's Vite dev server.
- Keep the production CSP / HSTS / security-header policy out of the dev proxy so Vite's blob worker for HMR is not blocked.
- Reuse the orchestrator's existing `normalizeAppPath` so dev parity with production redirects is preserved.
- Retain the `Bun.serve` proxy as an alternative export (no removal, no breaking change to consumers who import it directly).
- Lock in the new behavior with a gherkin scenario (`GET /@vite/client returns 200 text/javascript`).

**Non-Goals:**

- Re-implementing the orchestrator's security header policy in dev. The proxy is a transparent passthrough in dev.
- Replacing the production `wrangler.orchestrator.toml` Worker. The production code path (`packages/orchestrator/src/worker.ts`, `packages/orchestrator/src/index.ts`) is unchanged.
- Changing the dispatch prefixes (`/api/*`, `/app/*`, `/`, etc.) — only adding Vite-internal-path handling and WebSocket upgrade handling.
- Removing the `Bun.serve` proxy. It remains available via `package.json` `exports["./dev-server"]`.

## Decisions

**1. The dev proxy is a Vite plugin, not a `Bun.serve` server.**

Vite already owns the HTTP server lifecycle for the dev experience (HMR client, file watcher, middleware pipeline). A Vite plugin can register an HTTP middleware via `configureServer(server)` and an upgrade handler via `server.httpServer?.on('upgrade', ...)`. This avoids running a second HTTP server in parallel and lets Vite manage port 4320 (with `strictPort: true`, fail-fast on conflict). Alternative: keep `Bun.serve` and add WebSocket/Vite-internal-path handling inside it. Rejected because (a) it duplicates the HTTP listener, (b) `Fetcher.connect()` semantics inside the production `worker.ts` cannot represent a WebSocket upgrade cleanly, and (c) the original design already specified a Vite plugin.

**2. HTTP forwarding uses Node's `http.request`, not `fetch()`.**

Vite's HMR WebSocket upgrade requires forwarding the `Upgrade` and `Connection: upgrade` headers verbatim and writing the upstream's `101 Switching Protocols` response back to the client before piping both socket directions. The Web Fetch API has no first-class support for raw socket upgrade. Node's `http.request({ headers: { ...req.headers, host: target.host } })` exposes the underlying `ClientRequest`, and the `upgrade` event gives us the upstream's `Duplex` socket for bidirectional piping. `fetch()` is kept only inside the `Bun.serve` alternative for plain HTTP. Alternative: `WebSocket` client. Rejected because we need to forward arbitrary headers and frames, not just the data channel.

**3. Vite-internal paths go to the app's Vite dev server.**

The app uses Vite (`@unveiled/app` is an Astro SSR app with React 19 islands), so all module-resolution paths (`/@vite/client`, `/@id/...`, `/@fs/...`, `/node_modules/...`, `/src/...`, `/__vite_ping`) are owned by the app's Vite dev server on port 4321. The landing Astro SSR app does not use Vite's React-island pipeline, so it has no Vite-internal paths. We do not split the dispatch between app and landing by path; Vite-internal paths are hard-routed to the app's upstream. Alternative: forward Vite-internal paths based on whether the page was served by the app or the landing. Rejected because (a) the proxy is stateless and cannot inspect which upstream served the prior HTML, and (b) the landing has no Vite-internal paths so the extra logic would never trigger.

**4. The dev proxy does not apply the production CSP / HSTS / security header policy.**

The orchestrator's production `Content-Security-Policy` does not declare `worker-src`, and Vite's HMR client creates a Web Worker from a `blob:` URL. The browser falls back to `script-src` and blocks the worker. In dev, the orchestrator's CSP adds no security value (the dev hostname is `http://127.0.0.1:4320` and is not exposed publicly) and breaks HMR. The proxy strips it. The app's Vite dev server already sends its own permissive dev headers (`Access-Control-Allow-Origin: *` etc.) which are sufficient. Alternative: add `worker-src blob:` to the production CSP. Rejected because (a) production does not need a blob-worker CSP directive and (b) it would loosen production policy to fix a dev-only problem.

**5. The `Bun.serve` proxy is retained as an alternative export.**

The `Bun.serve` proxy at `packages/orchestrator/src/dev-server.ts` is retained because (a) some CI / sandbox environments may not have Vite available, and (b) the export keeps the code path tested and stable for users who explicitly opt in via `bun --filter @unveiled/orchestrator run dev:bun`. It is no longer the default `dev` script; a header comment at the top of the file documents this. Alternative: delete the `Bun.serve` proxy. Rejected because the alternative provides a useful fallback and the cost is one commented-out file.

**6. `dispatchPlugin()` uses `process.env` for upstream overrides.**

The plugin reads `API_UPSTREAM`, `APP_UPSTREAM`, and `LANDING_UPSTREAM` from `process.env` with the documented defaults (`http://localhost:8787`, `http://localhost:4321`, `http://localhost:4322`). This mirrors the `Bun.serve` proxy's `ORCHESTRATOR_*` env handling and lets contributors point the dev proxy at non-default ports (e.g. when running on a remote dev box or in CI). The defaults match `bun run dev` at the repo root, where the three downstream Workers are started in parallel by `concurrently`.

## Risks / Trade-offs

- **WebSocket upgrade header forwarding is fragile.** A Vite upgrade request carries `Upgrade: websocket`, `Connection: upgrade`, `Sec-WebSocket-Version`, `Sec-WebSocket-Key`, etc. The proxy must forward all of them verbatim. Mitigation: the proxy uses Node's `http.request` with `{ ...req.headers, host: target.host }` — the original headers are forwarded exactly, with only `host` rewritten. Verified by manual browser test (edit a file in `packages/app/src/`, the page hot-reloads without a full refresh) and the gherkin scenario `GET /@vite/client returns 200 text/javascript`.
- **Vite-internal-path collision.** A contributor who manually types `/@vite/client` into the browser URL bar goes to the app's Vite dev server regardless of which upstream served the prior HTML. Mitigation: Vite-internal paths are Vite-specific and the app is the only Vite-using upstream; the landing has no such paths.
- **Port conflict (4320).** Vite's `strictPort: true` causes Vite to fail fast if port 4320 is in use. Mitigation: Vite logs the error and the `bun run dev` script exits non-zero, which is the desired behavior. No silent retry.
- **Dev parity loss for security headers.** The dev proxy does not apply the production CSP / HSTS. Mitigation: dev parity for security headers is a separate concern (the orchestrator's security headers are tested against production only; the `routing-orchestrator` capability spec already explicitly covers the production code path). Dev code paths are tested for behavior, not for the production header policy.
- **`Bun.serve` proxy drift.** Keeping the legacy proxy as an alternative export means it can drift from the Vite plugin (e.g. the prefix list changes in the plugin but not in `dev-server.ts`). Mitigation: the prefix list is small (`/api/`, `/app/`, Vite-internal) and both files are owned by `@unveiled/orchestrator`; a future change can either delete the `Bun.serve` proxy or sync the prefixes. CI does not currently run the `Bun.serve` proxy by default, so divergence is a known acceptable trade-off.

## Migration Plan

The implementation has already landed in the working tree. No migration is required at runtime — `bun run dev` now boots the Vite dev proxy on port 4320 by default. If a contributor is currently using the `Bun.serve` proxy directly (`bun --filter @unveiled/orchestrator run dev:bun` or similar), it continues to work because `dev-server.ts` is retained as an export. Rollback: revert `packages/orchestrator/package.json` `dev` script and `bun run dev` boots the `Bun.serve` proxy again.

## Open Questions

- _None._ The implementation is locked, the spec deltas are scoped, and the gherkin scenario is straightforward (`GET /@vite/client returns 200 text/javascript`).