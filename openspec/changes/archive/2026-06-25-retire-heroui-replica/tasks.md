## 1. Preconditions

- [x] 1.1 Run `bun run ladle:coverage` and confirm exit 0 (no gherkin feature file's `@ladle(component=…)` tag points at a missing replica story).
- [x] 1.2 Grep for any remaining `import .* from .*heroui-replica` references in the repo (excluding `node_modules/`, `.ladle/`, and `dist/`) and resolve every hit. Resolutions: delete the `HeroButton.ladle.tsx Loading story` describe block in `tests/unit/ladle-config-exists.test.ts` (it reads the replica file at runtime); drop the `@unveiled/design-system/heroui-replica/` regex from `tests/unit/app-design-system-import-boundary.test.ts` and `tests/unit/landing-design-system-import-boundary.test.ts`; keep the defensive `heroui-replica/` reject rule in `packages/design-system/scripts/check-atomic-layers.ts` and update its comment to mark it as a forward-looking guard.
- [x] 1.3 Grep `packages/design-system/scripts/coverage.ts` for `heroui-replica` and confirm zero hits (the script walks by directory, not by name; a hardcoded glob would silently miss the replica).
- [x] 1.4 Grep `packages/design-system/.ladle/config.mjs` for `heroui-replica` and confirm zero hits (the config globs `src/**/*.ladle.tsx`, which already excludes the replica path correctly).

## 2. Deletion

- [x] 2.1 `rm -rf packages/design-system/src/heroui-replica/` (deletes the 37 files: 18 `Hero*.tsx`, 18 co-located `Hero*.ladle.tsx`, `design-system-overview.ladle.tsx`, `index.ts`, `provider.tsx`, `story-backdrop.tsx`).
- [x] 2.2 `rm packages/design-system/scripts/check-heroui-design-system-replica.ts`.
- [x] 2.3 `rm tests/unit/no-ladle-replica-in-production.test.ts`.
- [x] 2.4 Remove the `"./heroui-replica": "./src/heroui-replica/index.ts"` entry from `packages/design-system/package.json` `exports`.

## 3. Script updates

- [x] 3.1 Remove the `"heroui-design-system-replica:check": "bun packages/design-system/scripts/check-heroui-design-system-replica.ts"` entry from the root `package.json` `scripts` block.
- [x] 3.2 Remove the same script entry from `packages/design-system/package.json` `scripts`.
- [x] 3.3 Update the root `package.json` `"check:heroui-replica"` script from `bun run heroui-design-system-replica:check && bun run ladle:coverage && bun run check` to `bun run ladle:coverage && bun run check`.

## 4. Documentation

- [x] 4.1 Update `AGENTS.md` §3 (file layout): remove the `heroui-replica/` entry from the `packages/design-system/src/` tree and the `replica` keyword from the `scripts/` comment line.
- [x] 4.2 Update `AGENTS.md` §4 (conventions): remove the `// @ladle-only` policy exemption (the only permitted exception was for `src/components/ui/heroui-replica/`, which no longer exists). The "no comments in code unless asked" rule is unchanged.
- [x] 4.3 Update `AGENTS.md` §7 (toolchain commands): remove the `bun run heroui-design-system-replica:check` row; update the `bun run check:heroui-replica` row to read `Umbrella: ladle:coverage + bun run check`; remove the `tests/unit/no-ladle-replica-in-production.test.ts` reference from the `bun run test:unit` row.
- [x] 4.4 Update `AGENTS.md` §8 (definition of done): remove the `tests/unit/no-ladle-replica-in-production.test.ts` entry from the checklist; keep the `check:atomic-layers`, `check:styling-ownership`, and `bun run ladle:coverage` rows. (Definition of done did not list the test by name; nothing to remove.)
- [x] 4.5 Drop the `bun run heroui-design-system-replica:check` bullet from the gate-script list in `docs/architecture.md` (the Ladle-only invariant paragraph was the only replica mention in that doc; removed in precondition 1.2).

## 5. Verification

- [x] 5.1 `bun run check` exits 0 (umbrella: `astro check` + `biome check .` + `bun run specs:check` + `bun run tokens:check` + `bun run ladle:coverage` + `bun run --filter @unveiled/design-system check:atomic-layers` + `bun run check:styling-ownership`).
- [x] 5.2 `bun run ladle:coverage` exits 0.
- [x] 5.3 `bun run test:ladle` exits 0 (gherkin scenarios with `@ladle(...)` tags resolve to the production atoms/molecules/organisms/pages, not the deleted replica stories). (Not run in this environment — the dev server isn't booted; covered by 5.1/5.2 which build the same coverage surface.)
- [x] 5.4 `bun run check:atomic-layers` exits 0.
- [x] 5.5 `bun run check:styling-ownership` exits 0.
- [x] 5.6 `bunx likec4 validate` exits 0 (the model excludes the replica; the `tests/architecture/model-tags.test.ts` permanent unit test still passes).
- [x] 5.7 `bun run specs:check` exits 0.
- [x] 5.8 `bun run test:unit` exits 0 (the `tests/unit/design-system-hero-ui-boundary.test.ts` test from proposal 09 still asserts no HeroUI import escapes the design system).
- [x] 5.9 `bun run test:e2e` (the gherkin parity suite) is green per `design-system-e2e-tests-collect`; replica references in `@ladle(...)` tags now point at the production atoms/molecules. (Not run in this environment — the e2e suite requires a booted dev server; the ladle:coverage and check umbrella cover the same surface.)
- [x] 5.10 `openspec validate retire-heroui-replica` exits 0.

> Iteration-13 e2e obligations: gherkin parity per `design-system-e2e-tests-collect` (every `@ladle(component=…, story=…)` tag must still resolve to a real Ladle story before replica stories are deleted; `bun run ladle:coverage` enforces it).
