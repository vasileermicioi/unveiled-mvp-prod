## 1. VisualSystemApp Initial Mode

- [x] 1.1 Add `initialMode?: "login" | "signup" | "recovery"` prop to `LandingPage` in `packages/app/src/components/unveiled/visual-system-app.tsx` and initialize the `useState` from it (default `"login"`).
- [x] 1.2 Forward `initialMode` through `VisualSystemApp`'s props (default `"login"`) and pass it to the embedded `<LandingPage initialMode={initialMode} />` at the `view === "landing"` render site.
- [x] 1.3 Update the `VisualSystemApp` prop type in the same file so the new prop is part of the public React island API.

## 2. Dedicated Auth Pages

- [x] 2.1 Verify `packages/app/src/pages/[lang]/login.astro` exists, parses `redirect` via `parseSafeRedirectTarget`, and renders `VisualSystemApp` with `initialMode="login"` and `title="Login | Unveiled"`.
- [x] 2.2 Verify `packages/app/src/pages/[lang]/signup.astro` exists, renders `VisualSystemApp` with `initialMode="signup"` and `title="Sign up | Unveiled"`.
- [x] 2.3 Verify `packages/app/src/pages/[lang]/recovery.astro` exists, renders `VisualSystemApp` with `initialMode="recovery"` and `title="Password recovery | Unveiled"`.
- [x] 2.4 Confirm each page normalizes the `lang` URL parameter via `normalizeLanguage`, hydrates the viewer via `getViewer`, builds the initial shell via `createShellFromViewer(viewer, "landing")`, loads public discovery data via `loadPublicDiscoveryData`, and builds the surface data via `createPublicInitialSurfaceData`.

## 3. Deep-Link Preservation Middleware

- [x] 3.1 Confirm `packages/app/src/middleware.ts:80-89` issues a `302` redirect to `${APP_BASE_PREFIX}${langPrefix}/login?redirect=${encodeURIComponent(`${postLangPath}${url.search}`)}` for every `viewer.kind === "guest"` × guarded-route cell.
- [x] 3.2 Confirm `parseSafeRedirectTarget` (`packages/app/src/lib/product-routes.ts:116-147`) accepts both the post-lang form (`/admin`) and the full `/app/<lang>/...` form (`/en/admin`) by stripping any leading `/de|/en` before `routeForPath`.
- [x] 3.3 Confirm the auth-error fallback at `packages/app/src/middleware.ts:96-104` also redirects to the login page with the deep-link preserved (not to the bare landing).

## 4. E2E Gherkin Coverage

- [x] 4.1 Add the six scenarios from the proposal to `tests/features/identity/deep-link-preservation.feature` (Guest visits `/admin` / `/partner` / `/bookings` → `302` to login; query-string preservation; `/login` and `/login?redirect=%2Fadmin` → `200`). Also added a seventh open-redirect rejection scenario that asserts the deep-link preview block is absent when `?redirect=` is `https://evil.example/x`. Updated the `@story` tag on the HappyPath scenario to `@ladle` to match the canonical Ladle tag schema. Added a matching step in `tests/steps/verbs/visual.steps.ts` (`the deep-link-preview is not visible`) so the open-redirect scenario is selector-disciplinable.
- [x] 4.2 Add a co-located `tests/features/identity/DeepLinkPreservation.ladle.tsx` Ladle harness that renders the deep-link preview block with a `?destination=/app/en/bookings?status=upcoming` and asserts the localized preview copy ("After signing in you will be redirected to /app/en/bookings?status=upcoming.") is visible inside the `main` landmark. The harness exports the `HappyPath` story referenced by the gherkin `@ladle(component=DeepLinkPreservation, story=HappyPath)` tag.
- [ ] 4.3 Run `PLAYWRIGHT_BASE_URL=http://localhost:4320/ bunx playwright test --project=real-route tests/parity/gherkin.spec.ts --grep "deep-link|login"` and confirm every scenario passes. (Deferred to Definition of Done — requires `bun run dev` to be running on port 4320.)

## 5. Capability Spec Updates

- [ ] 5.1 Update `openspec/specs/routing/spec.md` to merge the `## MODIFIED Requirements` block from `specs/routing/spec.md` (lift the activation-gated qualifier on the deep-link preservation scenarios; add `/app/<lang>/recovery` to the public route table; add the "Guest visits an admin or partner route" scenario; add the "Dedicated auth pages render with the matching initialMode" scenario). (Done automatically at archive time by `openspec archive add-login-signup-recovery-pages`.)
- [ ] 5.2 Update `openspec/specs/app-shell/spec.md` to merge the `## ADDED Requirements` block from `specs/app-shell/spec.md` (the `VisualSystemApp Initial Mode` requirement with its three scenarios; the `Dedicated Auth Pages Render With Localized Title` requirement with its four scenarios). (Done automatically at archive time.)
- [x] 5.3 Run `openspec validate add-login-signup-recovery-pages` and confirm it passes.

## 6. Definition of Done

- [ ] 6.1 `bun run dev` boots all four Workers behind the orchestrator's port-4320 proxy. (Deferred — requires Cloudflare Workers runtime; sandbox environment runs against the static `bun test`/`biome`/`ladle:coverage` toolchain only.)
- [ ] 6.2 `curl -sI http://localhost:4320/app/en/login` → `200 OK`. (Deferred — see 6.1.)
- [ ] 6.3 `curl -sI http://localhost:4320/app/en/signup` → `200 OK`. (Deferred — see 6.1.)
- [ ] 6.4 `curl -sI http://localhost:4320/app/en/recovery` → `200 OK`. (Deferred — see 6.1.)
- [ ] 6.5 `curl -sI http://localhost:4320/app/en/admin` → `302` with `Location: /app/en/login?redirect=%2Fadmin`. (Deferred — see 6.1.)
- [ ] 6.6 `curl -sI "http://localhost:4320/app/en/admin?tab=metrics"` → `302` with `Location: /app/en/login?redirect=%2Fadmin%3Ftab%3Dmetrics`. (Deferred — see 6.1.)
- [ ] 6.7 `curl -sI "http://localhost:4320/app/en/login?redirect=%2Fadmin"` → `200 OK`. (Deferred — see 6.1.)
- [ ] 6.8 `curl -sI "http://localhost:4320/app/en/login?redirect=https%3A%2F%2Fevil.example%2Fx"` → `200 OK` (the page renders, the open-redirect attempt is ignored by `parseSafeRedirectTarget`). (Deferred — see 6.1.)
- [ ] 6.9 `bun run check` passes locally (Biome, astro check, specs:check, tokens:check, ladle:coverage, wrangler:check, arch:check). (Biome ✅ clean for the touched files; pre-existing `astro:actions` / `astro:middleware` module-resolution errors in `src/actions/index.ts`, `src/middleware.ts`, and several `src/components/unveiled/*.tsx` files are unrelated to this change and exist on `main`. `bun run ladle:coverage` ✅ passes (42/42).)
- [ ] 6.10 `bun run test:e2e` passes against the orchestrator's port-4320 proxy. (Deferred — see 6.1.)
- [ ] 6.11 `bun run test:ladle` passes for the new `deep-link-preservation` feature. (Deferred — see 6.1.)
- [x] 6.12 `bun run ladle:coverage` shows no drift.
- [ ] 6.13 Archive the change via `openspec archive add-login-signup-recovery-pages` once the PR merges. (Human reviewer responsibility after merge — the archive folds the spec deltas into the live `routing` and `app-shell` capabilities.)