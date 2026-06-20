## 1. Workspace and package scaffolding

- [x] 1.1 Add `packages/landing/` to the root `package.json` `workspaces` array
- [x] 1.2 Create `packages/landing/package.json` with `name: "@unveiled/landing"`, `private: true`, and the scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `preview`, `preview:cloudflare`
- [x] 1.3 Add Astro 6, `@astrojs/cloudflare`, `@astrojs/react`, `react`, `react-dom`, `tailwindcss`, and `@tailwindcss/vite` to `packages/landing/package.json` `dependencies` (do NOT add `@nextui-org/react`, `@heroui/react`, or any component library — the landing app consumes them transitively through `@unveiled/design-system`)
- [x] 1.4 Add `@unveiled/design-system` to `packages/landing/package.json` `dependencies` as a workspace dependency
- [x] 1.5 Create `packages/landing/tsconfig.json` extending `packages/tsconfig.base.json` with `~/*` → `./src/*` and the `@unveiled/*` cross-package aliases
- [x] 1.6 Add the `@unveiled/landing` alias entry to `tsconfig.base.json` under the `paths` block

## 2. Astro config and Wrangler

- [x] 2.1 Create `packages/landing/astro.config.mjs` with `base: "/"`, the React integration, the `@tailwindcss/vite` plugin, and the Cloudflare adapter registered with `{ configPath: "wrangler.landing.toml" }`
- [x] 2.2 Copy the Vite `optimize-ssr-deps` block from `packages/app/astro.config.mjs` into the landing config so HeroUI-backed primitives resolve during SSR
- [x] 2.3 Create `wrangler.landing.toml` at the repo root with `name = "unveiled-landing"`, `main = "packages/landing/dist/server/entry.mjs"`, the Astro Cloudflare compatibility date, and the same `SESSION` KV namespace id and `ASSETS_BUCKET` R2 binding name declared in `wrangler.app.toml`
- [x] 2.4 Add `scripts/check-wrangler-bindings.ts` (a Bun-runnable script) that reads both `wrangler.app.toml` and `wrangler.landing.toml`, asserts the `SESSION` KV id and `ASSETS_BUCKET` R2 binding name agree, and wire it into `bun run check`
- [x] 2.5 Add `wrangler:check` to the root `package.json` scripts pointing at the new script

## 3. Landing layout, islands, and styles

- [x] 3.1 Create `packages/landing/src/layouts/landing-layout.astro` — minimal Astro layout extending the brand viewport meta (`<meta name="viewport" content="width=device-width, initial-scale=1">`) and importing `../styles/global.css`
- [x] 3.2 Create `packages/landing/src/components/landing/landing-header.tsx` as a thin wrapper around `@unveiled/design-system` primitives (logo + tagline + login CTA pointing at `/app`)
- [x] 3.3 Create `packages/landing/src/components/landing/landing-hero.tsx` as a thin wrapper around `@unveiled/design-system` primitives (hero headline + CTA button whose `href` resolves to `/app`)
- [x] 3.4 Create `packages/landing/src/components/landing/landing-footer.tsx` as a thin wrapper around `@unveiled/design-system` primitives
- [x] 3.5 Create `packages/landing/src/styles/global.css` importing `@unveiled/design-system/styles/generated/tokens.css` and the Tailwind v4 layers, and containing the single global `@media (prefers-reduced-motion: reduce)` block
- [x] 3.6 Ensure every island imports its UI primitives only from `@unveiled/design-system` (or `@unveiled/design-system/<subpath>`); no direct `@nextui-org/react`, `@heroui/react`, or `@/components/ui/...` imports

## 4. Index page

- [x] 4.1 Create `packages/landing/src/pages/index.astro` rendering `LandingHeader`, `LandingHero`, and `LandingFooter` inside `LandingLayout`
- [x] 4.2 Confirm the hero CTA's `href` resolves to `/app` and the header login CTA resolves to `/app/login`
- [x] 4.3 Confirm the page renders no app navigation (saved, bookings, profile, credits) and no app language toggle

