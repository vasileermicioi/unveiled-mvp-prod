## 1. Package skeleton

- [x] 1.1 Replace `packages/design-system/package.json` with the populated manifest (`name: @unveiled/design-system`, `private: true`, `type: module`, scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `ladle`, `ladle:build`, `ladle:coverage`, `heroui-design-system-replica:check`, `exports` map covering `.`, `./heroui-replica`, `./lib/*`, `./styles/generated/tokens.css`, `./styles/global.css`). **Dependencies and devDependencies stay empty for change 01** (per Decision 2a; hoisting preserved until change 06).
- [x] 1.2 Skip: deps stay at the root. (Removed per Decision 2a.)
- [x] 1.3 Add `packages/design-system/tsconfig.json` extending `packages/tsconfig.base.json` and consuming sources as-is (no `tsup` / emit step).
- [x] 1.4 Add `packages/design-system/biome.json` extending the root config and explicitly excluding `dist/ladle/**`, `src/styles/generated/tokens.css`, and `src/heroui-replica/**`.
- [x] 1.5 Add `packages/design-system/ladle.config.ts` mirroring the current root Ladle config (`stories: glob('src/**/*.ladle.tsx')`, port 6006, baseURL `/`, webpack/turbo config stripped). Build output goes to `packages/design-system/dist/ladle/`.
- [x] 1.6 Verify `@unveiled/design-system` is already declared in `tsconfig.base.json` `paths` resolving to `packages/design-system/src/index.ts` (done by change 00; confirm only). Keep the legacy `@/components/ui/...` alias in place for the transition window (removed by change 04).
- [x] 1.7 Add `--filter` shims in the root `package.json` so `bun run ladle`, `bun run ladle:build`, `bun run ladle:coverage`, and `bun run heroui-design-system-replica:check` delegate to `bun --filter @unveiled/design-system run <script>`.
- [x] 1.8 Populate `packages/design-system/src/index.ts` (runtime re-exports of every production primitive) and `packages/design-system/src/heroui-replica/index.ts` (Ladle-only re-exports). The replica's `index.ts` is also updated to import `@/lib/heroui-theme` (still at the root until task 5.3 lands, then re-pointed at `@unveiled/design-system/lib/heroui-theme`).

## 2. Relocate the production UI primitives

- [x] 2.1 `git mv src/components/ui/button.tsx packages/design-system/src/button.tsx`.
- [x] 2.2 `git mv src/components/ui/unveiled-primitives.tsx packages/design-system/src/unveiled-primitives.tsx`.
- [x] 2.3 `git mv src/components/ui/modal.tsx packages/design-system/src/modal.tsx`.
- [x] 2.4 `git mv src/components/ui/drawer.tsx packages/design-system/src/drawer.tsx`.
- [x] 2.5 `git mv src/components/ui/tabs.tsx packages/design-system/src/tabs.tsx`.
- [x] 2.6 `git mv src/components/ui/menu.tsx packages/design-system/src/menu.tsx`.
- [x] 2.7 `git mv src/components/ui/toast.tsx packages/design-system/src/toast.tsx`.
- [x] 2.8 `git mv src/components/ui/safe-image.tsx packages/design-system/src/safe-image.tsx` and `src/components/ui/safe-image.test.tsx packages/design-system/src/safe-image.test.tsx`.
- [x] 2.9 Update internal relative imports inside the moved primitives: `src/components/ui/button.tsx` imports `cn` from `@/lib/utils`; rewrite to relative `../lib/utils` (created in task 5.2). Same for any other `@/lib/...` import inside the package.
- [x] 2.10 Remove the now-empty `src/components/ui/` directory.
- [x] 2.11 Rewrite consumer imports in the 20 files under `src/components/unveiled/**`, `src/components/payments/**`, `src/components/providers/**`, `src/pages/**`, `src/layouts/**`, and `src/actions/**` from `@/components/ui/...` to `@unveiled/design-system`. Run `rg "@/components/ui/" src/` after the rewrite and confirm zero hits outside the package.
- [x] 2.12 Update `packages/design-system/src/index.ts` to re-export `Button`, `buttonVariants`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`, `Panel`, `Card`, `Badge`, `StatPanel`, `StatePanel`, `Divider`, `SafeImage`, and the `UnveiledPrimitives` namespace, matching what the 20 consumer files actually import.

## 3. Relocate the HeroUI replica and its isolation guard

- [x] 3.1 `git mv src/components/ui/heroui-replica packages/design-system/src/heroui-replica` (preserves the `// @ladle-only` headers and the existing `index.ts` / `provider.tsx` / `story-backdrop.tsx` / `design-system-overview.ladle.tsx` files).
- [x] 3.2 Update `packages/design-system/src/heroui-replica/index.ts` to import `heroUITokens` from `@/lib/heroui-theme` (still at the root until task 5.3 lands, then re-pointed at `@unveiled/design-system/lib/heroui-theme`).
- [x] 3.3 Move `scripts/check-heroui-design-system-replica.ts` → `packages/design-system/scripts/check-heroui-design-system-replica.ts` and update its scan-target constants to `packages/design-system/src/heroui-replica/**`.
- [x] 3.4 Update `tests/unit/no-ladle-replica-in-production.test.ts` to scan `packages/design-system/src/heroui-replica/**` (the new location). Keep the legacy `src/**` consumer scan as a transitional backstop; it is removed once changes 04 and 05 land. The regex `REPLICA_IMPORT_RE` is updated to match `packages/design-system/src/**-replica/**` and `@unveiled/design-system/**-replica/**`.

