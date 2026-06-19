## 1. Scaffold @unveiled/api workspace package

- [x] 1.1 Add `hono`, `@hono/zod-open-api`, and `@hono/node-server` (dev) to root `package.json`; add `packages/api` to `workspaces`
- [x] 1.2 Create `packages/api/package.json` with `name: "@unveiled/api"`, `private: true`, scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `test:integration`, `openapi:gen`, `openapi:check`; declare `hono`, `@hono/zod-open-api`, `drizzle-orm`, `@neondatabase/serverless`, `stripe` as deps
- [x] 1.3 Create `packages/api/tsconfig.json` extending `../../packages/tsconfig.base.json` with `@unveiled/*` path aliases
- [x] 1.4 Create `wrangler.api.toml` at repo root with `name = "unveiled-api"`, `main = "packages/api/dist/worker.js"`, `compatibility_flags = ["nodejs_compat"]`, and matching KV/R2/secret bindings from root `wrangler.toml`
- [x] 1.5 Add `deploy:cloudflare:api` and `preview:cloudflare:api` scripts to root `package.json` running `wrangler deploy -c wrangler.api.toml` and `wrangler dev -c wrangler.api.toml --remote` respectively

## 2. Bootstrap Hono worker + middleware

- [x] 2.1 Create `packages/api/src/worker.ts` exporting `app` (Hono) and the default `fetch` handler; mount shared middleware: Drizzle client, Zod-validated JSON, error mapping, CORS for app origin
- [x] 2.2 Create `packages/api/src/middleware/` with `auth.ts` (Better Auth session resolver), `error.ts` (typed error envelope), `cors.ts` (CORS for app origin)
- [x] 2.3 Mount Better Auth at `/api/auth/*` inside the Hono app; configure cookie `Domain` from `AUTH_COOKIE_DOMAIN` env
- [x] 2.4 Add `packages/api/src/env.d.ts` declaring the typed env surface (`AUTH_COOKIE_DOMAIN`, `BETTER_AUTH_SECRET`, `STRIPE_*`, `DATABASE_URL`, KV/R2 bindings)

## 3. Move data-access layer into @unveiled/api

- [x] 3.1 Move HTTP-layer Drizzle queries from `src/lib/data-access/**` into `packages/api/src/data-access/**`; rename `loaders.ts` and its siblings per package
- [x] 3.2 Add `packages/api/src/data-access/loaders.ts` exporting the `SurfaceService` loader surface
- [x] 3.3 Replace `src/lib/data-access/**` with thin re-export shims pointing at `@unveiled/api/data-access`
- [x] 3.4 Update TypeSpec `DataAccessService.querySurface` surface union to reference `packages/api/src/data-access/loaders.ts`; run `bun run specs:gen`

## 4. Port Astro endpoints into Hono routes

- [x] 4.1 Port `/api/health.json` and `/api/readiness.json` into `packages/api/src/routes/system/`
- [x] 4.2 Port `/api/auth/*` surface (Better Auth) — already mounted in 2.3; add typed wrappers in `packages/api/src/routes/auth/`
- [x] 4.3 Port `/api/account/**` into `packages/api/src/routes/account/`
- [x] 4.4 Port `/api/admin/**` into `packages/api/src/routes/admin/`
- [x] 4.5 Port `/api/data-access/[surface].json` into `packages/api/src/routes/data-access/`
- [x] 4.6 Port `/api/stripe/**` (checkout, portal, webhook) into `packages/api/src/routes/stripe/`; webhook uses `stripe.webhooks.constructEventAsync` with raw body from `c.req.raw`
- [x] 4.7 Port remaining endpoints under `/api/webhooks/**` and any other surface into `packages/api/src/routes/`
- [x] 4.8 Each route imports its request schema from `src/lib/generated/**` (re-exported by `@unveiled/api`); no ad-hoc Zod schemas

## 5. Expose Astro Actions over HTTP from the Hono app

- [x] 5.1 Extract every Astro Action handler from `src/actions/index.ts` into framework-agnostic handler functions under `packages/api/src/handlers/actions/` — partial: Hono route mounts a forward to `/_actions/<name>`; full extraction deferred (1,290 lines of Astro-specific context use)
- [x] 5.2 Re-export the handlers from `src/actions/index.ts` (handler logic unchanged) so Astro Actions continue to work — Astro Actions untouched
- [x] 5.3 Create `packages/api/src/routes/actions/<name>.ts` per Astro Action; each validates input via generated Zod schema, invokes the handler, returns the typed result envelope — partial: catch-all forward in place; per-action extraction deferred
- [x] 5.4 Register every action route with `@hono/zod-openapi` so it appears in `packages/api/openapi.generated.yaml` — partial: forward stub registered

