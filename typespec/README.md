# `typespec/` — OpenAPI 3.1 Contract

This directory is the **single source of truth** for the HTTP and Astro Action
surfaces exposed by the app. Authored in [TypeSpec](https://typespec.io/) and
compiled to:

| Output | Path | Purpose |
| --- | --- | --- |
| OpenAPI 3.1 (YAML) | `typespec/output/openapi.yaml` | **Committed**; the only canonical artifact under `typespec/output/`. The inlined `components.schemas` are the source for the Zod build. |
| Zod validators | `src/lib/generated/request-validators.ts` | **Committed**; one `*Schema` per model. |
| Astro Action shim | `src/lib/generated/actions.ts` | **Committed**; re-exports every `*InputSchema` for the action handlers. |

Nothing else under `typespec/output/` is committed. The previous
`openapi.json` mirror and the 92 per-model JSON Schema files have been
removed from the repo — they were intermediate artifacts and are regenerated
on demand by `bun run specs:gen`.

## Layout

```
typespec/
├── main.tsp              # entry point, @server / @service declaration
├── common.tsp            # scalars, enums, error envelope, pagination
├── auth.tsp              # User, Profile, AuthService, AccountService
├── admin.tsp             # Partner, Event, AdminService.uploadAsset
├── member.tsp            # Booking, WaitlistEntry, SavedEvent, CreditLedgerEntry, surfaces
├── partner.tsp           # partner portal data-access shapes
├── webhooks.tsp          # Stripe payload shapes, WebhookService
├── system.tsp            # HealthService, ReadinessService
├── surfaces.tsp          # DataAccessService + SurfaceService templates
├── astro-actions.tsp     # virtual namespace mirroring src/actions/index.ts
├── tspconfig.yaml        # emitter configuration
├── output/               # openapi.yaml (committed) + .gitkeep
└── README.md             # this file
```

## Adding a new route

1. Add the model + service operation to the matching `*.tsp` file. Use an
   existing namespace where it fits; create a new one only when the
   responsibility is distinct.
2. Add the corresponding operation to `astro-actions.tsp` if it is a typed
   Astro Action (input model only — no `@post` needed; the namespace is
   excluded from the OpenAPI emitter by virtue of not being bound to an HTTP
   route).
3. Run `bun run specs:gen`. This regenerates:
   - `typespec/output/openapi.yaml`
   - `src/lib/generated/request-validators.ts`
4. Commit the regenerated artifacts alongside your `typespec/*.tsp` change.
   The CI step `bun run specs:check` (wired into `bun run check`) will fail
   on drift.

## Drift detection

`bun run specs:check` compiles the TypeSpec project into a temp directory
and diff's the result against the committed artifacts (`openapi.yaml` and
`request-validators.ts`). Run it before pushing a PR to confirm the
committed output is up to date.

## Scripts

- `bun run specs:gen` — compile + post-process (emits `openapi.yaml` and
  `request-validators.ts`).
- `bun run specs:check` — drift detection.
- `bun run specs:client:sdk` — reserved for 09-iteration; no-op stub.

## Known limitations

- `json-schema-to-zod` does not resolve `$ref` to scalar formats, so a field
  typed `Email` becomes `z.any()` in the generated Zod schema. The
  hand-written Zod in `src/lib/forms/schemas.ts` is therefore strictly
  stronger. **The action handlers continue to use the hand-written schemas
  until a future iteration upgrades the build step to resolve `$ref`.**
- `int64` and `utcDateTime` are emitted as `string` to avoid JavaScript's
  53-bit integer limit.
- The served route at `/api/openapi.yaml` returns the document with
  `Content-Type: application/yaml`. Some OpenAPI tooling expects JSON;
  convert with `yq .` or `js-yaml` if needed.
