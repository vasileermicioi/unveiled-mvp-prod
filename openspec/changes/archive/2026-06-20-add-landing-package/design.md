## Context

The current product surface is the authenticated app mounted at `/`. Iteration 05 introduces a public landing surface mounted at `/*` for unauthenticated visitors and demotes the app to `/app/*`. The two Astro 6 SSR applications live side by side as Bun workspace packages; in production the routing orchestrator (change 06) dispatches the request stream between them, while locally each Astro dev server runs on its own port and a Vite dev proxy ties them together.

The package must be deployable today even though richer landing content lands in follow-up iterations: it owns the Astro Cloudflare Worker bundle, the brand chrome (header, hero, footer), the public CTA into `/app`, and the gherkin/Ladle scaffolding that keeps `bun run ladle:coverage` and `bun run check` green. It must not contain app business logic (no Better Auth reads, no Drizzle queries, no server actions) — the landing surface is intentionally thin.

Constraints inherited from AGENTS.md:

- Bun workspace, Bun scripts, Bun filters; everything hoisted at the root.
- Astro 6 SSR on `@astrojs/cloudflare`; React 19 islands; Tailwind v4 via `@tailwindcss/vite`.
- Production primitives sourced from `@unveiled/design-system`; the Ladle-only `heroui-replica/` is forbidden in production imports (gate: `bun run heroui-design-system-replica:check`).
- No comments in code unless asked; no `_old_app/` imports; no hand-edited generated files.

Stakeholders: the maintainer (who stages the orchestrator and the follow-up landing content), the Ladle harness (which must keep `bun run ladle:coverage` passing), and the deploy pipeline (which expects a deployable Worker bundle).

## Goals / Non-Goals

**Goals:**

- Ship a deployable `@unveiled/landing` Astro 6 SSR app on the Cloudflare Workers adapter with `base: "/"`.
- Render a single marketing index page (brand header + hero with CTA to `/app` + footer) composed entirely from `@unveiled/design-system` primitives.
- Reuse the `SESSION` KV namespace and `ASSETS_BUCKET` R2 binding from `wrangler.app.toml` so there are no separate stores to provision.
- Land gherkin + Ladle coverage for the hero so `bun run ladle:coverage` and `bun run check` stay green.
- Fan the root `dev`, `build`, and `check` scripts out to the new package alongside the existing workspaces.

**Non-Goals:**

- Defining the actual landing content (hero copy, pricing, FAQ, marketing pages). That lands in a follow-up iteration.
- Wiring the production orchestrator that dispatches `/` vs `/app/*` between the two Workers. That is change 06.
- Multi-language support on the landing surface (single-language at this stage; the app shell keeps the `DE`/`EN` toggle).
- Replacing the `app-shell` navigation primitives; the landing surface ships its own brand chrome.

## Decisions

### D1. Astro app, not a static export

The landing surface is implemented as an Astro 6 SSR application (mirroring `@unveiled/app`) rather than a static export. Rationale: the landing page must be able to read the Better Auth session cookie at SSR time to render the optional "Go to app" link for authenticated visitors, and it must stay runtime-configurable so the orchestrator can inject secrets (KV/R2 bindings) without rebuilding. Alternatives considered:

- **Static export.** Rejected: cannot render per-visitor content (the "Go to app" link) and cannot share KV/R2 bindings at runtime.
- **Cloudflare Pages static.** Rejected: same per-visitor and bindings reasons.

### D2. `base: "/"` (not `/landing` or `/public`)

The landing app declares `base: "/"` so its URLs resolve at the site root in production. Rationale: the public URL space (`/`, `/pricing`, …) is owned by the landing Worker; a non-root base would force every external link to include a prefix that consumers would then need to strip. Alternatives considered:

- **`base: "/landing"`.** Rejected: pollutes public URLs and forces rewrites everywhere.
- **`base: "/public"`.** Rejected: same problem; `/public` is conventionally used for the static assets directory.

### D3. Reuse `wrangler.app.toml`'s KV and R2 bindings

`wrangler.landing.toml` declares the same `SESSION` KV namespace id and `ASSETS_BUCKET` R2 binding id as `wrangler.app.toml`. Rationale: there is exactly one session cookie store and one asset bucket; the landing app only reads the session cookie at SSR time (no writes), and it does not touch R2 yet — but declaring the bindings now means the orchestrator can wire the routing without changing the landing config later. The config intentionally does NOT declare a `main` field (it would force the build to produce the bundle before the Wrangler config is read; this matches `wrangler.app.toml`, which also has no `main`). Alternatives considered:

- **Separate KV/R2 stores per Worker.** Rejected: doubles the operational surface for no benefit; the landing app is read-only against the session KV.
- **No bindings at all.** Rejected: the orchestrator would have to inject bindings at the edge, which complicates the Wrangler config.

### D4. Landing surface owns its own brand chrome

`@unveiled/landing` ships `landing-header.tsx`, `landing-hero.tsx`, and `landing-footer.tsx` rather than reusing the `app-shell` `Navbar` and `Footer` from `@unveiled/app`. Rationale: the `app-shell` capability is now scoped to `/app/*`; the landing surface is single-language at this stage and does not need the shell's saved/credits/profile controls. Reusing the shell would force the landing app to import the full app navigation graph and would couple the two surfaces. Alternatives considered:

- **Reuse the app shell.** Rejected: tightens coupling and risks shipping app-only controls on the public landing.
- **Promote the shell to `@unveiled/design-system`.** Deferred to a follow-up: the landing header/footer are marketing surfaces, not part of the production UI primitives bundle.

### D5. Compositional layout for hero reduced-motion

