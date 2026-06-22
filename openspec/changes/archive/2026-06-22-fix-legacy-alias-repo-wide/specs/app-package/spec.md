## MODIFIED Requirements

### Requirement: Legacy @/ Alias Is Removed

The legacy `@/` TypeScript path alias that resolves to `src/` SHALL be removed from `tsconfig.json` and `tsconfig.base.json` once every import has been migrated. Every import that previously read `@/...` SHALL read `~/...` (resolves to `packages/app/src/...`), `@unveiled/design-system`, `@unveiled/design-system/<subpath>`, `@unveiled/api`, or `@unveiled/api/<subpath>`. The `~/` alias SHALL be declared in `packages/app/tsconfig.json` and `packages/app/package.json`'s `imports` field. No file in the repository — not under `packages/*/src/**`, not under `scripts/`, and not under `tests/` — SHALL contain a `@/` import. The `scripts/codemod-remove-legacy-alias.ts` codemod wired into `bun run check` SHALL scan the entire repository (excluding `node_modules`, `dist`, `.astro`, `_old_app`, `.data`, and the Bun cache) and SHALL fail the check if any `@/` import is found anywhere.

#### Scenario: tsconfig no longer declares the @/ alias

- **WHEN** a contributor reads `tsconfig.base.json`
- **THEN** the `paths` object does not contain a `"@/*"` key
- **AND** it does contain `"~/*": ["packages/app/src/*"]` (or the equivalent package-local entry)
- **AND** the same alias resolution is declared in `packages/app/package.json`'s `imports` field

#### Scenario: No @/ imports remain anywhere in the repo

- **WHEN** `bun run check` runs the umbrella lint + typecheck
- **THEN** the codemod verification step asserts that no file under `packages/app/src/**`, `packages/api/src/**`, `packages/landing/src/**`, `packages/design-system/src/**`, `packages/orchestrator/src/**`, `scripts/**`, or `tests/**` contains a `@/` import
- **AND** the codemod recursively walks the repo (excluding `node_modules`, `dist`, `.astro`, `_old_app`, `.data`, and the Bun cache) instead of only scanning two package directories
- **AND** `bun run check` fails if any such import slips through

#### Scenario: Aliases resolve cross-package

- **WHEN** a file under `packages/app/src/**` imports `@unveiled/design-system` or `@unveiled/api`
- **THEN** the import resolves to the corresponding workspace package's `src/index.ts`
- **AND** TypeScript and Bun's bundler both accept the import

#### Scenario: Seed script at the repo root imports via @unveiled/* aliases

- **WHEN** `bun run scripts/seed-operations-smoke.ts` is invoked from the repo root
- **THEN** every import resolves through the post-monorepo aliases (`@unveiled/app/db/client`, `@unveiled/app/db/schema`, `@unveiled/api/auth-account-actions`, `@unveiled/api/auth-profile`, `@unveiled/app/lib/data-access/loaders`)
- **AND** the script runs to completion against the local PGlite database and inserts the four smoke users (`ops-smoke-admin`, `ops-smoke-partner`, `ops-smoke-member`, `ops-smoke-guest`) plus the test partner and test events
- **AND** `bun run db:seed:operations-smoke` (delegating to the app package) works equivalently

#### Scenario: Viewport-meta script walks the post-monorepo paths

- **WHEN** `bun run lint:viewport` runs `scripts/check-viewport-meta.ts`
- **THEN** the script walks `packages/app/src/pages/` and `packages/app/src/components/` (not the legacy `src/pages/` and `src/components/`)
- **AND** the string-match that flags stale imports reads `"~/layouts/base-layout.astro"` (not the legacy `"@/layouts/base-layout.astro"`)
- **AND** the script reports zero violations across the app package
