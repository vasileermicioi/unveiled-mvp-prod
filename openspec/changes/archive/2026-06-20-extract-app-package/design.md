## Context

The Unveiled app is a Bun workspace monorepo. Changes 01–03 extracted the design system (`@unveiled/design-system` at `packages/design-system/`) and the Hono HTTP backend (`@unveiled/api` at `packages/api/`) into their own packages. The Astro 6 SSR application, however, still lives at the repo root under `src/`, even though the empty `packages/app/` workspace member is already declared in the root `package.json`'s `workspaces` array and in `tsconfig.base.json`'s `paths` (`"@unveiled/app": ["packages/app/src/index.ts"]`). The TypeScript `tsconfig.json` at the root still extends the legacy `@/` alias (`"@/*": ["src/*"]`).

With the design system and the API Worker in place, the Astro app is now only the **shell + SSR pages + React islands + server actions + Better Auth session verification + Drizzle schema + middleware**. Every HTTP endpoint and the canonical HTTP shape of every Astro Action now live behind the service binding to `@unveiled/api`. The Astro app is the only package that owns a Cloudflare Worker bundle that imports the shared Drizzle schema and the shared HeroUI-backed UI primitives.

The user prompt for this change is that the Astro app must be mounted under the `/app/*` URL prefix in production so a future landing page can own `/*` and the orchestrator (change 06) can dispatch between the landing surface, the app, and the API Worker. In this change, the prefix is consumed via Astro's `base: "/app"` setting; the actual orchestrator dispatch is a separate change.

The migration touches every file under `src/`, every test under `tests/`, and the root `package.json`, `tsconfig.json`, `tsconfig.base.json`, `drizzle.config.ts`, and `wrangler.toml`. It produces no user-visible behavior change in this change; the only externally visible artifact is the local dev URL becoming `http://localhost:4321/app/` (the production URL is captured by change 06).

## Goals / Non-Goals

**Goals:**

- Move every Astro-specific file under `src/` into `packages/app/src/`, including pages, layouts, components, server actions, the Astro-only data-access layer, the view-model modules, the Drizzle client, the Better Auth session verification, the middleware, the styles, and the per-package `env.d.ts`.
- Configure the Astro app with `base: "/app"` so every page route and emitted asset is rewritten under the prefix.
- Replace the legacy `@/` alias with `~/` (resolves to `packages/app/src/`), `@unveiled/design-system`, and `@unveiled/api`.
- Move the Drizzle config and the single shared migration history into `packages/app/`, and have `@unveiled/api` consume them via a workspace import alias.
- Rename the root `wrangler.toml` to `wrangler.app.toml` and re-register the API service binding that was wired in change 03.
- Update tests (gherkin, parity, visual, unit) to point at `packages/app/` and the `/app` URL prefix; re-record visual baselines.
- Update root scripts so `bun run dev`, `bun run build`, `bun run check`, and `bun run db:*` fan out across workspaces or `cd` into the app package as appropriate.
- Keep the umbrella `bun run check` green throughout the migration by migrating one concern at a time and running the check between steps.

**Non-Goals:**

- Implementing the routing orchestrator (change 06). This change ships only the Astro app's `/app` prefix configuration and the per-package Cloudflare adapter config.
- Adding a landing package (change 05). The Astro app's `/app/*` mount is enough for this change; the landing surface arrives separately.
- Touching business logic. The migration is purely structural: every page, action, and middleware behavior is preserved byte-equivalently modulo the `/app` URL prefix and the new import paths.
- Refactoring the shared Drizzle schema. The schema moves to `packages/app/src/db/schema.ts` unchanged; only its location changes.
- Updating the canonical HTTP shape of any Astro Action. The action handlers remain byte-equivalent; only the import paths and the action-file location change.
- Re-recording visual baselines until the structural migration is complete. The visual baselines will be re-recorded as part of `bun run test:visual` after the `/app` prefix lands.

## Decisions

### Move `src/` wholesale into `packages/app/src/`

