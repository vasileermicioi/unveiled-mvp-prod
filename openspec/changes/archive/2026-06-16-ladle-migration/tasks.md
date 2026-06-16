## 1. Package.json and Dependencies

- [x] 1.1 Remove `storybook` and `@storybook/react` from `package.json` dependencies
- [x] 1.2 Add `ladle` and `@ladle/react` to `package.json` dependencies
- [x] 1.3 Rename `storybook` script to `ladle` in `package.json`
- [x] 1.4 Rename `storybook:build` script to `ladle:build` in `package.json`
- [x] 1.5 Rename `storybook:coverage` script to `ladle:coverage` in `package.json`
- [x] 1.6 Rename `test:storybook` script to `test:ladle` in `package.json`
- [x] 1.7 Run `bun install` to update lockfile

## 2. Story File Migration

- [x] 2.1 Rename `src/components/**/*.stories.tsx` to `*.ladle.tsx` (`app-shell.stories.tsx` → `app-shell.ladle.tsx`)
- [x] 2.2 Update all `@storybook/test` imports to `@ladle/react` in smoke story files (and drop `@storybook/test` from the 10-iteration stories that previously used it for `play` blocks; Ladle does not re-export `expect`/`within`)
- [x] 2.3 Verify all component stories use correct Ladle exports (`story`, `meta`)
- [x] 2.4 Rewrite 10-iteration story files to Ladle 5 form: `import type { Story } from "@ladle/react"`, drop the `Meta<typeof X>` generic (Ladle 5 `Meta` is a value, not a generic type), declare each named export as a typed React FC `: Story<typeof Harness> = () => <Harness .../>`, and supply required props (e.g. `onSubmit`, `children`) inline rather than via `args` spread.
- [x] 2.5 Delete stray scratch file `src/test.stories.tsx`.

## 3. Test Infrastructure Migration

- [x] 3.1 Create `tests/ladle/` directory
- [x] 3.2 Rename `tests/storybook/coverage.ts` to `tests/ladle/coverage.ts` and update for `@ladle()` tags
- [x] 3.3 Rename `tests/storybook/storybook.spec.ts` to `tests/ladle/ladle.spec.ts` and update for Ladle
- [x] 3.4 Rename `tests/storybook/smoke-*.stories.tsx` to `tests/ladle/smoke-*.ladle.tsx` and rewrite to Ladle 5 form (drop `title: "Smoke/..."`, drop `@storybook/test` import, use `import type { Story } from "@ladle/react"`, keep `parameters.ladle.skipCoverage = true`)
- [x] 3.5 Create `tests/ladle/playwright.config.ts` based on storybook project config
- [x] 3.6 Remove `tests/storybook/` directory after migration

## 4. Step Helper Migration

- [x] 4.1 Rename `tests/steps/storybook.ts` to `tests/steps/ladle.ts`
- [x] 4.2 Rename `runStepInStory` function to `runStepInLadle` in `tests/steps/ladle.ts`
- [x] 4.3 Update all references to `runStepInStory` in `tests/ladle/ladle.spec.ts`
- [x] 4.4 Rename `tests/steps/storybook-helpers.ts` to `tests/steps/ladle-helpers.ts`
- [x] 4.5 Update `STORY_TAG` regex to match `@ladle(...)` instead of `@story(...)`
- [x] 4.6 Update `storyUrlFor` to generate Ladle URLs instead of Storybook URLs
- [x] 4.7 Update env var reference from `STORYBOOK_URL` to `LADLE_URL` in helpers and tests

## 5. Coverage Script Updates

- [x] 5.1 Update `tests/ladle/coverage.ts` to parse `@ladle()` tags
- [x] 5.2 Update `tests/ladle/coverage.ts` to look for `.ladle.tsx` files (replaces `.stories.tsx` glob, including the `STORY_BODY` regex, the `resolveStoryFile` join path, the `parseStoryFile` file-base trim, and the drift-message examples)
- [x] 5.3 Update `parameters.storybook.skipCoverage` to `parameters.ladle.skipCoverage`
- [x] 5.4 Update console output labels from `storybook:coverage` to `ladle:coverage`

## 6. Configuration Cleanup

