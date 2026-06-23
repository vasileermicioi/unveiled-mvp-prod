## 1. Audit the current model

- [x] 1.1 Run `rg -n "path '[^']*'" architecture/*.likec4` and confirm every `path` value is anchored under one of the live workspace roots (`packages/api`, `packages/app`, `packages/landing`, `packages/orchestrator`, `packages/design-system`). Rewrite any residual pre-monorepo path to its actual location.
- [x] 1.2 Run `bun run arch:drift` and confirm the script reports `arch:drift OK — checked N metadata.path value(s) against the repo.` with no missing paths.

## 2. Tighten the drift script

- [x] 2.1 In `scripts/check-architecture-drift.ts`, declare a `const ALLOWED_PATH_PREFIXES = ["packages/api", "packages/app", "packages/landing", "packages/orchestrator", "packages/design-system"]` near the top of `main()`.
- [x] 2.2 In the per-element loop, before the `existsSync` call, check that `rel` is anchored under one of the prefixes (matches `prefix` exactly, or starts with `prefix + "/"`). If not, push the entry into a `prefixViolations` array (distinct from `missing`).
- [x] 2.3 After the loop, if `prefixViolations` is non-empty, print them using the existing per-element error format (`- element <id> -> metadata.path = '<path>' (declared in <sourceFile>)`) with a header that names the violation (`arch:drift FAILED — path is not under a live workspace root`), and exit non-zero before the `missing` report runs.

## 3. Document the invariant

- [x] 3.1 Add a one-line note to `AGENTS.md` §7 next to the `bun run arch:check` / `bun run arch:drift` rows stating that the drift script requires every `metadata.path` to start with a live workspace root (`packages/<pkg>/...`).

## 4. Verify the umbrella gate

- [x] 4.1 Run `bun run arch:drift` against the (untouched) model and confirm the script still passes with the new prefix check in place.
- [x] 4.2 Run `bun run arch:check` and confirm `likec4 validate` plus `arch:drift` are both green.
- [x] 4.3 Run `bun run check` and confirm the umbrella gate (Biome, `astro check`, `specs:check`, `tokens:check`, `ladle:coverage`, `wrangler:check`, `arch:check`, viewport, console-log, legacy-ui-references, legacy-alias) is green.

## 5. Finalize the change

- [x] 5.1 Run `openspec validate fix-architecture-model-paths` and confirm it exits zero.
- [ ] 5.2 Commit `scripts/check-architecture-drift.ts` and `AGENTS.md` in a single commit and hand off to a human reviewer; do not self-merge.