The cleanest path is a wholesale `git mv src/ packages/app/src/` followed by per-file import path updates. A wholesale move is preferred over a piecemeal copy because the Astro app's `astro.config.mjs` (which moves into `packages/app/astro.config.mjs`), the `tsconfig.json`'s `include` glob, the root `package.json`'s script paths, and the `wrangler.toml` (which becomes `wrangler.app.toml`) all reference the `src/` tree by relative path. A wholesale move keeps the `git mv` history intact, makes the diff easy to review, and avoids the risk of leaving stragglers behind.

Alternative considered: copy files in waves (pages first, then components, then actions). This adds review surface and creates a window where the repo has two `src/` trees. Rejected in favor of the wholesale move.

### Use Astro's `base: "/app"` to derive the URL prefix

`base: "/app"` is the canonical Astro mechanism for serving the app under a sub-path. Astro's adapter automatically rewrites every emitted `<link>` and `<script>` href so the `base` propagates through the build output. Combined with a per-package Cloudflare adapter `configPath`, the result is a single source of truth for the URL prefix.

Alternative considered: a reverse-proxy prefix rewrite in the orchestrator (change 06). The orchestrator does own the production dispatch, but having Astro's `base` set means local dev matches production (modulo the orchestrator layer), which keeps gherkin feature files, the Playwright `baseURL`, and the visual baselines in sync with the eventual production behavior. The orchestrator still needs to rewrite the path on the way in — but the rewrite is trivial (strip `/app`, forward to the Astro Worker).

Alternative considered: a Cloudflare Worker that rewrites every URL before forwarding to the Astro Worker. This would hide the prefix from Astro, but it would also force every gherkin feature and visual baseline to be recorded against the un-prefixed URL, which would then break the moment change 06 lands. Rejected in favor of `base: "/app"`.

### Drop the legacy `@/` alias in favor of `~/` and cross-package aliases

