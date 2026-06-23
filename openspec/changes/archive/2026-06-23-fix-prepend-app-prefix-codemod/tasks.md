## 1. Tighten the URL-detection regex and exclusion list

- [x] 1.1 In `scripts/codemod-prepend-app-prefix.ts`, replace the per-line URL regex `/(\/[a-z][\w./?=&%-]*)/gi` with `/(?<![:/])\/[a-z][\w-]*(?:\/[\w-]+)*(?:\.\w+)?(?:\?[\w=&%-]*)?(?=#|\s|$|[),;.])/gi` so the match only fires on path-shaped tokens not preceded by `:` or `/`.
- [x] 1.2 In `scripts/codemod-prepend-app-prefix.ts`, extend `rewriteUrl`'s exclusion list with `startsWith("/healthz")`, `startsWith("/readyz")`, `startsWith("/ladle/")`, `startsWith("/favicon.ico")`, and `startsWith("/favicon.svg")` (in addition to the existing `/app`, `/_`, `/api/`, `http://`, `https://` exclusions).

## 2. Add per-scenario skip for normalization tests

- [x] 2.1 In `scripts/codemod-prepend-app-prefix.ts`, add a `let skipScenarioRewrites = false;` flag at the top of the per-file loop.
- [x] 2.2 Inside the per-line walk, reset `skipScenarioRewrites` to `false` whenever a line matches `/^\s*Scenario:|^Background:/`.
- [x] 2.3 When a `Scenario:` line is encountered, set `skipScenarioRewrites = true` if the line matches `/normalizes|does not normalize/i`.
- [x] 2.4 When a step line is processed, skip the URL-replacement pass entirely if `skipScenarioRewrites` is true.

## 3. Add unit tests

- [x] 3.1 Create `scripts/codemod-prepend-app-prefix.test.ts` with `bun:test` cases covering: bare app routes (`/discover`), localized routes (`/en/admin`), query strings (`/discover?tab=metrics`), no-match for `http://localhost:4320`, no-match for `application/json; charset=utf-8`, no-match for `/healthz`, `/readyz`, `/api/...`, `/ladle/...`, `/favicon.ico`, `/favicon.svg`, and the per-scenario skip for normalization-test titles.
- [x] 3.2 Verify `bun test scripts/codemod-prepend-app-prefix.test.ts` runs and passes.

## 4. Wire the test into `bun run test:unit`

- [x] 4.1 If `bun run test:unit` (currently `bun test tests/unit/`) does not already pick up `scripts/codemod-prepend-app-prefix.test.ts`, extend `package.json`'s `test:unit` script to include it (e.g. `bun test tests/unit/ scripts/codemod-prepend-app-prefix.test.ts`).
- [x] 4.2 Run `bun run test:unit` and confirm the new test file runs alongside the existing unit tests.

## 5. Verify the codemod gate

- [x] 5.1 Run `bun run scripts/codemod-prepend-app-prefix.ts --verify` against the current feature tree and confirm it reports zero violations (the false-positive rewrites never landed — they were reverted during this change's discovery).
- [x] 5.2 Run `bun run scripts/codemod-prepend-app-prefix.ts --apply` once as a sanity check; the diff should be empty.

## 6. Document the gate in AGENTS.md

- [x] 6.1 Add a one-line note to `AGENTS.md` §7 next to the `codemod:prepend-app-prefix` row noting that the gate rewrites un-prefixed app routes in `tests/features/**/*.feature`, excludes `/healthz`, `/readyz`, `/api/...`, `/ladle/...`, `/favicon.*`, and skips normalization-test scenarios.

## 7. Run the umbrella gate

- [x] 7.1 Run `bun run check` and confirm the umbrella gate (Biome, `astro check`, `specs:check`, `tokens:check`, `ladle:coverage`, `wrangler:check`, `arch:check`, viewport, console-log, legacy-ui-references, legacy-alias, codemod-prepend-app-prefix) is green.

## 8. Finalize the change

- [x] 8.1 Run `openspec validate fix-prepend-app-prefix-codemod` and confirm it exits zero.
- [ ] 8.2 Commit `scripts/codemod-prepend-app-prefix.ts`, `scripts/codemod-prepend-app-prefix.test.ts`, the `package.json` edit (if any), and the `AGENTS.md` line, and hand off to a human reviewer; do not self-merge.