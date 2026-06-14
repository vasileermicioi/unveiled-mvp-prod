## Context

The repository is moving toward a 10-iteration where every feature must be backed by an executable Gherkin specification, runnable as a Playwright interaction test against the real route *or* a Storybook iframe. The current branch is in the "between" state: a single legacy `tests/features/core-platform.feature` is mentioned in the proposal but does not exist on disk in this iteration; the `tests/` tree contains only `tests/architecture/*.test.ts`. The `08-iteration/04-gherkin-specs-by-domain.md` plan, the recently landed `openapi-contract` proposal (TypeSpec), and the `design-tokens` proposal all converge on a single contract: the per-domain Gherkin files are the executable specification, and they are reusable by both the Playwright runner (this iteration) and the Storybook iframe runner (09-iteration).

This design is greenfield: the directories, step files, runner, and 19 feature files do not exist yet. The implementation is laid out in `tasks.md` in dependency order so each task can be verified in isolation.

## Goals / Non-Goals

**Goals:**

- Land one feature file per epic × surface (19 files across 9 domains) under `tests/features/<domain>/`.
- Land a shared step-definition layer (`tests/steps/verbs/*.ts`) with a tight selector discipline (proximity + layout only).
- Land a small DSL (`tests/steps/dsl.ts`) and selector helpers (`tests/steps/selectors/proximity.ts`, `tests/steps/selectors/layout.ts`) so every verb file reads identically.
- Land a seed module (`tests/steps/seed.ts`) that exposes fixture emails and seed data, replacing the hard-coded values that lived in the legacy `core-platform.feature`.
- Land a runner (`tests/parity/gherkin.spec.ts`) that walks `tests/features/**/*.feature` and dispatches to the step registry, with a `@story(component=…, story=…)` tag schema that opens a Storybook iframe when present.
- Land the new `gherkin-domain-features` capability spec and the `MODIFIED Requirements` deltas for the five downstream capabilities that the proposal ties a gherkin scenario to (`viewer-session`, `routing`, `i18n-copy`, `data-access`, `forms-actions`).
- Land the `MODIFIED Requirements` delta for `e2e-gherkin-playwright` that points the legacy capability at the new per-domain files.

**Non-Goals:**

- The Storybook iframe runner itself is **not** implemented in this iteration. The `@story(...)` tag is parsed and the runner falls back to the real route with a `console.warn` when the tag is missing; the iframe dispatch is a stub that returns a clear "not implemented in 08-iteration, see 09-iteration" error so the schema can be locked in now without the iframe work.
- No new runtime feature, no UI primitive change, no database change, no design-token change.
- The legacy `core-platform.feature` is replaced with an empty `Feature:` header (per the proposal). The last smoke scenario is migrated to `tests/features/infrastructure/parity-smoke.feature` as the one happy-path scenario.
- Visual regression snapshots, performance budgets, and the TypeSpec → Zod validator swap are not touched (they live in other changes).

## Decisions

### Decision 1: One step module per verb, imported by the runner

Every verb file (`auth.steps.ts`, `navigation.steps.ts`, …) imports the shared `Given` / `When` / `Then` from `tests/steps/dsl.ts` and registers its own steps against the global registry. The runner walks the verb directory at module-load time, so a new verb file is automatically picked up with no edits to the runner.

**Alternative considered:** a single mega `step-definitions.ts` (the legacy pattern). Rejected because the proposal calls for 19 feature files and ~10 verbs; a single file would grow past 2 000 lines and would not surface "you added a new verb but forgot to import it" as a compile error.

### Decision 2: Two selector strategies, encoded in a typed `Selector` union

The DSL exposes a `Selector` type that is either `ProximitySelector` or `LayoutSelector`. The runner rejects any step that constructs a CSS string, a `getByText` chain, or a `[data-testid=…]` selector at the type level. The two helper modules (`proximity.ts`, `layout.ts`) are the only places that wrap Playwright's `page.getBy…` API.

**Alternative considered:** allow `getByText` and ban copy-dependent chains via a lint rule. Rejected because the type system is a stronger guarantee and it kills the entire class of "I changed the copy, the test failed" bugs the proposal calls out.

### Decision 3: The `@story(...)` tag is a pure pass-through for 08-iteration

The runner parses `@story(component=Foo,story=Bar)` and emits `console.warn('@story tag present but Storybook iframe runner is not yet implemented; falling back to the real route (see 09-iteration)')`. This locks the schema in now so 09-iteration can land the iframe dispatch as a drop-in change to `tests/parity/gherkin.spec.ts` without re-touching any feature file.