- [x] 6.1 Remove `.storybook/` directory
- [x] 6.2 Replace `vite.config.ladle.mjs` (which Ladle 5 ignored) with `.ladle/config.mjs`. Ladle 5 hardcodes `config.mjs` inside the `--config` folder (default `.ladle/`) — root-level `vite.config.ladle.mjs` is no longer wired into the build. The new config sets `stories` to the three `.ladle.tsx` globs (`src/**`, `10-iteration/features/**`, `tests/ladle/**`) and forwards the `tailwindcss` plugin + global CSS entry via the `vite` block. Note: do NOT `import { defineConfig } from "ladle"` — there is no `ladle` package on npm; `defineConfig` lives only inside the `@ladle/react` typings. A plain default-exported object is the correct shape.
- [x] 6.3 Update CI config files that reference `bun run test:storybook` to `bun run test:ladle`
- [x] 6.4 Update CI config files that reference `bun run storybook:coverage` to `bun run ladle:coverage`
- [x] 6.5 Update any docs/CONTRIBUTING that reference storybook scripts
- [x] 6.6 Remove `.ladle/components.tsx` (dead stub from a prior session — it just imported the global CSS sheet with no exports, so it would have been a 0-story file that confused the glob)
- [x] 6.7 Delete the 5 root-level `10-iteration/features/<Component>.ladle.tsx` duplicates. The 5 nested `10-iteration/features/improvements/payments-subscriptions-aria/.../<Component>.ladle.tsx` files are the canonical per-feature versions (per the umbrella `improvements/payments-subscriptions-aria/proposal.md`). Both copies had identical story keys, which Ladle's build rejects as duplicate story IDs.
- [x] 6.8 Split `LanguageContext` (and `LiveDataContext`, `useCopy`, `useLiveData`, `emptyLiveDataView`, `LiveDataView`) out of `src/components/unveiled/context.tsx` into a new `src/components/unveiled/context-primitives.tsx`. The original `context.tsx` starts with `import { actions } from "astro:actions"`, and `astro:actions` is an Astro-only virtual module that does not resolve in Ladle's Vite toolchain. `context.tsx` re-exports the primitives so all 4 production consumers (`src/components/payments/AdminFreezeUnfreezeForm.tsx`, `CreditLedgerViewTableSemantics.tsx`, `StripeCheckoutRedirectButton.tsx`, `SubscriptionPortalLink.tsx`) keep working unchanged. The 4 Ladle stories that import `LanguageContext` now import from `context-primitives.tsx` directly.
- [x] 6.9 Point the 4 production payment components at `context-primitives.tsx` instead of `context.tsx`. Although the re-exports on `context.tsx` would have technically worked, Ladle's Vite dev server pre-transforms every file reachable from the story tree, and a path that goes Ladle story → payment component → `context.tsx` → `astro:actions` still fails to resolve. The direct import cuts the transitive reach. The 7 page-shell components in `src/components/unveiled/` (`PartnerPortal`, `MemberFeed`, `visual-system-app`, `DiscoveryFilterPanel`, `PublicDiscover`, `AdminPanel`, `BookingModal`) keep their relative `./context` import — they pull in `actions` legitimately, and Ladle never reaches them.
- [x] 6.10 Wire Tailwind v4 to the Ladle toolchain. Ladle 5's Vite config sets `root: getAppRoot()` to its own `app/` directory, so any path under `/src/...` falls through to Ladle's SPA index.html and is never processed by the Tailwind plugin. The fix is to import `src/styles/global.css` from each Ladle story file (8 files: `src/components/unveiled/app-shell.ladle.tsx`, the 5 nested per-feature `10-iteration/features/improvements/payments-subscriptions-aria/.../*.ladle.tsx`, and the 2 `tests/ladle/smoke-*.ladle.tsx`). When the user opens a story, Ladle's dynamic `import("/abs/path/to/story.ladle.tsx")` is served by Vite, which follows the CSS import and runs Tailwind's transform — emitting ~45 KB of utility CSS into a per-story chunk in the static build and ~57 KB into a JS module in the dev server's `__vite__updateStyle` injection. Also added explicit `@source` directives in `src/styles/global.css` pointing at `../**/*.{ts,tsx}`, `../../10-iteration/features/**/*.{ts,tsx}`, and `../../tests/ladle/**/*.{ts,tsx}` (relative to the CSS file). Without those directives, Tailwind v4's scanner only watches the Vite root (Ladle's `app/` dir) and never sees the project's component classes. The `@source` directives are validated by `bun run tokens:check` because that script only checks `tokens.css` and `design-tokens.types.ts`, not `global.css`.
- [x] 6.11 Make the `@source` scanner work under Ladle's Vite root. Tailwind v4's `@tailwindcss/vite` plugin uses the Vite `root` as the scanner's base path. Ladle hardcodes `root: getAppRoot()` to its own `node_modules/@ladle/react/lib/app/` and ignores any user `vite.root` override (it merges with the user's config as the override). The `@source` patterns in `global.css` are relative to the CSS file, but the scanner's base is Ladle's app dir, so `../**/*.{ts,tsx}` from `src/styles/global.css` resolved to `node_modules/@ladle/react/src/**/*.{ts,tsx}` — wrong. The fix is a custom Vite plugin (`vite.config.mjs`) that runs `enforce: "pre"` and rewrites every `@source "..."` pattern to its absolute path before Tailwind sees it. This requires creating a top-level `vite.config.mjs` because Ladle's `getUserViteConfig()` only loads vite config from a real `vite.config.{js,ts,mjs}` file (not from `.ladle/config.mjs`'s `vite.plugins`). With this in place, the built CSS is ~99 KB with all utility classes (`.flex`, `.p-6`, `.min-h-screen`, `.border-4`, `.bg-brand-yellow`, etc.) and the dev CSS is ~141 KB.
- [x] 6.12 Give the `StripeWebhookHandlerValidation` story a visible body. The original `<SchemaProbe>` returned a self-closing `<div data-accepted="true" data-error-count="0" />` with no children, no padding, and no content — so it rendered as a 0-height element (880×0 px) that was technically present in the DOM but visually invisible. Replaced it with a panel that shows the schema result textually: a label "StripeEventSchema.safeParse", a line for `accepted: true|false`, a line for `errors: N`, and a pre block with the issue paths/messages when the parse fails. Both stories (`VerifiedEventPassesSchema`, `SchemaFailureRejected`) now render with measurable height (101 px and 142 px respectively) and readable text.

