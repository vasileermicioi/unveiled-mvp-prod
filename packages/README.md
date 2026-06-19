# Packages

Bun workspace containing the four deployable units of the Unveiled monorepo.

| Package | Purpose | Mounted at | Populated by |
| --- | --- | --- | --- |
| `@unveiled/design-system` | Ladle harness + production UI primitives | n/a (library) | change 01 |
| `@unveiled/api` | Hono HTTP backend | `/api/*` in Cloudflare | change 02 |
| `@unveiled/app` | The current Astro application | `/app/*` | change 04 |
| `@unveiled/landing` | Future Astro landing application | `/*` | change 05 |

## Package contract

Every package MUST:

- Declare `name` as `@unveiled/<pkg>` and `private: true`.
- Expose the scripts `dev`, `build`, `typecheck`, and `lint`.
- Ship a `tsconfig.json` that extends `../../packages/tsconfig.base.json`.
- Use the `@unveiled/*` alias for **all** cross-package imports.
- Refuse cross-package relative imports (e.g. `import x from "../../api/src/..."`).

## Import alias rules

- `@unveiled/<pkg>` — cross-package alias; declared once in the root `tsconfig.base.json` and inherited by every package.
- `@/...` — **legacy** compatibility shim that resolves into `src/*` for the duration of the migration to the monorepo. Removed by change 04. Do not use it in any new package source.

## CI fan-out rules

Root scripts in `package.json` fall into two categories:

- **Run once at the root** (with widened globs to cover `packages/**`):
  `check`, `lint`, `format`, `specs:check`, `specs:gen`, `tokens:check`, `tokens:gen`, `arch:check`, `arch:drift`, `test:e2e`, `test:ladle`, `ladle:coverage`, `heroui-design-system-replica:check`, `lint:viewport`, `db:seed:*`, `deploy:*`.

- **Fan out per package** via `bun run --filter '*' <script>`:
  `lint:workspaces` (uses `biome check packages/`), `typecheck:workspaces` (per-package `tsc --noEmit`), `test:workspaces` (per-package `test:unit`).

Rule of thumb: if the tool reads from the repo root and walks the tree itself, run once at the root with a wider glob. If the tool is per-package by nature (TypeScript compile, `bun test`), fan out via `bun run --filter`.

## Dependency hoisting

For now all dependencies stay hoisted at the repo root; per-package `dependencies` and `devDependencies` start empty. Do **not** switch to per-package installs (no `bun install --no-hoist`) until after change 06 — the Astro Cloudflare adapter still resolves modules from the root `node_modules`.