The hero's `prefers-reduced-motion` behavior is implemented with a single global `@media (prefers-reduced-motion: reduce)` block in `packages/landing/src/styles/global.css`, lifting the same pattern already used by `app-shell`. Rationale: matches the existing rule (no per-island `useReducedMotion()` hook) and keeps the gherkin scenarios stable. Alternatives considered:

- **`useReducedMotion()` hook in the island.** Rejected: would deviate from the `app-shell` rule and force JS to gate a CSS-only concern.
- **Per-island CSS.** Rejected: duplicates the global guard and drifts over time.

### D6. No direct HeroUI dependency

`@unveiled/landing`'s `dependencies` list does NOT include `@nextui-org/react`, `@heroui/react`, `@mantine/core`, or any other component-library package. Rationale: the landing app consumes HeroUI transitively through `@unveiled/design-system`, which already centralizes the production primitives and the Ladle-only replica. A direct dependency would create a second source of truth and bypass the `heroui-design-system-replica:check` gate.

### D7. Dev ports: 4322 (landing) and 4321 (app), orchestrator on 4320

The landing dev server listens on port 4322 (one above the app's 4321) so both can run concurrently under `bun run dev`. The orchestrator proxy (change 06) listens on 4320 and dispatches to the right port based on the URL prefix. Rationale: preserves the existing app dev port and gives the orchestrator a stable localhost target. Alternatives considered:

- **Random ports.** Rejected: the orchestrator needs a deterministic target.
- **Shared port with path-based routing.** Rejected: Astro's dev server cannot multiplex two SSR apps on the same port without an external proxy, and the proxy is what change 06 introduces.

### D8. Gherkin + Ladle scaffolding is shipped with the skeleton

`tests/features/landing/home/{feature.feature, landing-hero.ladle.tsx}` is created in this change, not deferred. Rationale: the `bun run ladle:coverage` gate will fail if the story referenced by the gherkin `@ladle(component=…, story=…)` tag is missing, and shipping the skeleton without the harness would leave the gate red. The scenarios are deliberately scoped to the skeleton (hero CTA, reduced-motion, "Go to app" link); richer scenarios land with the follow-up content.

## Risks / Trade-offs

- **Asset path collisions between two Astro apps.** Both apps serve static assets; the design-system Ladle build at `/ladle/` is currently mounted by the app. → Mitigation: the landing app does not mount `/ladle/` (the `/ladle/` static directory stays under the app); the orchestrator routes `/ladle/*` to the app. CI gate: `bun run check` includes a script that fails if `packages/landing/dist/client/ladle/` exists.

- **Concurrent dev servers collide on shared resources.** Two Astro dev servers may try to bind the same Vite port or write to the same cache. → Mitigation: explicit per-package `dev` ports (4321 / 4322) and per-package `.astro/` cache directories declared via the `dev` script. The orchestrator's dev proxy ties them together.

- **Empty landing scope is the contract.** Shipping only the hero means the gherkin scenarios are intentionally thin. → Mitigation: the scenarios in `tests/features/landing/home/feature.feature` define the contract for "done" at this stage (hero CTA, reduced-motion, "Go to app" link); richer content lands in follow-up changes with their own scenarios.

- **Drift between `wrangler.app.toml` and `wrangler.landing.toml`.** The two configs must agree on the KV namespace id and the R2 binding name. → Mitigation: a shared `scripts/check-wrangler-bindings.ts` script (added in `tasks.md`) reads both configs and fails `bun run check` if the ids diverge.

- **Ladle-only replica isolation across two apps.** The `heroui-design-system-replica:check` gate currently scans `packages/app/src/**`; the landing package adds a second production graph to scan. → Mitigation: the gate's scan list is updated to include `packages/landing/src/**`, and `tests/unit/no-ladle-replica-in-production.test.ts` is updated to scan both packages.

- **Authenticated "Go to app" link reads the session cookie from a non-app Worker.** The landing Worker needs to read the Better Auth session cookie to render the link, but it must not run the full session verification path. → Mitigation: the landing Worker reads the cookie via the same shared Better Auth config (read-only), and the "Go to app" link is gated on a minimal cookie presence check — full verification still happens in the app surface after navigation.

## Migration Plan

This change is additive. There is no data migration and no rollback complexity beyond deploying the previous commit.

**Deploy order:**

1. Land `@unveiled/landing` (this change) behind a feature flag or via the orchestrator (change 06) once that is shipped. Until change 06 lands, both Astro apps can coexist locally; in production the orchestrator is required for the public URL space.
2. Configure the `unveiled-landing` Worker in Cloudflare with the same KV namespace id and R2 binding name declared in `wrangler.app.toml` (no new bindings to provision).
3. Wire the orchestrator (change 06) to dispatch `/` to `unveiled-landing` and `/app/*` to `unveiled-app`.

**Rollback:** Revert the deploy; the previous Worker bundle (`unveiled-app` at `/`) continues to serve traffic. No data changes to revert.

## Open Questions

- **Bilingual landing copy.** The app surface keeps the `DE`/`EN` toggle; the landing surface is single-language at this stage. A follow-up change will decide whether the landing page itself gains a language toggle or stays single-language for marketing reasons.
- **Cookie-based "Go to app" detection.** The landing Worker needs a minimal read of the Better Auth session cookie to render the "Go to app" link. The exact minimal verification (cookie presence vs. signature check vs. full Better Auth verify) is captured as a follow-up design choice; for now, the landing Worker reads the cookie presence only and the orchestrator (change 06) handles full verification on the app surface.
- **Hero copy and imagery.** Owned by the follow-up content change; this change ships only the layout shell.
