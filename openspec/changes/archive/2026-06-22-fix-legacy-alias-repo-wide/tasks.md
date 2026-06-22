## 1. Audit And Rewrite `@/` Imports In `scripts/`

- [x] 1.1 Rewrite the five `@/...` imports in `scripts/seed-operations-smoke.ts` to the post-04 aliases: `@/db/client` → `@unveiled/app/db/client`, `@/db/schema` → `@unveiled/app/db/schema`, `@/lib/auth-account-actions` → `@unveiled/api/auth-account-actions`, `@/lib/auth-profile` → `@unveiled/api/auth-profile`, `@/lib/data-access/loaders` → `@unveiled/app/lib/data-access/loaders`.
- [x] 1.2 Update `scripts/check-viewport-meta.ts`: change the walk targets from `src/pages` and `src/components` to `packages/app/src/pages` and `packages/app/src/components`, and change the `BaseLayout` string-match from `'@/layouts/base-layout.astro'` to `'~/layouts/base-layout.astro'`.

## 2. Audit And Rewrite `@/` Imports In `tests/`

- [x] 2.1 Rewrite the single `@/` import in `tests/architecture/model-tags.test.ts` (`@/lib/architecture/tags` → `@unveiled/app/lib/architecture/tags`); verify the re-export exists at `packages/app/src/lib/architecture/tags` and is reachable from `packages/app/src/index.ts`; add the re-export if missing.
- [x] 2.2 Rewrite the two `tests/ladle/smoke-*.ladle.tsx` files (`smoke-button.ladle.tsx`, `smoke-visual-baseline.ladle.tsx`): `@/styles/global.css` → `@unveiled/app/styles/global.css`.
- [x] 2.3 Rewrite the 14 `tests/features/ui-system/*.ladle.tsx` story files (Badge, Button, Card, Drawer, Field, Menu, Modal, Panel, SelectInput, Tabs, TextArea, TextInput, Toast, plus any sibling UI primitives): every `@/...` import to `@unveiled/app/...`.
- [x] 2.4 Manually rewrite `tests/features/landing/home/landing-hero.ladle.tsx`: change `"@/../packages/landing/src/components/landing/landing-hero"` to `"@unveiled/landing/components/landing/landing-hero"`.
- [x] 2.5 Rewrite the five `tests/features/improvements/payments-subscriptions-aria/*.ladle.tsx` files: every `@/components/payments/...`, `@/components/unveiled/context-primitives`, `@/lib/unveiled-view-models`, `@/lib/generated/request-validators` import to the `@unveiled/app/...` alias.

## 3. Extend The Codemod To Scan The Entire Repo

- [x] 3.1 Replace `SCAN_ROOTS` in `scripts/codemod-remove-legacy-alias.ts` with a single recursive walk rooted at the repo root; skip `node_modules/`, `dist/`, `.astro/`, `_old_app/`, `.data/`, and `.bun/`.
- [x] 3.2 Keep the existing `LEGACY_ALIAS_RE` regex and the `--verify` exit-code semantics unchanged.
- [x] 3.3 Run `bun run codemod:remove-legacy-alias --verify` and confirm it reports zero `@/` imports across the entire repo.

## 4. Verify End-To-End

- [x] 4.1 Run `bun run scripts/seed-operations-smoke.ts` from the repo root; confirm the script inserts the four smoke users (`ops-smoke-admin`, `ops-smoke-partner`, `ops-smoke-member`, `ops-smoke-guest`) plus the test partner and test events against the local PGlite database.
- [x] 4.2 Run `bun run db:seed:operations-smoke` (the app-package alias); confirm equivalent behavior.
- [x] 4.3 Run `bun run lint:viewport`; confirm the script walks `packages/app/src/pages/` and `packages/app/src/components/` and reports zero violations.
- [x] 4.4 Run `bun test tests/architecture/model-tags.test.ts`; confirm the test runs to completion.
- [x] 4.5 Run `bun run ladle:build`; confirm the static build includes all 40 stories without `@/` import errors.
- [x] 4.6 Run `bun run ladle:coverage`; confirm 41 feature files, 40 story files, no drift.
- [x] 4.7 Run `bun run test:ladle`; confirm every gherkin scenario tagged `@ladle(...)` passes.
- [x] 4.8 Run `bun run check`; confirm the umbrella passes (codemod gate, `biome check .`, `astro check`, `specs:check`, `tokens:check`, `ladle:coverage`, `wrangler:check`, `arch:check`). All gates relevant to this change pass (`codemod:remove-legacy-alias --verify`, `tokens:check`, `ladle:coverage`, `wrangler:check`, `test:unit`). The umbrella as a whole reports 3 pre-existing failures (`biome lint`, `specs:check`, `arch:check`) and 6 pre-existing `astro check` errors that exist on `refactor-monorepo` HEAD without my changes (verified via `git stash` + re-run); they are unrelated to the `@/` alias cleanup and are out of scope for this change.
- [x] 4.9 Run `openspec validate fix-legacy-alias-repo-wide`; confirm zero errors.
