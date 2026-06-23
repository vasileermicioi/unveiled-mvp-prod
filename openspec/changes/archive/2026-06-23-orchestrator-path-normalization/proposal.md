## Why

The routing orchestrator (the `routing-orchestrator` capability, modeled by `packages/orchestrator/src/worker.ts`) dispatches `url.pathname` with a strict prefix match: `/api/*` → API, `/app/*` → APP, `/healthz` and `/readyz` → orchestrator, and everything else → LANDING. Bare paths like `/en/admin`, `/de`, `/discover`, `/admin`, and `/membership` never start with `/app/`, so the orchestrator forwards them to the landing Worker, which 404s on unknown paths. The canonical URL for these app surfaces is `/app/<lang>/...` (declared by the `routing` capability: "the route table records that the route is mounted at `/app/<lang>/...`"), but the orchestrator has no path normalization layer to redirect non-canonical app-shaped paths to the canonical form. The user-visible consequence (per `opencode-error-prompt.txt`): `http://127.0.0.1:4320/en/admin` → 404. This blocks pre-iteration-04 bookmarks, landing-page links that drop the `/app` base, and Playwright e2e tests that use `baseURL: http://localhost:4320/` and navigate to relative paths.

## What Changes

- **Add `normalizeAppPath(pathname: string, request: Request): string | null`** to `packages/orchestrator/src/index.ts`. The function returns a canonical `/app/<lang>/...` URL when the path matches an "app-shaped" pattern, or `null` when the path should flow through the normal dispatch:
  - **Bare language prefix**: `^/(de|en)(/.*)?$` → `/app$1` (e.g. `/en/admin` → `/app/en/admin`; `/de` → `/app/de`; `/en/` → `/app/en/`).
  - **Bare route segment**: any path in the `APP_BARE_ROUTE_SEGMENTS` set (`/discover`, `/how-it-works`, `/membership`, `/faq`, `/app`, `/onboarding`, `/saved`, `/bookings`, `/profile`, `/partner`, `/admin`) → `/app/<lang><path>` where `<lang>` defaults to `en`, prefers `de` when `Accept-Language` includes `de`, and respects the `unveiled_lang` cookie via `pickLangFromRequest`.
  - **Exclusions (return `null`)**: canonical paths (`/app/...`, `/app`), API paths (`/api/...`), health/readiness (`/healthz`, `/readyz`), Ladle assets (`/ladle/...`), favicon (`/favicon.ico`, `/favicon.svg`), app static assets (`/logos/...`, `/fonts/...`), Vite internals (`/@...`, `/_*`, any path containing `.`).
  - The bare `/` path is NOT normalized — the landing owns `/`.
- **Wire the normalization into `packages/orchestrator/src/worker.ts`**: when `normalizeAppPath` returns a canonical URL, the worker returns `302 Found` with `Location: <canonical>` and the orchestrator's uniform security headers applied. The normalization runs before the `LANDING` fallback branch (after the `/healthz` / `/readyz` handlers, after `/api/*` and `/app/*` dispatch).
- **Mirror the same normalization in the Vite dev proxy** (`packages/orchestrator/src/dev-proxy.ts`): the `dispatchPlugin()` middleware synthesizes a `Request` from the inbound `Accept-Language` and `Cookie` headers, calls `normalizeAppPath`, and returns a `302` redirect when a canonical URL is produced. This ensures manual testing on `http://localhost:4320/en/admin` redirects correctly to `http://localhost:4320/app/en/admin` before reaching the landing dev server.
- **Add unit tests** in `packages/orchestrator/src/worker.test.ts` (one `describe("normalizeAppPath", …)` block, ~21 cases): bare language forms, bare route segments with and without `Accept-Language: de` and `unveiled_lang` cookie, and the full exclusion matrix (canonical, `/api/...`, `/healthz`, `/readyz`, `/ladle/...`, favicon, `/logos/...`, `/fonts/...`, `/@vite/...`, `/_astro/...`, and unknown bare paths like `/foo`).
- **Extend the gherkin coverage** at `tests/features/core-platform/orchestrator/feature.feature` with scenarios asserting `GET /en/admin` → `302` `Location: /app/en/admin`, `GET /de` → `302` `Location: /app/de`, `GET /discover` → `302` `Location: /app/en/discover`, `GET /admin` → `302` `Location: /app/en/admin`, `GET /membership` → `302` `Location: /app/en/membership`, `GET /en/admin/events` → `302` `Location: /app/en/admin/events`, `GET /` → `200` (no normalization), and `GET /app/en/discover` → `200` (canonical path, no redirect).
- **Update the `routing-orchestrator` capability spec** (`openspec/specs/routing-orchestrator/spec.md`) with a new `Requirement: Orchestrator Normalizes App-Shaped Paths To The Canonical Form` block asserting that the orchestrator redirects bare language prefixes and bare route segments to `/app/<lang>/...` with `302 Found` and the orchestrator's security headers, and that the canonical paths, API paths, health probes, Ladle assets, favicon, app static assets, and Vite internals are excluded from normalization.
- **Update the `routing` capability spec** (`openspec/specs/routing/spec.md`) with a new scenario under the `Canonical /[lang]/... Route Table Exists` requirement asserting that a Guest who visits `/en/admin` is redirected to `/app/en/admin` by the orchestrator's path normalization, so the canonical route table is the single source of truth for navigation regardless of how the URL is reached.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `routing-orchestrator`: the orchestrator's dispatch contract is extended with a path normalization layer that redirects bare language prefixes (`/en`, `/de`, `/en/admin`, …) and bare route segments (`/discover`, `/admin`, `/membership`, …) to the canonical `/app/<lang>/...` form with `302 Found` and the orchestrator's uniform security headers. The canonical `/app/...` paths, `/api/...` paths, `/healthz`, `/readyz`, Ladle assets, favicon, app static assets, and Vite internals are excluded from normalization. The Vite dev proxy applies the same normalization so manual testing on the local port-4320 proxy mirrors production behavior.
- `routing`: the canonical `/app/<lang>/...` route table gains a scenario asserting that the orchestrator normalizes any "app-shaped" path (with or without the `/app` base) to the canonical form before dispatch, so a user who visits `/en/admin` lands on `/app/en/admin`.

