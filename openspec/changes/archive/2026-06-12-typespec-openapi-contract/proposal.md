## Why

The project exposes two distinct network surfaces:

1. **Astro Actions** under `src/actions/index.ts` (typed RPC, not externally callable)
2. **HTTP endpoints** under `src/pages/api/` (Better Auth handler, `/api/health.json`, `/api/readiness.json`, `/api/account/login`, `/api/account/logout`, `/api/account/signup`, `/api/account/password-recovery`, `/api/admin/assets/upload`, `/api/data-access/[surface].json`, `/api/stripe/webhook`)

Neither surface has a machine-readable contract. Astro Actions are typed only in TypeScript, and the API endpoints mix hand-written Zod schemas (`src/lib/action-contracts.ts`) with ad-hoc `Response.json` calls. This is fine while one developer owns the codebase, but blocks:

- Generating a typed client SDK for the partner check-in PWA, the admin SPA, or future native shells.
- Validating requests/responses at the Cloudflare Worker boundary.
- Documenting the public contract for auditors (Stripe webhook payloads, GDPR data exports).
- Driving the gherkin feature files (proposal `04-gherkin-specs-by-domain.md`) from a single source so feature steps cannot drift from the schema.

TypeSpec compiles a TypeScript-flavored DSL into OpenAPI 3.1, JSON Schema, client SDKs, and (via `@typespec/http-server-js`) Astro/Cloudflare request/response validators. The output is checked into the repo so the contract is reviewable in PRs, and re-generated as part of `bun run check` to detect drift.

This proposal introduces the TypeSpec project, codifies the entire HTTP surface (and a parallel "Astro Action" virtual surface for completeness), and wires generated types into `src/lib/action-contracts.ts` and Astro middleware so every request is validated against the same model.

## What Changes

- Add `typespec` and the relevant emitters (`@typespec/http`, `@typespec/openapi3`, `@typespec/json-schema`, `@typespec/http-server-js`) to `devDependencies`.
- Create `typespec/main.tsp` (or split: `typespec/common.tsp`, `typespec/auth.tsp`, `typespec/admin.tsp`, `typespec/member.tsp`, `typespec/partner.tsp`, `typespec/webhooks.tsp`, `typespec/system.tsp`).
- Define models for every domain entity exposed over the wire (User, Profile, Partner, Event, Booking, WaitlistEntry, CreditLedgerEntry, SavedEvent, Subscription, PaymentMethod, BillingAddress, JobSendLog, ProviderEvent, plus enums for roles, statuses, ticket types, etc.).
- Define service interfaces for every HTTP route in `src/pages/api/`:
  - `AuthService.signup / login / logout / passwordRecovery`
  - `AccountService.{getMe, updateProfile, deleteAccount}` (future, modeled now for 09-iteration)
  - `DataAccessService.querySurface` (parametric on `surface`)
  - `AdminService.uploadAsset` (multipart)
  - `WebhookService.stripe` (signed)
  - `SystemService.health / readiness`
  - `SurfaceService.<surface>` (one per `src/lib/data-access/loaders.ts` export)
- Mirror the Astro Action surface as a virtual `AstroActions` namespace — operations are typed but not exposed externally; the emitter produces a `src/lib/generated/actions.ts` that the action handler imports for input parsing.
- Emit `typespec/output/openapi.yaml` and `typespec/output/openapi.json` (committed, served at `/api/openapi.json`).
- Emit `src/lib/generated/openapi-types.ts` (type-only, used by `src/lib/action-contracts.ts` and by the gherkin spec types).
- Emit `src/lib/generated/request-validators.ts` (Zod schemas built from JSON Schema) used by every API route.
- Add `bun run specs:gen` and `bun run specs:check` scripts; the check fails if the committed output is out of date.
- Replace ad-hoc request parsing in each `src/pages/api/**` route with the generated Zod validator.
- Add `openspec/specs/openapi-contract/spec.md` (new capability) describing the contract and drift rules.

## Capabilities

### New Capabilities

- `openapi-contract`: A TypeSpec-authored OpenAPI 3.1 contract covering all HTTP routes and (virtually) all Astro Actions. The contract is generated on every `bun run check` via `bun run specs:check`, served at `/api/openapi.json`, and used as the single source of truth for request validation, response typing, and gherkin step parameter shapes.

### Modified Capabilities

- `data-access`: Each surface query MUST be representable in the OpenAPI contract; the contract description is the source of truth for the loader's input schema.
- `payments-subscriptions`: Stripe webhook payloads and Stripe API client response shapes are typed in TypeSpec; the webhook handler MUST validate the inbound payload against the generated Zod schema before processing.
- `forms-actions`: Astro Action inputs MUST be parsed via the generated Zod schema; hand-rolled Zod schemas in `src/lib/action-contracts.ts` are replaced by `import { Action } from "@/lib/generated/actions"`.

## Impact

- New devDeps: `typespec`, `@typespec/http`, `@typespec/openapi3`, `@typespec/json-schema`, `@typespec/http-server-js`, `@typespec/compiler`.
- New files: `typespec/**`, `typespec/output/**`, `src/lib/generated/**`, `src/pages/api/openapi.json.ts`.
- New scripts: `specs:gen`, `specs:check`, `specs:client:sdk`.
- Modified files: every route under `src/pages/api/**`, `src/lib/action-contracts.ts`, `src/actions/index.ts`, `package.json`, `biome.json` (ignore `typespec/output/**`, `src/lib/generated/**`), `openspec/config.yaml` (point at TypeSpec output for context).
- Generated output is committed so PR reviewers can diff contract changes; `specs:check` ensures it matches the source.
- No runtime feature change in this iteration — the goal is to make the contract reviewable and reusable for 09-iteration and the future partner/admin SDKs.