The root `tsconfig.base.json` currently declares `"@/*": ["src/*"]`. Once `src/` is gone, the alias is meaningless, and keeping it around would invite stragglers. Replace it with `"~/*": ["packages/app/src/*"]` (declared in `packages/app/tsconfig.json` and `packages/app/package.json`'s `imports` field) and let cross-package imports use `@unveiled/design-system` and `@unveiled/api`. A codemod rewrites `@/...` → `~/...` (or `@unveiled/...`) before the alias is removed; the umbrella `bun run check` fails the build if any `@/` import slips through.

Alternative considered: keep `@/` as a legacy alias pointing at `packages/app/src/`. This preserves the diff size and lets reviewers see the structural move without the alias churn. Rejected because the alias would invite confusion (a `@/` import in a `packages/api/` file would silently resolve to the app package, which is wrong). The cleanest contract is one alias per scope: `~/` for the app package, `@unveiled/...` for cross-package.

### Move `drizzle/` into `packages/app/` and have `@unveiled/api` consume it via a workspace path

`@unveiled/api` already imports the shared Drizzle schema (in change 03) via a workspace import path. The natural follow-on is to colocate the schema, the Drizzle Kit config, and the migration history inside the app package. The API package's `tsconfig.json` and `package.json` declare the workspace path `@unveiled/app/db/schema` (and `@unveiled/app/drizzle/...` if needed) so the schema and migrations are consumed across the workspace without duplication.

Alternative considered: keep `drizzle/` at the repo root as a shared tree. This is appealing because Drizzle Kit's config is currently a single file, but the migration history is a logical concern of the schema owner (the Astro app). Co-locating the schema, the config, and the migrations inside `packages/app/` keeps one owner.

Alternative considered: extract the schema into a fourth workspace package (`@unveiled/db`). This is the cleanest separation of concerns, but it adds a fifth package to the workspace and a fifth set of `package.json` / `tsconfig.json` / `biome.json` files for what is currently a single shared schema. Deferred until a third consumer of the schema appears.

### Rename `wrangler.toml` to `wrangler.app.toml` at the repo root

The Cloudflare Workers/Pages config that wires the Astro app to the API service binding needs a per-package name so a future `wrangler.landing.toml` (change 05) and `wrangler.orchestrator.toml` (change 06) can coexist at the repo root. The Astro Cloudflare adapter accepts a `configPath` argument; setting it to `"wrangler.app.toml"` keeps the file at the repo root for Wrangler CLI ergonomics (you can still run `wrangler dev --config wrangler.app.toml` from the repo root).

Alternative considered: move `wrangler.app.toml` into `packages/app/`. This is more "correct" architecturally, but Wrangler's CLI ergonomics are tuned for top-level configs, and the other workspace packages already import the config by repo-root-relative path. Rejected in favor of the rename.

### Update tests as part of the same change, not as a follow-on

The gherkin parity suite, the Playwright parity spec, the visual baselines, and the unit tests all reference the top-level `src/` tree or the un-prefixed routes. Updating them as part of this change (rather than as a follow-on) keeps the umbrella `bun run check` green and makes the review surface a single PR. The visual baselines are re-recorded against the `/app/*` URLs as part of the same change.

Alternative considered: update tests in a follow-on change. This would let the structural move ship faster, but it would also leave the repo in a state where `bun run test:e2e` and `bun run test:visual` are red for the duration of the follow-on. Rejected because the definition of done requires every check to be green before the change is archived.

### Service binding stays in the app's Wrangler config

The Cloudflare service binding from the Astro app to the API Worker (wired in change 03) is preserved unchanged in `wrangler.app.toml`. The app's middleware continues to call `env.API.fetch(request)` for any `/api/*` request. The rename to `wrangler.app.toml` does not change the binding's `service` or `entrypoint` values.

## Risks / Trade-offs

- [Risk] Hard-coded `/static/...` URLs in client code could bypass the `/app` prefix. → Mitigation: a `rg` grep for `"/(static|api|_astro|images|assets)` finds every hard-coded `/` prefix that should now be `/app/...`. The unit test suite (extending `tests/unit/no-ladle-replica-in-production.test.ts`) asserts that every emitted `<link>` and `<script>` href begins with `/app/`; the test runs against a built Astro page and inspects the HTML.
- [Risk] `wrangler.app.toml` could drift from the per-package `astro.config.mjs` adapter options. → Mitigation: the adapter `configPath` is set in `packages/app/astro.config.mjs` and the Wrangler config lives at the same repo-root-relative path. `bun run preview:cloudflare` fails the migration if the adapter cannot resolve the config.
- [Risk] The shared Drizzle migration history could become inconsistent if `@unveiled/api` regenerates migrations locally. → Mitigation: the API package's `package.json` does not declare a `db:generate` script. Only the Astro app's `package.json` declares `db:generate`, `db:migrate:local`, `db:migrate`, and `db:seed:operations-smoke`; the root scripts `cd` into the app package before invoking `drizzle-kit`. The umbrella `bun run check` does not run `drizzle-kit` automatically; migration generation is a manual step.
- [Risk] The `@/` → `~/` codemod could miss a file or introduce a syntax error. → Mitigation: the codemod is a single `bun` script (`scripts/codemod-remove-legacy-alias.ts`) that runs once and is checked in. The umbrella `bun run check` includes a follow-up `bun run scripts/codemod-remove-legacy-alias.ts --verify` step that fails the build if any `@/` import remains. The codemod handles Astro `.astro` files, React `.tsx` files, and TypeScript `.ts` files uniformly.
- [Risk] The Playwright `baseURL` change to `http://localhost:4321/app/` could mask a regression in the orchestrator dispatch. → Mitigation: in this change, the dev server is started with `astro dev --base /app`; the gherkin feature files prepend `/app` to every `Given` URL. Once change 06 lands, the `baseURL` updates to the orchestrator URL, and the feature file `Given` URLs are revisited.
- [Risk] The Cloudflare adapter's `configPath` option is silently ignored if the file is missing. → Mitigation: `bun run preview:cloudflare` runs as part of the umbrella check, and it fails with a clear error if the adapter cannot resolve the config. The migration `tasks.md` includes a step that asserts the preview build succeeds before the change is considered done.
- [Risk] Visual baselines recorded against the un-prefixed URLs could pollute `tests/visual/**` with stale PNGs. → Mitigation: `tests/visual/**` baselines are deleted and re-recorded against the `/app/*` URLs as part of the same change. The umbrella `bun run check` runs `bun run test:visual` against a fresh recording (or against an opt-in `BUN_UPDATE_BASELINES=1` env var).
- [Risk] TypeScript path resolution for `@unveiled/app` could break if `packages/app/src/index.ts` is missing or empty. → Mitigation: the migration creates `packages/app/src/index.ts` as a barrel that re-exports the public API (the `viewer-session` types, the `Viewer` union, the `product-routes` table, and the `parseSafeRedirectTarget` helper) needed by the API package. The umbrella `bun run typecheck` runs `bun --filter @unveiled/app run typecheck` as part of the check.

## Migration Plan

1. Scaffold the package: add `packages/app/package.json` (with the scripts and dependencies from the proposal) and `packages/app/tsconfig.json` (extending `packages/tsconfig.base.json` and adding the `~/*` path mapping).
2. Wholesale `git mv src/ packages/app/src/` and update every relative import.
3. Move `drizzle.config.ts` to `packages/app/drizzle.config.ts` and `drizzle/` to `packages/app/drizzle/`. Update the API package's `tsconfig.json` and `package.json` to consume the shared schema and migrations via the `@unveiled/app/db/schema` and `@unveiled/app/drizzle/...` workspace paths.
4. Move `astro.config.mjs` to `packages/app/astro.config.mjs` and add `base: "/app"` and the `configPath: "wrangler.app.toml"` adapter option.
5. Rename `wrangler.toml` to `wrangler.app.toml` and re-register the `API` service binding.
6. Update the root `package.json` scripts (`dev`, `build`, `check`, `db:*`) to delegate to `@unveiled/app` via `bun --filter` or `cd`.
7. Update the root `tsconfig.json` and `tsconfig.base.json` to remove the legacy `@/*` alias and to keep the cross-package aliases in sync. Add `~/*` to the app package's `tsconfig.json`.
8. Run the codemod `scripts/codemod-remove-legacy-alias.ts --verify` and the umbrella `bun run check` to confirm no `@/` imports remain.
9. Update tests: gherkin feature files (prepend `/app`), Playwright `baseURL`, visual baselines (re-record), and `tests/unit/no-ladle-replica-in-production.test.ts` (scan `packages/app/src/**`).
10. Run the full umbrella: `bun install`, `bun run db:migrate:local`, `bun run build`, `bun run check`, `bun run test:e2e`, `bun run test:ladle`, `bun run test:visual`, `bun run preview:cloudflare`, and `openspec validate extract-app-package`.

## Open Questions

- Should the `~` alias be declared in both `packages/app/tsconfig.json` and `packages/app/package.json`'s `imports` field, or only in the `tsconfig.json` (relying on the Vite `resolve.alias` for the runtime resolution)? Decision: declare it in both, mirroring the existing cross-package `@unveiled/...` resolution, so TypeScript, Vite, and Bun all agree.
- Should the `Viewer` discriminated union move to `@unveiled/app/src/lib/auth.ts` (where it is hydrated) or stay in a shared module that both the app and the API Worker import? Decision: keep it in `@unveiled/app/src/lib/auth.ts` (the hydration owner) and have the API Worker import it via `@unveiled/app/auth` for now. A future `@unveiled/viewer-session` package would be the cleaner home, but it is out of scope for this change.
- Should the per-feature gherkin feature files under `tests/features/<domain>/<surface>/` be updated to use the `/app` prefix once, or in a single bulk rewrite? Decision: bulk rewrite via a `bun` script (`scripts/codemod-prepend-app-prefix.ts`) that prepends `/app` to every `Given` URL. The script is checked in and re-runnable.
- Should the Ladle harness remain at `tests/features/<domain>/<surface>/<component>.ladle.tsx` (Ladle is still the Ladle project, just at a different relative path), or move to `packages/design-system/src/ladle/<component>.tsx`? Decision: keep the gherkin co-location; Ladle already imports from `@unveiled/design-system` and the move to `packages/app/` does not change the Ladle harness location.
