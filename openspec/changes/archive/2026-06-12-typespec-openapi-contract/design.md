## Context

The project currently exposes two parallel network surfaces that share no machine-readable contract:

1. **Astro Actions** at `src/actions/index.ts` — typed only in TypeScript via `defineAction({ ..., input: SomeZodSchema })`. They are not externally callable and have no public schema.
2. **HTTP endpoints** at `src/pages/api/` — hand-written Zod schemas in `src/lib/action-contracts.ts` for some endpoints, ad-hoc `Response.json(...)` for others, and the Better Auth handler which uses its own runtime contract.

The Astro Action surface and the HTTP surface are both part of the app's contract with itself and (for HTTP) with external callers. Today there is no single source of truth: a schema change can be made in `action-contracts.ts` without updating a documentation page, a partner client SDK cannot be generated, and a Cloudflare Worker boundary validator cannot be derived from the source.

This change introduces a TypeSpec-authored OpenAPI 3.1 contract that covers the HTTP surface and (as a virtual namespace) the Astro Action surface. The contract is checked into the repository so PR reviewers can diff it, and a `specs:check` script fails CI when the generated artifacts are out of sync with the TypeSpec source.

The goal of this change is purely a contract refactor — no runtime behavior changes. The output of this change becomes the foundation for 09-iteration work (typed client SDKs, partner/admin SPAs) and the gherkin feature files.

## Goals / Non-Goals

**Goals:**

- Introduce a `typespec/` project at the repo root containing the canonical contract for every HTTP route under `src/pages/api/` and a virtual `AstroActions` namespace for every action under `src/actions/index.ts`.
- Define TypeSpec models for every domain entity exposed over the wire (User, Profile, Partner, Event, Booking, WaitlistEntry, CreditLedgerEntry, SavedEvent, Subscription, PaymentMethod, BillingAddress, JobSendLog, ProviderEvent, plus enums for roles, statuses, ticket types, etc.).
- Emit `typespec/output/openapi.yaml` and `typespec/output/openapi.json` as **committed** artifacts; serve `openapi.json` at `/api/openapi.json` for auditors and downstream codegen.
- Emit `src/lib/generated/openapi-types.ts` (type-only) so `src/lib/action-contracts.ts` and gherkin step parameter types can import directly from the contract.
- Emit `src/lib/generated/request-validators.ts` (Zod schemas built from the JSON Schema emitter) so every API route parses its input through the same generated validator.
- Add `bun run specs:gen` and `bun run specs:check` scripts; the latter is wired into `bun run check` and fails when the committed output is out of date with the source.
- Replace ad-hoc request parsing in every `src/pages/api/**` route with the generated Zod validator.
- Add the `openapi-contract` capability spec under `openspec/specs/openapi-contract/spec.md` describing drift rules, emitter output, and the contract's role in the build.

**Non-Goals:**

