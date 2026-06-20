## Why

The product surface today is the authenticated app at `/`. We need a **public landing surface** that owns `/*` for unauthenticated visitors (marketing, pricing, login redirect) while the existing app is demoted to `/app/*`. This change introduces the new `@unveiled/landing` package as the public surface, without yet defining the actual landing content — richer content lands in follow-up iterations. The scope here is the **package skeleton, the Astro config with `base: "/"`, the brand chrome, and the gherkin/Ladle scaffolding** so future landing iterations drop in cleanly.

## What Changes

- Add `packages/landing/` as an Astro 6 SSR app with `base: "/"`, the Cloudflare adapter, React integration, and Tailwind via `@tailwindcss/vite`, mirroring the wiring of `@unveiled/app` but mounted at the root in production.
- Add `wrangler.landing.toml` (`name = "unveiled-landing"`) sharing the same `SESSION` KV namespace and `ASSETS_BUCKET` R2 binding as the app — no separate stores.
- Expose a single index page that renders the brand header, hero with a CTA to `/app`, and footer, all composed from `@unveiled/design-system` primitives; add `landing-header.tsx`, `landing-hero.tsx`, `landing-footer.tsx` islands that contain no business logic.
- Add gherkin feature folder `tests/features/landing/home/{feature.feature, landing-hero.ladle.tsx}` so the landing hero is covered by `bun run ladle:coverage` and the parity suite, including the `prefers-reduced-motion` rule lifted from `app-shell`.
- Update root scripts so `bun run dev`, `bun run build`, and `bun run check` all fan out to `@unveiled/landing` alongside the existing workspaces; landing dev runs on port 4322, app dev stays on 4321, and the orchestrator (change 06) dispatches the public route in production.
- Add the `@unveiled/landing` tsconfig alias and include `landing` as an architecture container alongside `app` in `scripts/check-architecture-drift.ts`.

## Capabilities

### New Capabilities

- `landing-package`: `@unveiled/landing` is an Astro 6 SSR application that, in production, is mounted at `/*` for unauthenticated visitors. It owns the public brand chrome (header, footer), the marketing hero with a call to action into the app, and the redirect entry into `/app/*` for sign-in. It reuses `@unveiled/design-system` for primitives and must not contain app business logic.

### Modified Capabilities

- `routing`: the URL space now has two Astro surfaces — `/` (landing) and `/app/*` (app). The production orchestrator (delivered in change 06) dispatches the public route to the landing Worker and the app prefix to the app Worker. Locally, each Astro dev server runs on its own port (landing 4322, app 4321) and the orchestrator dev proxy ties them together.
- `app-shell`: the existing `app-shell` capability is now scoped to `/app/*`. The header/footer chrome that today lives on every page only ships for authenticated viewers on `/app/*`; unauthenticated visitors on `/` see the landing chrome instead.
- `viewer-session`: unauthenticated visitors on `/` see no app chrome and the session-verification path is skipped for the landing surface. Authenticated visitors still land on `/app/*` after sign-in.

## Impact

- **New files:** `packages/landing/` tree (package.json, astro.config.mjs, tsconfig.json, src/pages/index.astro, src/layouts/landing-layout.astro, src/components/landing/*.tsx, src/styles/global.css), `wrangler.landing.toml`, `tests/features/landing/home/{feature.feature, landing-hero.ladle.tsx}`.
- **Modified files:**
  - `package.json` (root) — `dev`, `build`, `check` script fan-out to include `@unveiled/landing`.
  - `tsconfig.base.json` — adds the `@unveiled/landing` alias under `@unveiled/*`.
  - `scripts/check-architecture-drift.ts` — registers `landing` as a recognized container.
  - `openspec/specs/routing/spec.md`, `openspec/specs/app-shell/spec.md`, `openspec/specs/viewer-session/spec.md` — MODIFIED Requirements that reflect the new two-surface URL space.
- **Removed files:** _none._
- **Dependencies added:** Astro, `@astrojs/cloudflare`, `@astrojs/react`, `@tailwindcss/vite`, React, Tailwind, and the shared `wrangler` CLI are added to `@unveiled/landing`'s `dependencies`. HeroUI / NextUI are NOT added — the landing package consumes them transitively via `@unveiled/design-system`.
- **Risks:**
  - **Asset path collisions.** Both Astro apps serve static assets; the design-system Ladle build at `/ladle/` is mounted by the app. The landing app explicitly must not mount `/ladle/`; the app owns it.
  - **Concurrent dev servers.** Two Astro servers need different ports. `@unveiled/landing` uses 4322, `@unveiled/app` uses 4321; the orchestrator proxy (change 06) listens on 4320.
  - **Empty landing scope.** This change introduces only the skeleton and one hero. The gherkin scenarios in the new `landing-package` spec define the contract for "done" at this stage; richer landing content is a follow-up change.