**Alternative considered:** skip the tag entirely and add it in 09-iteration. Rejected because the proposal explicitly asks for the tag schema in this iteration, and adding it later would require touching every scenario.

### Decision 4: Seed data lives in a single `tests/steps/seed.ts`

The seed module exports a `seed()` function and constants for fixture emails. The legacy `core-platform.feature` had hard-coded emails (`member@example.com`, `partner@example.com`, `admin@example.com`); the new feature files all import from `tests/steps/seed.ts` so the seed can be changed in one place.

**Alternative considered:** duplicate the seed into each domain's feature file. Rejected for the same reason the proposal calls out: copy-chains and hard-coded state are the failure mode this proposal is fixing.

### Decision 5: The `step-definitions.ts` legacy barrel is kept as a re-export

The proposal says "split into verbs, kept as barrel". `tests/steps/step-definitions.ts` re-exports every verb module so any external consumer (a legacy spec that is not yet migrated) keeps compiling. The file is empty of behaviour; it is a single `export * from "./verbs/index"` line.

**Alternative considered:** delete the legacy barrel and migrate every consumer in the same iteration. Rejected because the parity suite is the only consumer and the proposal explicitly defers that to 09-iteration.

## Risks / Trade-offs

- **Risk:** the 19 feature files ship a lot of boilerplate `Background:` blocks. → **Mitigation:** every `Background:` block is one of two templates (per-role or per-guest), generated from the seed module; future contributors copy-paste from a documented example in `tests/features/README.md`.
- **Risk:** the `Selector` union rejects the legitimate "click the third event card" case where the index matters. → **Mitigation:** the layout helpers expose `getNthInside(landmark, role, n)` for that exact case; the union is open to extension through a `LayoutSelector.nth(n)` variant.
- **Risk:** the `@story` tag parser is permissive (it just reads anything inside parentheses) and a typo silently downgrades to "fall back to real route". → **Mitigation:** the runner logs the resolved `(component, story)` pair at `INFO` so a contributor can see it took effect; 09-iteration will replace the warning with a real iframe open.
- **Risk:** 19 feature files at 5–15 scenarios each is ~100 scenarios; running them all in CI is slow. → **Mitigation:** the runner supports `BUN_GHERKIN_TAGS` env override so CI can run a representative subset per shard; the default `bun run test:e2e` runs everything in a single Playwright worker (consistent with the existing parity suite).
- **Risk:** TypeScript's type checker may not catch a step that is registered with the wrong argument shape. → **Mitigation:** the DSL exports a `defineStep<Args>(...)` generic that locks the argument parser to a `z.object(...)` schema; a step registered against the wrong shape fails to compile.

## Migration Plan

1. Land the new directories, the DSL, the selector helpers, the seed module, and the runner in one commit (tasks 1–4).
2. Land the 19 feature files in a second commit, grouped by domain (tasks 5–9).
3. Land the capability spec deltas and the `e2e-gherkin-playwright` MODIFIED block in a third commit (tasks 10–11).
4. Wire `bun run test:e2e` to the new runner (task 12) and run `bun run check` to confirm biome/astro/specs pass.
5. 09-iteration replaces the `@story` warning with a real iframe dispatch and migrates the last smoke scenario into `infrastructure/parity-smoke.feature` (out of scope for this iteration).

Rollback: the change is additive; the legacy `core-platform.feature` becomes an empty `Feature:` header but the file is kept on disk. Reverting the merge removes the new directories and the empty legacy file, returning the repo to its pre-change state with no database or runtime impact.

## Open Questions

- **Q1:** Should the runner be a separate `tests/parity/gherkin.spec.ts` or a top-level `tests/gherkin.spec.ts`? → **Decision:** `tests/parity/gherkin.spec.ts`, matching the proposal's stated path and keeping the parity directory as the home for end-to-end tests.
- **Q2:** Should the `step-definitions.ts` barrel re-export the verbs by name or use `export *`? → **Decision:** named re-exports (`export { registerAuthSteps } from "./verbs/auth.steps"`), so a grep across the codebase finds the actual verb module, not the barrel.
- **Q3:** Is the "console.warn on missing @story tag" a regression for legacy scenarios? → **Decision:** the warning is gated by the presence of the tag (legacy scenarios do not have the tag at all → no warning); only scenarios that carry the tag but the iframe runner is not yet implemented trigger the warning, and only in this iteration. 09-iteration removes the warning.