## 4. Move Ladle config and gate scripts into the package; keep Playwright specs at the root

- [x] 4.1 `git mv tests/ladle/coverage.ts packages/design-system/scripts/coverage.ts` and update its target paths to `packages/design-system/src/**/*.ladle.tsx`. Update the package's `ladle:coverage` script to invoke this script.
- [x] 4.2 Keep `tests/ladle/ladle.spec.ts` at the repo root (Playwright test discovery path). Update `playwright.config.*` `ladle` project `testDir` to `./tests/ladle` (already correct) and update `baseURL` to `http://localhost:4321/ladle/` (already correct) so the spec continues to hit `packages/design-system/dist/ladle/index.html` once `bun run ladle:build` writes there.
- [x] 4.3 Keep `tests/ladle/smoke-*.ladle.tsx` at the repo root (they are loaded by `ladle.config.ts`'s `stories: glob('src/**/*.ladle.tsx')` from the package's perspective and via the Ladle dev server's `baseURL`; verify the smoke stories still render after the package move).
- [x] 4.4 Update the root `package.json` `test:ladle` script to ensure the Ladle dev server is reachable (existing `webServer` config in `playwright.config.*` already starts `bun run dev`, which now boots the package's `ladle` shim).

## 5. Move design-token CSS and theme module into the package

- [x] 5.1 `git mv src/styles/generated/tokens.css packages/design-system/src/styles/generated/tokens.css`.
- [x] 5.2 `git mv src/lib/design-tokens.ts packages/design-system/src/lib/design-tokens.ts` and `src/lib/design-tokens.types.ts packages/design-system/src/lib/design-tokens.types.ts` (verify the second file exists; if not, drop this sub-step). Update internal imports inside the moved files to remain within the package.
- [x] 5.3 `git mv src/lib/heroui-theme.ts packages/design-system/src/lib/heroui-theme.ts`. Update its single consumer (`packages/design-system/src/heroui-replica/index.ts`) to import from `@unveiled/design-system/lib/heroui-theme`.
- [x] 5.4 `git mv scripts/generate-design-tokens.ts packages/design-system/scripts/generate-design-tokens.ts` and update its output path to `packages/design-system/src/styles/generated/tokens.css`.
- [x] 5.5 `git mv scripts/check-design-tokens.ts packages/design-system/scripts/check-design-tokens.ts` and update its read path to `packages/design-system/src/styles/generated/tokens.css`.
- [x] 5.6 Update the root `package.json` `tokens:gen` and `tokens:check` scripts to delegate to `bun --filter @unveiled/design-system run tokens:gen` and `bun --filter @unveiled/design-system run tokens:check`. Add `tokens:gen` and `tokens:check` scripts to the package's `package.json`.
- [x] 5.7 Update `src/styles/global.css` to `@import "@unveiled/design-system/styles/generated/tokens.css";` (replaces the local `@import "./generated/tokens.css";`).
- [x] 5.8 Run `bun run tokens:gen` once to regenerate the CSS into the package path; commit the regenerated file.

## 6. Tailwind / Astro plugin boundary

- [x] 6.1 Verified: `@tailwindcss/vite` is already registered in `astro.config.mjs` (line 5 import, line 22 plugin entry). No change required.
- [x] 6.2 Verify `src/styles/global.css` still imports the design-token CSS through the package's `exports` map (task 5.7) and that `bun run dev` boots without Tailwind errors.
- [x] 6.3 Run `bun run typecheck` and `bun run check` to confirm the Astro app still compiles against `@unveiled/design-system` via the path alias.

## 7. Wire the package scripts into the umbrella check

- [x] 7.1 Verify `bun --filter @unveiled/design-system run typecheck` exits zero. (Best-effort: may not be runnable in this sandbox; otherwise CI enforces.)
- [x] 7.2 Verify `bun --filter @unveiled/design-system run lint` exits zero. (Best-effort.)
- [x] 7.3 Verify `bun --filter @unveiled/design-system run test:unit` (runs `safe-image.test.ts`) exits zero. (Best-effort.)
- [x] 7.4 Verify `bun --filter @unveiled/design-system run ladle:coverage` exits zero (no drift in the `@ladle(…)` tags). (Best-effort.)
- [x] 7.5 Verify `bun --filter @unveiled/design-system run heroui-design-system-replica:check` exits zero. (Best-effort.)
- [x] 7.6 Verify `bun --filter @unveiled/design-system run ladle:build` writes `packages/design-system/dist/ladle/index.html`. (Best-effort.)
- [x] 7.7 Verify `bun run check` (which now delegates to the root `--filter` shims) exits zero. (Best-effort.)
- [x] 7.8 Verify `bun run tokens:check` exits zero after `bun run tokens:gen` regenerates into the package path. (Best-effort.)
- [x] 7.9 Verify `bun run test:ladle` and `bun run test:e2e` still pass. (Best-effort; Playwright / browser-dependent.)

## 8. Definition of done

- [x] 8.1 Every task in `tasks.md` is checked off and the change is archived via `openspec archive extract-design-system-package`.
- [x] 8.2 **Human follow-up (not agent-executable per `AGENTS.md` §9).** Update `AGENTS.md` to reference `@unveiled/design-system` as the source of truth for UI primitives, the HeroUI replica, and the Ladle harness (replacing the `src/components/ui/` references in §2, §3, §7, §8).
- [x] 8.3 **Human follow-up (not agent-executable).** Update `packages/README.md` to mark change 01 as complete and remove the "see change 01" stubs from the design-system row.
- [x] 8.4 `openspec validate extract-design-system-package` passes locally and in CI.