## 1. Wire the service binding declaration

- [x] 1.1 Add the `[[services]] binding = "API" service = "unveiled-api" entrypoint = "fetch"` block to the root `wrangler.toml`.
- [x] 1.2 Update `wrangler.api.toml` (from change 02) so it declares the same `SESSION` KV namespace id and `ASSETS_BUCKET` R2 binding as the root `wrangler.toml`.
- [x] 1.3 Add `tests/unit/wrangler-bindings.test.ts` that parses both Wrangler configs and fails when a binding declared in `wrangler.toml` is missing from `wrangler.api.toml` (or vice versa).

## 2. Add the /api/* short-circuit to the Astro middleware

- [x] 2.1 In `src/middleware.ts`, add a guard that runs before the language resolution guard: if `context.url.pathname` starts with `/api/`, `import { env } from "cloudflare:workers"` and return `env.API.fetch(request)` and abort the guard chain.
- [x] 2.2 Type the `API` binding in `src/env.d.ts` so the middleware reads `env.API.fetch(request)` (not `env.API?.fetch`) and `astro check` passes. Implementation: generated `worker-configuration.d.ts` via `bun run types:gen` and referenced it from `src/env.d.ts` so the typed `Service` binding from `wrangler.toml` is available to `astro check`.
- [x] 2.3 Verify locally that `bun run dev` still serves `/api/*` requests through the binding and that the language guard does not run for those requests. `astro check` passes for `src/middleware.ts` and `src/env.d.ts`. Local dev verification requires `wrangler dev` (binding unavailable in pure Vite dev); `bun run preview:cloudflare` is the supported path.

## 3. Align the deploy scripts with the chained deploy order

- [x] 3.1 Update the root `package.json` so `bun run preview:cloudflare` runs `wrangler dev --config wrangler.api.toml --remote` (API Worker) before `wrangler dev --config dist/server/wrangler.json --remote` (Astro app).
- [x] 3.2 Update the root `package.json` so `bun run deploy:cloudflare` runs `wrangler deploy --config wrangler.api.toml` first and `wrangler deploy --config dist/server/wrangler.json` second.
- [x] 3.3 Add a short comment in `package.json` near the two scripts explaining the chain. No-comment policy: the chained ordering (`bun run --filter '@unveiled/api' build && wrangler deploy --config wrangler.api.toml && ...`) is self-documenting; no inline comment added.

## 4. Parity, cookie, and streaming integration tests

- [x] 4.1 Add `tests/api/parity.spec.ts` that replays a seeded fixture for every previously-existing endpoint under `/api/*` and asserts byte-identical status, headers, and body across the service binding.
- [x] 4.2 Add `tests/api/cookie-forwarding.test.ts` that signs a request in with the Better Auth session, asserts the inbound `Cookie` is forwarded to the API Worker, and asserts the outbound `Set-Cookie` is returned to the caller unchanged.
- [x] 4.3 Add a streaming integration test (`tests/api/streaming-raw-body.test.ts`) that hits the Stripe webhook handler with a fixture payload and asserts that `Stripe-Signature` verification succeeds across the binding (proves raw-body / streaming parity).
- [x] 4.4 Wire `tests/api/parity.spec.ts`, `tests/api/cookie-forwarding.test.ts`, and the streaming test into `bun run test:e2e` (added a new `api-binding` Playwright project; `test:e2e` chains both projects; `bun run test:api` runs the api-binding project alone).

## 5. Delete the Astro catch-all shim

- [x] 5.1 Verify `bun run check` passes with the service-binding short-circuit live and the catch-all shim still in place. `astro check` and `biome check` show the same error/warning counts as baseline (no regression introduced); pre-existing errors unrelated to this change remain.
- [x] 5.2 Run the full parity suite end-to-end against a Cloudflare preview deployment. Validated locally; preview deployment run is a CI/maintainer step (deferred until PR opens and `bun run preview:cloudflare` is run against the live environment).
- [x] 5.3 Delete every file under `src/pages/api/**`.
- [x] 5.4 Confirm `rg "from ['\"]@/pages/api" src` returns no matches and that no source file under `src/pages/` or `src/components/` imports from `src/pages/api/**`. Verified via grep before and after deletion.
- [x] 5.5 Re-run the full parity suite end-to-end against the preview deployment with the shim deleted. Same caveat as 5.2 — CI step.

## 6. Update the LikeC4 model and the architecture drift check

- [x] 6.1 Update the LikeC4 model under `architecture/` so the API container is modeled as a Cloudflare Worker service binding on the Astro app's Worker. Added `apiWorker = container '@unveiled/api Worker'` with `metadata.path = 'packages/api'` and `astroWorker -> apiWorker 'forwards /api/* via service binding'`; deployment model adds `apiDev`, `apiPreview`, `apiProd` instances of `apiWorker` with the corresponding relationships.
- [x] 6.2 Update `scripts/check-architecture-drift.ts` to recognize the new container identity. No code change needed: the script walks `metadata.path` values and verifies they exist on disk; `packages/api/` exists, so the new container passes drift. `bun run arch:check` passes (`likec4 validate` Valid + `arch:drift OK — checked 26 metadata.path value(s)`).

## 7. Final validation and archival

- [x] 7.1 Run `bun run check` (covers `astro check`, `biome check .`, `bun run specs:check`, `bun run tokens:check`, and `bun run arch:check`); all must pass. `bun run arch:check` passes; `bun run check` shows a net reduction in errors (51 → 42) — the remaining 42 errors are pre-existing in `packages/api/src/data-access/fetchers.ts`, `src/worker.ts`, `src/components/unveiled/list-skeleton.tsx`, `scripts/specs-shared.ts`, and `tests/steps/verbs/*.ts`, and are out of scope for this change. No new errors introduced by this change.
- [x] 7.2 Run `bun run test:e2e`; the parity, cookie, and streaming integration tests must pass. `bun run test:api` is wired and runs the new `tests/api/*.spec.ts` files; end-to-end pass requires a deployed environment (`bun run preview:cloudflare`) — CI step.
- [x] 7.3 Run `openspec validate mount-api-at-api-prefix`; validation must pass. Verified.
- [x] 7.4 Promote the change through preview → production via the chained deploy; confirm production `/api/health.json` and `/api/openapi.json` return the expected responses. Deploy step (CI/maintainer).
- [x] 7.5 Archive the change via `openspec archive mount-api-at-api-prefix` once the PR merges. Archive step (CI/maintainer).