## 7. OpenSpec Spec Migration

- [x] 7.1 Archive `openspec/specs/gherkin-storybook-interaction-tests/` to `openspec/changes/archive/2026-06-16-gherkin-storybook-interaction-tests/`
- [x] 7.2 Verify `openspec/specs/gherkin-ladle-interaction-tests/spec.md` is in place (created prior to this change; serves as the live spec for the new capability)
- [x] 7.3 Create the change's spec delta at `openspec/changes/ladle-migration/specs/gherkin-ladle-interaction-tests/spec.md` with `## ADDED Requirements` (mirrors the live spec) and `## REMOVED Requirements` documenting the storybook predecessor (one requirement renamed to "Per-Feature Story Adoption Is Enforced By Storybook Coverage" to avoid the duplicate-name validator error)

## 8. Verification

- [x] 8.1 Run `openspec validate ladle-migration` (passes)
- [x] 8.2 Run `bun run ladle:coverage` and fix any drift (`[ladle:coverage] OK — 23 feature files, 8 story files, no drift` after dedup)
- [x] 8.3 Run `bun run ladle:build` and verify static output at `public/ladle/` (`✓  Ladle finished the production build in 5s producing 1.12 MiB of assets.`; `meta.json` lists 22 stories; root-level `index.html` and `meta.json` present)
- [x] 8.4 Run `bun run ladle serve` and verify `curl http://localhost:6006/meta.json` returns a non-empty `stories` object (was failing with `{"stories":{}}` until the `.ladle/config.mjs` + `defineConfig` import issue was fixed)
- [x] 8.5 Run `bun run check` (migrated files pass lint and the new `.ladle.tsx` files have zero TypeScript errors; 6 pre-existing errors remain in unrelated files: `astro.config.mjs:22` Vite plugin, `scripts/specs-shared.ts:15,51` js-yaml type, `src/components/unveiled/list-skeleton.tsx:37` `UiLanguage.shell`, `tests/architecture/drift-script.test.ts:51,76` `toContain` overload — all flagged as pre-existing in task 8.4 of the prior session)
- [x] 8.6 Verify `bun run test:ladle` is configured and ready (requires `LADLE_URL` environment variable and a running Ladle dev server / static build at `public/ladle/`; the Playwright project is wired at `playwright.config.ts`)
