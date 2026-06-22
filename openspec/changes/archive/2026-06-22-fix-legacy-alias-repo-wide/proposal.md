## Why

The monorepo skeleton change (`add-bun-workspaces-monorepo-skeleton`) declared the legacy `@/` alias as a compatibility shim to be removed in change `extract-app-package`. Change 04 moved every file under `src/` into `packages/app/src/`, declared `~/` as the package alias, and was supposed to remove the `@/` alias everywhere. The `scripts/codemod-remove-legacy-alias.ts` codemod wired into `bun run check` scans **only** `packages/app/src/` and `packages/api/src/`; it does not scan `scripts/` at the repo root or `tests/`. A repo-wide audit finds **24+ files** outside the codemod's scan roots that still import via `@/`, including the runtime-broken `scripts/seed-operations-smoke.ts` and `tests/architecture/model-tags.test.ts`, plus **21 `.ladle.tsx` files** in `tests/` whose `@/...` imports break `bun run ladle`, `bun run test:ladle`, and `bun run ladle:coverage`. The codemod gate is a **false negative**: it passes while the codebase is still full of broken `@/` imports. This change finishes the `@/` removal that change 04 started: rewrite every `@/` import across `scripts/`, `tests/`, and the architecture test, extend the codemod to scan the entire repo, and fix the `check-viewport-meta.ts` script's stale `src/pages/` walk.

## What Changes

- Rewrite every `@/...` import in `scripts/seed-operations-smoke.ts` (5 imports) to the post-04 package-aware aliases (`@unveiled/app/db/client`, `@unveiled/app/db/schema`, `@unveiled/api/auth-account-actions`, `@unveiled/api/auth-profile`, `@unveiled/app/lib/data-access/loaders`).
- Update `scripts/check-viewport-meta.ts`: change the walk target from `src/pages` and `src/components` to `packages/app/src/pages` and `packages/app/src/components`, and change the `BaseLayout` string-match from `"@/layouts/base-layout.astro"` to `"~/layouts/base-layout.astro"`.
- Rewrite every `@/...` import in the 22 files under `tests/` (1 `.test.ts` + 21 `.ladle.tsx`) to the post-04 aliases (`@unveiled/app/...` for app code, `@unveiled/landing/...` for landing code). The `landing-hero.ladle.tsx` case has an unusual `"@/../packages/landing/src/..."` import that is rewritten manually.
- Extend `scripts/codemod-remove-legacy-alias.ts` so its `SCAN_ROOTS` is a single recursive walk of the entire repo (excluding `node_modules`, `dist`, `.astro`, `_old_app`, `.data`, `.bun`) instead of only `packages/app/src` and `packages/api/src`. The `LEGACY_ALIAS_RE` regex and `--verify` mode stay the same; only the scan surface widens.
- Verify end-to-end: `bun run codemod:remove-legacy-alias --verify` reports zero `@/` imports across the whole repo; `bun run scripts/seed-operations-smoke.ts`, `bun run db:seed:operations-smoke`, `bun run lint:viewport`, `bun test tests/architecture/model-tags.test.ts`, `bun run ladle:build`, `bun run ladle:coverage`, and `bun run test:ladle` all run to completion.

## Capabilities

### New Capabilities

_None._ This change finishes the alias cleanup that change 04 started; it introduces no new user-visible behavior.

### Modified Capabilities

- `monorepo-tooling`: the legacy `@/` alias is fully removed from every file in the repo (not just from `packages/*/src/**`). The `bun run check` codemod gate scans the entire repo and is a **true** gate: it fails on any `@/` import in `scripts/`, `tests/`, or anywhere else.
- `app-package`: the seed script at the repo root uses the `@unveiled/app/*` aliases, matching the app's exported surface. The seed can be run via `bun run db:seed:operations-smoke` (from the app package) or `bun run scripts/seed-operations-smoke.ts` (from the repo root) without module-resolution errors. The `check-viewport-meta.ts` script walks the post-monorepo `packages/app/src/pages/` and `packages/app/src/components/` paths.
- `api-package`: the auth helpers (`auth-account-actions`, `auth-profile`) are imported via `@unveiled/api/*` from the seed script, consistent with the API package's exported surface.
- `gherkin-ladle-interaction-tests` (the capability that owns the `.ladle.tsx` story files): every story file imports its component via `@unveiled/app/...` or `@unveiled/landing/...`, and global CSS via `@unveiled/app/styles/global.css`. The Ladle harness loads all 40 stories without `@/` import errors.

## Impact

- **New files:** _none._
- **Modified files:**
  - `scripts/seed-operations-smoke.ts` — five `@/...` imports rewritten.
  - `scripts/check-viewport-meta.ts` — walk targets updated to `packages/app/src/pages/` and `packages/app/src/components/`; string-match updated to `~/layouts/base-layout.astro`.
  - `scripts/codemod-remove-legacy-alias.ts` — `SCAN_ROOTS` replaced with a single recursive walk of the entire repo (excluding `node_modules`, `dist`, `.astro`, `.data`, `_old_app`, `.bun`).
  - 22 files in `tests/` (1 `.test.ts` + 21 `.ladle.tsx`) — `@/...` imports rewritten to `@unveiled/app/...` or `@unveiled/landing/...`.
- **Removed files:** _none._
- **Dependencies changed:** _none._
- **Risks:**
  - **Ladle harness runtime regression.** Rewriting the `@/` imports in `.ladle.tsx` files must point to modules that exist in the new packages. Mitigation: every `@/...` import in the audited files resolves to `packages/app/src/...`; the rewritten aliases (`@unveiled/app/...`) point to the same modules. Manual verification: `bun run ladle:build` succeeds and the static build includes all 40 stories.
  - **Architecture test runtime regression.** The `tests/architecture/model-tags.test.ts` import `@/lib/architecture/tags` resolves to `packages/app/src/lib/architecture/tags`. The rewritten `@unveiled/app/lib/architecture/tags` must be re-exported from `packages/app/src/index.ts` (verify it is; if not, add the re-export).
  - **Codemod false positive on `@unveiled/...` paths.** The `LEGACY_ALIAS_RE` matches `(@/[^"']+)`. The leading `@/` is the literal `@/` alias, not part of a path like `@unveiled/...`. Mitigation: the regex requires a `/` immediately after `@`, so `@unveiled/...` is not matched. Verified by the existing test suite.
  - **Seed script runtime regression.** The rewritten imports must point to modules that exist in the new packages. Mitigation: `packages/app/src/index.ts` re-exports the `db` client and `db/schema`; the `@unveiled/api` package re-exports `auth-account-actions` and `auth-profile`. The change verifies by running `bun run db:seed:operations-smoke` end-to-end.
