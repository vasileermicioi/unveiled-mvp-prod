## ADDED Requirements

### Requirement: Bun workspace root

The repository root's `package.json` MUST declare `"workspaces": ["packages/*"]` and `"private": true`. `bun install` at the repo root MUST succeed and resolve all four `@unveiled/*` workspace members without modifying the lockfile's hoisted layout.

#### Scenario: Workspace install succeeds

- **WHEN** a contributor runs `bun install` at the repo root
- **THEN** the command exits 0, `node_modules` continues to be hoisted at the repo root, and each `packages/*/package.json` is registered as a workspace member

#### Scenario: Root package is private

- **WHEN** a release tool reads `package.json` at the repo root
- **THEN** `"private": true` is present and the root package is excluded from any publish flow

### Requirement: Canonical four-package skeleton

The repository MUST contain four workspace packages: `packages/design-system`, `packages/api`, `packages/app`, and `packages/landing`. Each package MUST ship a `package.json` whose `name` field is `@unveiled/<pkg>`, a `tsconfig.json` that extends `packages/tsconfig.base.json`, and a `README.md`. The package contents beyond these three files MAY be empty until later changes populate them.

#### Scenario: Package layout exists

- **WHEN** a contributor lists the contents of `packages/`
- **THEN** four directories named `design-system`, `api`, `app`, and `landing` are present, and each contains exactly the three required files

#### Scenario: Package names match the alias contract

- **WHEN** a contributor reads any `packages/*/package.json`
- **THEN** the `name` field is one of `@unveiled/design-system`, `@unveiled/api`, `@unveiled/app`, or `@unveiled/landing` matching its directory

### Requirement: Shared path alias contract

`tsconfig.base.json` at the repo root MUST export `compilerOptions.baseUrl` pointing at the repo root and `compilerOptions.paths` declaring `@unveiled/design-system`, `@unveiled/api`, `@unveiled/app`, and `@unveiled/landing`. The legacy `@/` alias MUST be retained as a compatibility shim that resolves into `packages/app/src/**`. The root `tsconfig.json` MUST extend `tsconfig.base.json`.

#### Scenario: Path aliases resolve

- **WHEN** the TypeScript language service resolves `import x from "@unveiled/api"` from any file in the repo
- **THEN** it resolves to `packages/api/src/index.ts` (or the package's entry point) without ambiguity

#### Scenario: Legacy alias retained

- **WHEN** the TypeScript language service resolves `import x from "@/components/..."` from `packages/app/src/**`
- **THEN** it resolves to the existing `src/components/...` file during the migration window

### Requirement: Biome walks all packages

`biome.json` MUST include `packages/**` in its scan globs and MUST use the root `tsconfig.base.json` for the import resolver. Running `biome check packages/` from the repo root MUST exit 0 against the freshly created package skeletons.

#### Scenario: Biome scan over packages passes

- **WHEN** a contributor runs `biome check packages/`
- **THEN** the command exits 0 and reports no "file not found by project" errors for any workspace package

### Requirement: Per-package script contract

Every `packages/*/package.json` MUST expose the scripts `dev`, `build`, `typecheck`, and `lint`. `packages/README.md` MUST document this contract and the rule that package-internal imports MUST use the `@unveiled/*` alias and cross-package relative imports are forbidden.

#### Scenario: Required scripts are present

- **WHEN** a contributor reads any `packages/*/package.json` `scripts` block
- **THEN** keys `dev`, `build`, `typecheck`, and `lint` are all present

#### Scenario: Package contract is documented

- **WHEN** a contributor opens `packages/README.md`
- **THEN** the file states the required-script list, the `@unveiled/*` import rule, and the prohibition on cross-package relative imports

### Requirement: Workspace-aware CI scripts

The root `package.json` MUST add the scripts `lint:workspaces` (running `biome check packages/`), `typecheck:workspaces` (running `bun --filter '*' run typecheck`), and `test:workspaces` (running `bun --filter '*' run test:unit`). Pre-existing root scripts (`check`, `test:e2e`, `ladle:coverage`, `specs:check`, `tokens:check`, `arch:check`) MUST continue to pass and MUST cover the new `packages/**` paths either by recursive globs or by per-package fan-out.

#### Scenario: New fan-out scripts exist

- **WHEN** a contributor runs `bun run lint:workspaces`, `bun run typecheck:workspaces`, or `bun run test:workspaces`
- **THEN** each command exits 0 against the package skeletons (no-op typecheck/test is acceptable for empty packages)

#### Scenario: Pre-existing root checks still pass

- **WHEN** a contributor runs `bun run check` after this change lands
- **THEN** the command exits 0, and `bun run specs:check`, `bun run tokens:check`, `bun run arch:check`, `bun run test:e2e`, and `bun run ladle:coverage` each continue to exit 0

### Requirement: Per-package output ignored

The repository's `.gitignore` MUST include entries for `packages/*/dist`, `packages/*/.astro`, `packages/*/node_modules`, and `packages/*/coverage`. Generated output under any of these paths MUST NOT be tracked by git.

#### Scenario: Generated package output is ignored

- **WHEN** a build writes `packages/app/dist/index.js` and `packages/app/.astro/types.d.ts`
- **THEN** `git status` does not list either path as an untracked change