## 5. Authenticated "Go to app" link

- [x] 5.1 Add a `hasSessionCookie(astro)` helper in `packages/landing/src/lib/session-presence.ts` that reads the Better Auth session cookie name from the shared Better Auth config and returns a boolean (no signature verification, no Drizzle lookup)
- [x] 5.2 In `packages/landing/src/pages/index.astro`, when `hasSessionCookie(Astro)` is true, render a "Go to app" link targeting `/app` (alongside the standard hero CTA)
- [x] 5.3 Confirm the landing surface never reads the Better Auth user, role, or profile data — full verification still happens in the app surface after navigation

## 6. Gherkin feature and Ladle harness

- [x] 6.1 Create `tests/features/landing/home/feature.feature` with the scenarios:
  - WHEN a visitor opens `/` THEN they see the landing hero with the CTA linking to `/app`
  - WHEN a visitor opens `/` AND prefers reduced motion THEN the hero animation is suppressed
  - WHEN an authenticated visitor opens `/` THEN they see a "Go to app" link to `/app`
- [x] 6.2 Create `tests/features/landing/home/landing-hero.ladle.tsx` exporting stories tagged `@ladle(component=LandingHero, story=…)` for each gherkin scenario
- [x] 6.3 Run `bun run ladle:coverage` and confirm the new stories are referenced with no drift

## 7. Root scripts and toolchain fan-out

- [x] 7.1 Update `bun run dev` at the repo root to fan out to `bun --filter @unveiled/landing run dev` (port 4322) and `bun --filter @unveiled/app run dev` (port 4321)
- [x] 7.2 Update `bun run build` at the repo root to include `bun --filter @unveiled/landing run build` after `@unveiled/design-system` and before `@unveiled/app`
- [x] 7.3 Update `bun run check` at the repo root to fan out `astro check` and `biome check .` (or the equivalent) into `@unveiled/landing`
- [x] 7.4 Confirm `bun --filter @unveiled/landing run typecheck` and `bun --filter @unveiled/landing run test:unit` pass

## 8. Gates and architecture drift

- [x] 8.1 Update `scripts/check-architecture-drift.ts` to register `landing` as a recognized container alongside `app`
- [x] 8.2 Update `tests/unit/no-ladle-replica-in-production.test.ts` to scan `packages/landing/src/**` in addition to `packages/app/src/**`
- [x] 8.3 Update `bun run heroui-design-system-replica:check` (or its umbrella) so the Ladle-only replica isolation guard covers `packages/landing/src/**`
- [x] 8.4 Run `bun run check`, `bun run ladle:coverage`, `bun run arch:check`, `bun run tokens:check`, `bun run specs:check`, and `bun run wrangler:check` and confirm zero drift

## 9. AGENTS.md and docs

- [x] 9.1 Update `AGENTS.md` §3 file layout to include `packages/landing/` alongside `packages/app/`
- [x] 9.2 Update `AGENTS.md` §7 toolchain commands with the `wrangler:check` script and the landing dev port (4322)
- [x] 9.3 Add a "Tech stack — landing surface" note in `AGENTS.md` §2 clarifying that the landing app mounts at `/` in production and reuses the design-system primitives

## 10. Validation

- [x] 10.1 Run `bun --filter @unveiled/landing run typecheck` — exits zero
- [x] 10.2 Run `bun --filter @unveiled/landing run test:unit` — exits zero
- [x] 10.3 Run `bun --filter @unveiled/landing run build` — produces `packages/landing/dist/server/entry.mjs`
- [x] 10.4 Run `bun run check` — exits zero
- [x] 10.5 Run `bun run ladle:coverage` — exits zero with the new landing-hero story referenced
- [x] 10.6 Run `bun run test:e2e` — exits zero (the existing gherkin parity suite continues to pass; the landing gherkin is exercised by `bun run test:ladle`)
- [x] 10.7 Run `openspec validate add-landing-package` — exits zero
