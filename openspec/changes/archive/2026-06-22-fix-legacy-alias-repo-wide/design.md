## Context

The legacy `@/` TypeScript path alias pointed at the pre-monorepo `src/` directory. The Bun-workspaces monorepo skeleton (`add-bun-workspaces-monorepo-skeleton`, archived `2026-06-19-add-bun-workspaces-monorepo-skeleton`) declared `@/` as a compatibility shim to be removed once all files migrated to `packages/*/src/**`. The `extract-app-package` change (archived `2026-06-20-extract-app-package`) moved every file under `src/` into `packages/app/src/`, declared the package-local `~/` alias, and **was supposed to remove `@/` entirely**. It also added the `Legacy @/ Alias Is Removed` requirement to `openspec/specs/app-package/spec.md`.

In practice, the `@/` removal was incomplete:

- `scripts/codemod-remove-legacy-alias.ts` (wired into `bun run check` via `bun run codemod:remove-legacy-alias --verify`) scans **only** `packages/app/src/` and `packages/api/src/`. Files outside those directories keep their `@/` imports unrewritten and unchecked.
- 24+ files outside the codemod's scan roots still import via `@/`:
  - `scripts/seed-operations-smoke.ts` — runtime-broken; `Cannot find module '@/db/client'`.
  - `scripts/check-viewport-meta.ts` — crashes before the string-match runs; it walks the deleted `src/pages/` and uses the stale `@/layouts/base-layout.astro` literal.
  - `tests/architecture/model-tags.test.ts` — runtime-broken; `Cannot find module '@/lib/architecture/tags'`.
  - 21 `.ladle.tsx` story files under `tests/features/**` — Ladle harness fails to load; `bun run ladle`, `bun run test:ladle`, and `bun run ladle:coverage` all break.

The codemod gate is a **false negative**: it passes while the codebase is full of broken `@/` imports. This change finishes the cleanup, extends the codemod's scan surface to the entire repo, and re-verifies every previously-broken tool path end-to-end.

## Goals / Non-Goals

**Goals:**

- Every `@/` import in the repo is rewritten to its post-monorepo package-aware alias (`@unveiled/app/...`, `@unveiled/api/...`, `@unveiled/landing/...`, or `~/...`).
- `scripts/codemod-remove-legacy-alias.ts` scans the entire repository (excluding `node_modules`, `dist`, `.astro`, `_old_app`, `.data`, `.bun`) instead of only two package directories, and its `--verify` mode is a true gate.
- The seed script (`bun run scripts/seed-operations-smoke.ts` and `bun run db:seed:operations-smoke`) runs end-to-end against the local PGlite database.
- The viewport-meta script (`bun run lint:viewport`) walks the post-monorepo `packages/app/src/pages/` and `packages/app/src/components/` paths and reports zero violations.
- The architecture test (`bun test tests/architecture/model-tags.test.ts`) runs end-to-end.
- The Ladle harness (`bun run ladle`, `bun run ladle:build`, `bun run test:ladle`, `bun run ladle:coverage`) loads all 40 stories without `@/` import errors.
- The MODIFIED `Legacy @/ Alias Is Removed` requirement in `openspec/specs/app-package/spec.md` reflects the repo-wide scope and the widened codemod scan.

**Non-Goals:**

- No new user-visible behavior is introduced.
- No new capability specs are created. The change is a pure refactor that finishes what `extract-app-package` started.
- The `~/` alias is not removed or renamed.
- No re-exports are added to `packages/app/src/index.ts` or any other `index.ts`; this change relies on existing re-exports and verifies they cover every rewritten import.
- No migration of `_old_app/`; that tree remains read-only reference and is still excluded from the codemod scan.
- No bump to `@unveiled/*` package versions; no `package.json` edits beyond what the script walk requires.

## Decisions

### Decision: Rewrite `@/...` → `@unveiled/app/...` mechanically; handle edge cases manually

For every audited file outside `packages/app/src/` and `packages/api/src/`, the leading `@/` is replaced with `@unveiled/app/`. This is the only mapping the codemod needs because the audit confirmed every `@/` import resolves to a module under `packages/app/src/`. The one exception is `tests/features/landing/home/landing-hero.ladle.tsx`, which imports `"@/../packages/landing/src/components/landing/landing-hero"` — a pre-monorepo cross-package path. That file is edited manually to read `@unveiled/landing/components/landing/landing-hero`.

**Alternatives considered:**

- *Per-file import resolution via `tsc`.* More correct but slower and adds a runtime dependency on the TypeScript compiler. Rejected: the audit has confirmed the mapping is uniform; a mechanical rewrite is sufficient.
- *Add a temporary `@/` alias back into `tsconfig.base.json`.* Defeats the purpose of the cleanup; the codemod would never converge. Rejected.

### Decision: Extend the codemod's scan to a recursive repo walk (excluding build/cache dirs)

`SCAN_ROOTS` in `scripts/codemod-remove-legacy-alias.ts` is replaced with a single recursive walk rooted at the repo root. The walk skips:

- `node_modules/` (dependency tree)
- `dist/` (build output, all packages)
- `.astro/` (Astro build cache)
- `_old_app/` (read-only legacy reference)
- `.data/` (local PGlite database)
- `.bun/` (Bun cache)

The `LEGACY_ALIAS_RE` regex (`(@/[^"']+)`) stays unchanged. It matches a literal `@/` followed by a path inside a string literal; the slash immediately after `@` prevents matching `@unveiled/...` paths. The `--verify` mode asserts zero matches across the entire scanned surface.