- Replacing Better Auth's runtime contract with TypeSpec-generated code (the auth library is responsible for its own session/token shapes; we model only the high-level request/response envelopes of the auth-flavored routes that the app adds on top).
- Generating a client SDK in this change (the emitter is wired so SDK generation is a one-liner in 09-iteration; we do not add a build step here).
- Adding runtime request validation to Astro Actions via the generated Zod schemas (the action handlers import the generated schemas for input parsing only — the Action envelope and its `safe`/`data` shape remain Astro Action's responsibility).
- Documenting internal data-access loader shapes as a public HTTP contract; the data-access route is a thin server-side proxy and its shape is not a commitment to third parties (modeled as parametric surface in TypeSpec, treated as internal).
- Modeling legacy pagination, error, or response shapes that do not exist on any current route.
- Migrating `src/lib/action-contracts.ts` to remove every hand-written Zod in a single pass; the migration is iterative and is governed by the `specs:check` drift rule.

## Decisions

### 1. TypeSpec as the contract source of truth

**Decision:** Author the contract in TypeSpec (`.tsp` files) under `typespec/`, with the `main.tsp` file importing per-domain sub-files (`auth.tsp`, `admin.tsp`, `member.tsp`, `partner.tsp`, `webhooks.tsp`, `system.tsp`, `common.tsp`).

**Rationale:** TypeSpec is a TypeScript-flavored DSL with first-class OpenAPI 3.1, JSON Schema, and Zod emitters, and its syntax is familiar to the team. A single source produces every downstream artifact (OpenAPI document, JSON Schema, Zod validators, type-only TypeScript), so the contract cannot drift between formats.

**Alternatives considered:**

- Hand-written OpenAPI YAML — drifts the moment a route changes; rejected.
- JSON Schema authored directly — loses the service-interface abstraction and the emitter ecosystem; rejected.
- Zod-only with `zod-to-openapi` — the conversion is lossy and the DSL ergonomics are weaker; rejected.

### 2. Committed generated artifacts, not just-in-time generation

**Decision:** Commit `typespec/output/openapi.yaml`, `typespec/output/openapi.json`, `src/lib/generated/openapi-types.ts`, and `src/lib/generated/request-validators.ts` to the repository.

**Rationale:** PR reviewers must be able to diff contract changes without running the emitter. Drift between source and committed output is detected by `bun run specs:check`, which is wired into `bun run check` and fails CI on out-of-date output.

**Alternatives considered:**

- Generated at build time only — hides the contract from PR review and forces a full TypeSpec toolchain install for every consumer; rejected.
- Committed as a CI artifact only — same downside, plus it cannot be imported from `src/lib/generated/...` at build time; rejected.

### 3. Astro Actions modeled as a virtual namespace

**Decision:** Astro Actions are modeled in TypeSpec as a virtual `AstroActions` namespace — the operations are typed but not exposed as HTTP routes. The emitter produces a `src/lib/generated/actions.ts` that re-exports the generated input schemas and result types for use in `src/actions/index.ts`.

**Rationale:** Astro Actions are not externally callable, so they should not appear in the public OpenAPI document. Modeling them in TypeSpec keeps the input shapes in the same single source of truth as the HTTP routes, while the runtime envelope (the `safe`/`data` shape) remains Astro Action's responsibility.

**Alternatives considered:**

- Leave Astro Actions out of the contract — the `forms-actions` capability already requires typed inputs, and the only way to keep the typed inputs honest is to derive them from the same source; rejected.
- Expose Astro Actions in `openapi.json` — they are not callable over HTTP, so exposing them would mislead consumers; rejected.

### 4. Zod validators for request validation, types for response typing

**Decision:** Use the JSON Schema emitter + `json-schema-to-zod` to produce a Zod schema per operation input, exposed as `src/lib/generated/request-validators.ts`. Use the TypeScript type emitter for response types, exposed as `src/lib/generated/openapi-types.ts`. Routes import the Zod schema for parsing and the TypeScript type for the response body.

**Rationale:** Zod is already the project's validation library; reusing it keeps the error envelope consistent with the existing hand-written Zod schemas. TypeScript types are the natural fit for response bodies because the response is shaped by the handler logic, not validated at the boundary.

**Alternatives considered:**

- Use `@typespec/http-server-js` to generate a full request/response validator middleware — adds another emitter and an indirection layer the team does not need yet; rejected for this change (kept on the menu for 09-iteration if the team wants route-level middleware validation).
- Validate responses at the boundary — over-constrains the handlers and is unnecessary; rejected.

### 5. Parametric `Surface` and `data-access` service

**Decision:** Model `SurfaceService.<surface>` as a TypeSpec template per export of `src/lib/data-access/loaders.ts`, and `DataAccessService.querySurface` as a single parametric operation whose `surface` parameter is one of the registered surfaces.

**Rationale:** The data-access surface is a thin server-side proxy, not a public HTTP contract — its shape is a function of the loaders it wraps. Modeling each loader as a TypeSpec template and the proxy as a parametric operation keeps the contract honest without committing to a public per-surface HTTP shape.

**Alternatives considered:**

- Model the data-access route as an untyped `unknown` — defeats the purpose of the contract; rejected.
- Model each surface as a separate HTTP route — would change the runtime surface area; rejected.

### 6. Webhook signature is verified before schema validation

**Decision:** The Stripe webhook handler MUST verify the signature against the configured Stripe webhook secret before validating the payload against the generated Zod schema, and MUST reject the request without mutating state on either failure.

**Rationale:** The schema can confirm the payload is well-formed, but only Stripe's signature can confirm it is authentic. The order matters: a forged payload is rejected first, so the validator never sees attacker-controlled data without an authenticity check.

**Alternatives considered:**

- Validate first, then verify signature — leaks parser error information to unauthenticated callers; rejected.

### 7. New scripts: `specs:gen`, `specs:check`, `specs:client:sdk`

**Decision:** Add three scripts to `package.json`:

- `bun run specs:gen` — runs `tsp compile typespec/main.tsp` and writes output into `typespec/output/` and `src/lib/generated/`.
- `bun run specs:check` — runs the same compile into a temp directory and `diff`s the result against the committed artifacts; exits non-zero on drift.
- `bun run specs:client:sdk` — reserved for 09-iteration; not implemented in this change but wired so the script exists.

**Rationale:** Drift detection is the only way to keep the contract reviewable. The check is wired into `bun run check` so a PR cannot land a route change without updating the contract.

**Alternatives considered:**

- Check drift only on CI, not locally — hides drift from the developer who introduced it; rejected.
- Skip the check on feature branches — invites drift to accumulate; rejected.

### 8. Biome and OpenSpec config ignore generated output

**Decision:** Update `biome.json` to ignore `typespec/output/**` and `src/lib/generated/**`, and update `openspec/config.yaml` to include a `context:` block pointing reviewers at the TypeSpec source so AI-assisted change authoring knows to read the contract.

**Rationale:** Generated files should not be lint-formatted (they will be reformatted by the emitter) and should not be reviewed for style. The OpenSpec context block is a low-cost way to keep AI-assisted authoring consistent with the contract.

**Alternatives considered:**

- Lint generated output — every emitter run would touch hundreds of files; rejected.

## Risks / Trade-offs

- **Generated files in PR diffs** → Generated output is committed so the contract is reviewable, but this means a contract change produces a large diff. Mitigation: the diff is expected to be the bulk of the PR for contract changes and is split by emitter (types, validators, document).
- **TypeSpec toolchain install size** → The `typespec` CLI and emitters are added to `devDependencies`, which adds to `bun install` time. Mitigation: only used by `specs:gen` / `specs:check`, not at runtime.
- **Drift between `action-contracts.ts` and generated schemas** → During migration, some routes still use hand-written Zod. The `specs:check` script does not catch this drift on its own. Mitigation: a separate `action-contracts` audit task in 09-iteration, and a note in the `forms-actions` capability spec.
- **Generated Zod validators are weaker than hand-written ones** → `json-schema-to-zod` does not resolve `$ref` to scalar formats, so a field typed `Email` becomes `z.any()` in the generated Zod schema. The hand-written Zod in `src/lib/forms/schemas.ts` (e.g. `signupSchema`) is strictly stronger. **For this iteration the generated validators are emitted and committed, but the runtime handlers continue to use the hand-written schemas.** The generated `actions.ts` shim re-exports the generated schemas so a future iteration can swap them in once `json-schema-to-zod` resolves `$ref` correctly (or once the build step is replaced with a TypeSpec-aware Zod emitter).
- **Schema-only validation is not enough for safety** → The Zod schemas catch malformed input but not semantic authorization. The route handler is still responsible for the auth check. Mitigation: keep the existing auth helpers in the route; the contract is the schema, not the policy.
- **Public R2 URL change for `openapi.json`** → Auditors may bookmark the served URL; the document changes when the contract changes. Mitigation: serve via a versioned path (e.g. `/api/openapi.json` returns the latest) and document the contract versioning policy in the `openapi-contract` spec.
- **Better Auth shapes not generated** → Better Auth owns its own internal contract; the TypeSpec models the high-level request/response envelopes of `/api/account/{login,logout,signup,password-recovery}` but does not generate the runtime session/cookie code. Mitigation: the route layer still uses Better Auth's handler; the contract documents the public shape.