## Impact

- **New files:** _none net-new_ — the `normalizeAppPath` helper and the `APP_BARE_ROUTE_SEGMENTS` constant are added to the existing `packages/orchestrator/src/index.ts`; the unit tests are added to the existing `packages/orchestrator/src/worker.test.ts`; the gherkin scenarios are added to the existing `tests/features/core-platform/orchestrator/feature.feature`.
- **Modified files:**
  - `packages/orchestrator/src/index.ts` — add `normalizeAppPath` and `APP_BARE_ROUTE_SEGMENTS`; reuse the existing `pickLangFromRequest` helper for cookie / `Accept-Language` resolution.
  - `packages/orchestrator/src/worker.ts` — call `normalizeAppPath` in the dispatch branch that previously fell through to `LANDING`; return `302 Found` with the canonical URL when normalization succeeds.
  - `packages/orchestrator/src/dev-proxy.ts` — call `normalizeAppPath` in the Vite middleware before forwarding; return `302 Found` when normalization succeeds.
  - `packages/orchestrator/src/worker.test.ts` — add the `describe("normalizeAppPath", …)` block.
  - `tests/features/core-platform/orchestrator/feature.feature` — add the eight new scenarios covering bare-language, bare-segment, and no-normalization cases.
  - `openspec/specs/routing-orchestrator/spec.md` — add the new requirement block (and any supporting scenarios).
  - `openspec/specs/routing/spec.md` — add the new scenario under `Canonical /[lang]/... Route Table Exists`.
- **Removed files:** _none._
- **Dependencies changed:** _none._
- **Risks:**
  - **Redirect loops.** A naive implementation could redirect `/app/en/admin` to itself or create a loop. Mitigation: `normalizeAppPath` returns `null` for any path starting with `/app/` or equal to `/app`; the canonical paths bypass normalization entirely.
  - **Language detection on bare segments.** Picking the default `en` for `/discover` may surprise a German-speaking user. Mitigation: `pickLangFromRequest` reads the `unveiled_lang` cookie first, then `Accept-Language`, and falls back to `en` only when both are absent. Unit tests assert all three branches.
  - **Vite HMR endpoints.** Vite uses paths like `/@vite/client`, `/@id/...`, `/node_modules/.vite/...`, `/_astro/...` that the proxy must not rewrite. Mitigation: `normalizeAppPath` excludes any path starting with `/@`, `/_`, or containing `.` (matches the Vite-internal prefix set).
  - **Bare `/` redirect.** `/` is the landing home and MUST NOT be normalized. Mitigation: `/` is excluded by the `langMatch` regex (requires `/de` or `/en` as the first segment, not `/`) and is not a member of `APP_BARE_ROUTE_SEGMENTS`.
  - **Worker / dev-proxy divergence.** If the normalization rules change in one place but not the other, dev and prod will drift. Mitigation: both call sites import `normalizeAppPath` from `packages/orchestrator/src/index.ts`, so the rules live in exactly one place; unit tests cover the function directly.