**Alternatives considered:**

- *Add specific roots (`scripts`, `tests`, `architecture`, `openspec`, `docs`).* Explicit but fragile — every new directory that lands in the repo must be added to the allow-list. Rejected in favor of an explicit exclude list, which is more maintainable.
- *Use Biome's scanner.* Biome doesn't have a stable `replace` API and would force the codemod to depend on the formatter. Rejected.

### Decision: Update `check-viewport-meta.ts` walk targets inline

The script's `ROOT` constant changes from `src/pages` (and `src/components`) to `packages/app/src/pages` (and `packages/app/src/components`). The string-match that flags stale imports changes from `'@/layouts/base-layout.astro'` to `'~/layouts/base-layout.astro'`. Both edits are single-line.

**Alternatives considered:**

- *Parameterize the root via an env var.* Adds ceremony for no real benefit; the script is repo-internal. Rejected.
- *Make the script walk every `packages/*/src/pages/`.* Out of scope; change 04 only moved the app's pages, not the API's or the landing's. Rejected.

### Decision: Treat the `landing-hero.ladle.tsx` import as a manual edit

The pre-monorepo path `"@/../packages/landing/src/components/landing/landing-hero"` does not fit the mechanical `@unveiled/app/` rewrite. It is rewritten to `"@unveiled/landing/components/landing/landing-hero"`, which is the canonical landing package alias (the landing package exports its components via `packages/landing/src/index.ts`).

**Alternatives considered:**

- *Rewrite to `../packages/landing/src/components/landing/landing-hero`.* Works for the local Ladle harness but breaks cross-package alias discipline and would be flagged by `bun run lint`. Rejected.

### Decision: No re-exports added

Every rewritten import points to a module that already exists. `packages/app/src/index.ts` re-exports `db/client`, `db/schema`, and `lib/data-access/loaders`; `packages/api/src/index.ts` re-exports `auth-account-actions` and `auth-profile`. The architecture test's `@unveiled/app/lib/architecture/tags` import resolves to `packages/app/src/lib/architecture/tags.ts`. If any of these re-exports are missing during verification, a follow-up edit adds the re-export; this is treated as an implementation detail of the task, not a design decision.

**Alternatives considered:**

- *Audit every `index.ts` upfront and add missing re-exports in this change's design.* Adds scope creep. The verification step (running the seed script, the viewport lint, the architecture test, and Ladle) catches missing re-exports naturally. Rejected.

## Risks / Trade-offs

- **Ladle harness runtime regression after rewriting `.ladle.tsx` imports.** If a rewritten alias does not resolve at Ladle-build time, `bun run ladle:build` fails. Mitigation: every `@/...` import in the audited files resolves to `packages/app/src/...`; the rewritten aliases (`@unveiled/app/...`, `@unveiled/landing/...`) point to the same modules. Manual verification: `bun run ladle:build` succeeds and the static build includes all 40 stories.
- **Architecture test runtime regression.** `tests/architecture/model-tags.test.ts` imports `@/lib/architecture/tags`; the rewritten `@unveiled/app/lib/architecture/tags` must be re-exported from `packages/app/src/index.ts`. Mitigation: the verification step (`bun test tests/architecture/model-tags.test.ts`) catches missing re-exports before the PR merges.
- **Codemod false positive on `@unveiled/...` paths.** The `LEGACY_ALIAS_RE` regex is `(@/[^"']+)`; the leading `@/` must be followed by `/`, which excludes `@unveiled/...`. Verified by the existing test suite; no behavior change.
- **Seed script runtime regression.** The rewritten imports must point to modules that exist in the new packages. Mitigation: `bun run scripts/seed-operations-smoke.ts` is run end-to-end as part of verification; if any import fails to resolve, the failure surfaces immediately.
- **Codemod widened scan could flag long-dormant files.** Files under `architecture/`, `openspec/`, and `docs/` are scanned; if any contain `@/` imports (none currently do per the audit), the gate will surface them. This is the **desired** behavior — the gate must be true — but the apply phase may need to handle a small set of incidental findings. The audit found zero such matches today.
- **Viewport-meta script path-rewrite misses a third party.** If another script somewhere walks `src/pages/` or `src/components/` and was not in the audit, it will silently break later. Mitigation: the codemod gate now scans `scripts/`, so any future `@/` import in any script is caught; the viewport-meta path-rewrite is treated as a one-off fix scoped to the audited files.

## Migration Plan

This change is a pure refactor with no schema, route, or deploy-impact changes. No data migration is required. The migration plan is the same as the task checklist:

1. Rewrite the 5 imports in `scripts/seed-operations-smoke.ts`.
2. Update the walk targets and string-match in `scripts/check-viewport-meta.ts`.
3. Rewrite the 22 imports across `tests/` (1 `.test.ts` + 21 `.ladle.tsx`).
4. Extend `scripts/codemod-remove-legacy-alias.ts` to scan the entire repo.
5. Verify end-to-end (codemod gate, seed script, viewport lint, architecture test, Ladle harness).
6. Archive the change (`openspec archive fix-legacy-alias-repo-wide`) after merging.

Rollback is straightforward: revert the commits, re-add the `@/` paths object entry to `tsconfig.base.json` if needed (the path was removed in change 04, so a rollback restores it), and re-narrow the codemod to its two-package scan. No production deploy changes.

## Open Questions

_None._ The audit is complete, the rewrite mapping is uniform, and every verification command is named in the proposal.
