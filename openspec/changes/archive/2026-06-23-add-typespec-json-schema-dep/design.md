## Context

`bun run specs:check` and `bun run specs:gen` both invoke the TypeSpec compiler (`tsp compile`) over `typespec/main.tsp` and its imports to validate the contract source and regenerate the committed OpenAPI document. The TypeSpec source already imports `@typespec/json-schema` in 9 `.tsp` files (e.g. `typespec/main.tsp`, `typespec/common.tsp`, `typespec/auth.tsp`, `typespec/admin.tsp`, `typespec/member.tsp`, `typespec/partner.tsp`, `typespec/webhooks.tsp`, `typespec/system.tsp`) to access JSON Schema-specific decorators. The root `package.json` `devDependencies` already declares `@typespec/compiler`, `@typespec/http`, `@typespec/http-server-js`, and `@typespec/openapi3`, but `@typespec/json-schema` was never added. `tsp compile` therefore fails with `import-not-found: Couldn't resolve import "@typespec/json-schema"` (29 errors total) on every run, so `bun run check` (which fans out to `bun run specs:check`) is broken at the contract gate.

The constraint set: the TypeSpec source is the source of truth (`AGENTS.md` §2, §5), generated artifacts under `typespec/output/` and `src/lib/generated/` are committed, and `bun run specs:check` is the drift gate wired into `bun run check`. Adding a TypeSpec library therefore has to be a single, scoped edit to `package.json` plus a `bun install` — there is no `tspconfig.yaml` registry to update, and the library is consumed by the compiler rather than the application runtime, so it lives under `devDependencies` (not `dependencies`).

## Goals / Non-Goals

**Goals:**

- Add `@typespec/json-schema` to the root `package.json` `devDependencies` at a version aligned with the other `@typespec/*` packages.
- Refresh `bun.lock` via `bun install` so the package is resolvable.
- Restore `bun run specs:check` to a clean run (zero `import-not-found` errors).
- Restore `bun run specs:gen` so the committed `typespec/output/openapi.yaml` and the re-exported validators module can be regenerated.

**Non-Goals:**

- Editing any `.tsp` source under `typespec/**`.
- Editing any committed generated artifact (`typespec/output/**`, `src/lib/generated/**`) by hand — the regenerated output is the artifact under test.
- Changing the version pin of the other `@typespec/*` packages or touching `tspconfig.yaml`.
- Adding the package to `dependencies` (it is a compiler-time dependency only).
- Adding a CI guard that scans `.tsp` files for imports and asserts each is declared in `package.json` — that is a follow-up, not part of this fix.

## Decisions

- **Pin `@typespec/json-schema` to `^1.13.0`.** The other `@typespec/*` packages (`@typespec/compiler`, `@typespec/http`, `@typespec/openapi3`) are on the `1.x` line; pinning to `^1.13.0` keeps Bun's resolver in the same major and lets it pick the matching minor that is already compatible with the rest of the emitter chain. Caret gives Bun freedom to resolve the latest compatible patch, which keeps the install lockfile deterministic-ish without forcing a hand-picked version.
  - *Alternatives considered:*
    - **Pin to an exact version (`1.13.0`).** Rejected — the other `@typespec/*` packages use caret ranges, so an exact pin would be inconsistent and would require manual bumps for every patch.
    - **Pin to `latest` / `*`.** Rejected — `bun install` would then resolve to whatever is current, which can drift between developer machines and CI.
- **Install under `devDependencies`, not `dependencies`.** `@typespec/json-schema` is consumed by `tsp compile` (a build-time tool), never imported by the Astro app or the API Worker at runtime. `devDependencies` is the correct home and keeps the production bundle (and Cloudflare Worker deploy size) unchanged.
  - *Alternatives considered:*
    - **Install under `dependencies`.** Rejected — the package is not referenced from any production code path, so this would unnecessarily bloat `bun install --production` and Cloudflare Workers dependency tracking.
- **Regenerate via `bun run specs:gen`, do not hand-edit artifacts.** `typespec/output/openapi.yaml` and the re-exported validators module are committed; the only way to update them consistently is to rerun the emitter. This is the contract documented in `AGENTS.md` §2 and §5.
  - *Alternatives considered:*
    - **Hand-edit `typespec/output/openapi.yaml` to suppress the import-not-found noise.** Rejected — the file is generated, the linter is configured to skip it (per the `openapi-contract` spec), and any hand-edit would be wiped by the next emitter run.
- **No new CI guard, just the existing `specs:check` gate.** The existing `bun run check` → `bun run specs:check` chain will catch any future `import-not-found` regression once the dependency is declared; we don't need a parallel scanner in this change.
  - *Alternatives considered:*
    - **Add a `bun scripts/check-typespec-imports.ts` script.** Deferred — adds maintenance for a regression that the emitter already detects; revisit only if drift shows up again.

## Risks / Trade-offs

- **Version mismatch with the rest of the `@typespec/*` chain.** The TypeSpec source may expect behavior from a specific minor of `@typespec/json-schema`. → Mitigation: `^1.13.0` resolves to the latest compatible patch; `bun run specs:check` will surface any peer-dependency warning immediately. If a hard mismatch shows up, downgrade to the exact minor pinned by the upstream `@typespec/http` or `@typespec/openapi3` package.
- **`bun.lock` churn.** Adding the package rewrites the lockfile, which can produce a noisy diff. → Mitigation: the lockfile change is expected and is the audit trail for the install; review only the lines that introduce `@typespec/json-schema`.
- **Generated artifact drift after `bun run specs:gen`.** Re-running the emitter may produce incidental whitespace or ordering changes in `typespec/output/openapi.yaml`. → Mitigation: the diff should be reviewed as a single commit, not split across commits, so reviewers see the install + the regen together.
- **Future regressions if another `.tsp` file imports a library not in `package.json`.** The drift gate will still flag it (`import-not-found`), but only at `bun run specs:check` time, not at PR-open time. → Mitigation: the `MODIFIED` requirement under `openapi-contract` makes the zero-error expectation explicit; a follow-up change can add a proactive import scanner if the recurrence justifies it.

## Migration Plan

This change is fully reversible and has no deploy ordering concerns (it is a `devDependencies` addition). Roll-out:

1. Edit `package.json` to add `"@typespec/json-schema": "^1.13.0"` under `devDependencies`, alphabetically grouped with the other `@typespec/*` packages.
2. Run `bun install` to refresh `bun.lock` and the workspace `node_modules/.bun/`.
3. Run `bun run specs:check` locally and confirm the TypeSpec compiler reports zero errors (specifically zero `import-not-found` errors).
4. Run `bun run specs:gen` and commit the regenerated `typespec/output/openapi.yaml` (and the re-exported validators module if it changed).
5. Run `bun run check` to confirm the umbrella gate (including `specs:check`, `tokens:check`, `arch:check`, Biome, `astro check`) passes.

Rollback: revert the `package.json` change and `bun install`. `bun.lock`, `typespec/output/openapi.yaml`, and the re-exported validators module revert in the same revert. There are no runtime side effects and no migrations to undo.

## Open Questions

- None. The dependency addition is mechanical, the version pin follows the existing convention, and `bun run specs:check` is the authoritative gate.