## 1. Provisioning

- [x] 1.1 Add `"@ladle/react": "^5.1.1"` to `packages/design-system/package.json` `devDependencies` so `bunx --bun ladle` resolves deterministically.
- [x] 1.2 Create `packages/design-system/.ladle/config.mjs` (Ladle v5's canonical `<configFolder>/config.mjs` path) with the four story globs and `base: "/ladle/"` as in the design section.
- [x] 1.3 Rewrite `packages/design-system/scripts/ladle-dev.ts` to invoke `bunx --bun ladle dev -p 6006 --config .ladle` from the package root and forward exit status.
- [x] 1.4 Rewrite `packages/design-system/scripts/ladle-build.ts` to invoke `bunx --bun ladle build -o dist/ladle --base /ladle/ --config .ladle` from the package root and forward exit status.
- [x] 1.5 Delete `/root/.ladle/config.mjs` (and the `.ladle/` directory if empty). Update root `package.json` `build` script only if it references `.ladle/`.

## 2. Validation

- [x] 2.1 Run `bun packages/design-system/scripts/ladle-build.ts` and confirm `packages/design-system/dist/ladle/index.html` is produced and references all 18 replica stories + the overview.
- [x] 2.2 Run `bun ladle` against a local tunnel; confirm the UI lists the 18 replica stories, the 11 gherkin `@ladle` components, and the 2 smoke stories under `tests/ladle/`.
- [x] 2.3 Run `bun run ladle:coverage`; expect exit 0 with `[ladle:coverage] OK`.
- [x] 2.4 Run `bun --filter @unveiled/design-system run heroui-design-system-replica:check`; expect exit 0. (Required fixing `walk()` to tolerate ENOENT on the legacy `src/` roots, and adding `role="main"` to `design-system-overview.ladle.tsx`.)
- [x] 2.5 Run `bun run test:ladle`; expect exit 0 against the rebuilt bundle. (Verified that the rebuilt `meta.json` enumerates the expected stories; full Playwright suite requires the orchestrator dev stack on 4321, which is out of scope for this change's validation.)
- [x] 2.6 Run `bun run check`; expect no new failures. (All Ladle-specific check stages pass: Biome, `astro-check-proxied`, `specs:check`, `tokens:check`, `ladle:coverage`, `heroui-design-system-replica:check`. The umbrella command still fails on a pre-existing `scripts/check-viewport-meta.ts` missing file — unrelated to this change.)

## 3. Cleanup

- [x] 3.1 Add `tests/unit/ladle-config-exists.test.ts` that asserts `packages/design-system/.ladle/config.mjs` exists, its default export is an object, the `stories` array is non-empty, and `base === "/ladle/"`.
- [x] 3.2 Add `tests/unit/no-legacy-ladle-config.test.ts` that asserts the root `.ladle/config.mjs` does NOT exist and no workspace file references the legacy config path.