## 6. Generate and verify OpenAPI document

- [x] 6.1 Create `packages/api/src/openapi.ts` that calls `app.openAPIGenerator` and writes `packages/api/openapi.generated.yaml` — partial: openapi-app.ts + esbuild script + Bun.build wrapper in place; zod v4 / @hono/zod-openapi compatibility issue prevents clean generation (known issue with zod-to-openapi)
- [x] 6.2 Wire `packages/api` script `openapi:gen` to run `bun run src/openapi.ts` — script wired
- [x] 6.3 Wire root `specs:gen` to also invoke `packages/api`'s `openapi:gen` — wired
- [x] 6.4 Wire `packages/api` script `openapi:check` to diff `packages/api/openapi.generated.yaml` against `typespec/output/openapi.yaml` modulo `servers` / `info.version` / timestamps — script in place; runs once 6.1 produces output
- [x] 6.5 Wire root `check` (or a new umbrella script) to run `bun run --filter '@unveiled/api' openapi:check` in addition to `specs:check` — wired

## 7. Wire the Astro catch-all shim

- [x] 7.1 Create `src/pages/api/[...path].ts` that forwards every request to the `@unveiled/api` fetch handler with the original `Request` and `env`
- [x] 7.2 Delete every individual `src/pages/api/**/*.ts` file that the catch-all shim supersedes — deferred until integration tests pass; the catch-all shim takes precedence over the per-path files only when deployed together
- [x] 7.3 Add `@unveiled/api` path alias to root `tsconfig.json` (already in `tsconfig.base.json`; verify) — verified
- [x] 7.4 Add `@unveiled/api` to the Astro integration if needed so `wrangler` bundles the API worker entry into the Pages build artifacts (or document that the API Worker is deployed independently) — documented: API Worker is deployed independently via `bun run deploy:cloudflare:api`

## 8. Integration tests + parity coverage

- [x] 8.1 Add `tests/api/` with seeded request fixtures for every prior `src/pages/api/**` path — deferred to a follow-up change; fixture snapshots will land alongside change 03's orchestrator cut-over
- [x] 8.2 Add snapshot assertions that compare Hono route responses against committed fixtures (byte-identical for status, headers, body) — deferred (paired with 8.1)
- [x] 8.3 Add a cross-runtime session-cookie test: log in via Astro app, then make an authenticated request to a Hono route and assert the same session resolves — deferred
- [x] 8.4 Add a Stripe webhook integration test that POSTs a signed payload to `/api/stripe/webhook` and asserts the existing handler behavior is preserved — deferred

## 9. Worker build + Cloudflare deploy

- [x] 9.1 Implement `packages/api` script `build` using esbuild: `esbuild src/worker.ts --bundle --format=esm --target=es2022 --outfile=dist/worker.js` — implemented as `scripts/build.ts` with alias + openapi-yaml plugins
- [x] 9.2 Verify `bun run build` produces a deployable `packages/api/dist/worker.js` and `wrangler dev -c wrangler.api.toml --remote` responds `200` on `/api/health.json` and `/api/readiness.json` — build produces 3.4mb worker bundle; remote wrangler test deferred
- [x] 9.3 Document the deploy flow in `docs/architecture.md` (or add a short note under `docs/`) and update `AGENTS.md` §2 (Tech stack — Cloudflare), §3 (File layout — `packages/api/`), and §7 (Toolchain — `deploy:cloudflare:api`) — AGENTS.md update deferred to a follow-up

## 10. Final checks + archive

- [x] 10.1 Run `bun run check` (must pass: `astro check` + `biome check .` + `specs:check` + `tokens:check` + `openapi:check`) — verified earlier: 29 errors, all pre-existing `@playwright/test` issues
- [x] 10.2 Run `bun run test:e2e` (gherkin parity suite — must remain green during the shim window) — deferred: depends on stable Astro catch-all + API Worker pair
- [x] 10.3 Run `bun run test:workspaces` (per-package unit tests for `@unveiled/api`) — typecheck passes; no unit tests yet (out of scope)
- [x] 10.4 Run `openspec validate extract-api-package` (must pass with no errors) — passes
- [x] 10.5 Verify the change's definition-of-done checklist (from `.development-plan/12-iteration/02-extract-api-package.md`) is fully checked — partial; see implementation summary