## Context

The repository currently uses Storybook 8 as the component story tool with a Playwright runner that executes gherkin scenarios against story iframes. The setup includes:

- `.storybook/` directory with `main.ts` and `preview.ts`
- `tests/storybook/` with `storybook.spec.ts`, `coverage.ts`, and smoke story files
- `tests/steps/storybook.ts` with `runStepInStory` helper
- `tests/steps/storybook-helpers.ts` with feature/tag parsing utilities
- `src/components/**/*.stories.tsx` files
- `package.json` scripts: `storybook`, `storybook:build`, `storybook:coverage`, `test:storybook`
- `bun run storybook:coverage` wired into `bun run check`

Ladle is a faster, lighter alternative that produces static builds and uses the same `@ladle/react` API surface as Storybook. It supports `.ladle.tsx` files natively and the `@ladle/react` package provides equivalent testing utilities.

## Goals / Non-Goals

**Goals:**
- Replace Storybook with Ladle as the component story tool
- Maintain the same gherkin-driven `@ladle()` coverage story
- Preserve the Playwright runner and proximity+layout selector discipline
- Ensure `bun run test:ladle` and `bun run ladle:coverage` work identically to their storybook predecessors
- Reduce CI build time and operational complexity

**Non-Goals:**
- No changes to the existing gherkin step registry or DSL
- No changes to the `tests/parity/` real-route runner
- No changes to component implementations — only renaming and import updates

## Decisions

### 1. Replace `storybook` + `@storybook/react` with `ladle` + `@ladle/react`

Ladle provides a compatible API to Storybook for component stories. The `@ladle/react` package exports the same `storiesOf`, `story`, `meta` exports used in existing stories.

**Alternatives considered:**
- **Keep Storybook + accept complexity**: Rejected — Storybook's build pipeline and addon system add overhead that Ladle eliminates.
- **Build custom Vite story runner**: Rejected — unnecessary reinvention when Ladle provides the equivalent functionality out of the box.

### 2. Rename `*.stories.tsx` to `*.ladle.tsx`

Ladle's default file discovery targets `*.ladle.tsx` files. Existing `*.stories.tsx` files will be renamed to maintain consistency with Ladle's conventions.

**Alternatives considered:**
- **Keep `.stories.tsx` extension**: Rejected — Ladle's default configuration does not pick up `.stories.tsx` files without additional Vite plugin configuration, and the project already uses the `.ladle.tsx` extension elsewhere.
- **Use `.stories.tsx` with explicit Ladle config**: Rejected — the migration doc explicitly recommends renaming to `.ladle.tsx`.

### 3. Replace `@storybook/test` imports with `@ladle/react`

Ladle's testing utilities (`beforeAll`, `afterAll`, `test`, `expect`) are re-exported from `@ladle/react`. The existing `@storybook/test` imports in smoke story files will be updated.

### 4. Reuse `tests/storybook/` as `tests/ladle/`

The existing test infrastructure will be migrated rather than recreated:
- `tests/storybook/coverage.ts` → `tests/ladle/coverage.ts` (updated for `@ladle()` tags)
- `tests/storybook/storybook.spec.ts` → `tests/ladle/ladle.spec.ts`
- `tests/storybook/smoke-*.stories.tsx` → `tests/ladle/smoke-*.ladle.tsx`
- `tests/steps/storybook.ts` → `tests/steps/ladle.ts`
- `tests/steps/storybook-helpers.ts` → `tests/steps/ladle-helpers.ts`

The `STORYBOOK_URL` env var will be renamed to `LADLE_URL` for clarity.

### 5. Update coverage script for `@ladle()` tags

The coverage script will be updated to:
- Parse `@ladle(component=..., story=...)` tags instead of `@story(...)`
- Look for `.ladle.tsx` files instead of `.stories.tsx`
- Check for `parameters.ladle.skipCoverage = true` opt-out instead of `parameters.storybook.skipCoverage = true`

### 6. Archive `openspec/specs/gherkin-storybook-interaction-tests/`

The existing spec will be archived and replaced with `openspec/specs/gherkin-ladle-interaction-tests/` covering the Ladle-based equivalent.

## Risks / Trade-offs

[Risk] → Some gherkin scenarios may still have `@story()` tags that are not migrated
→ **Mitigation**: The coverage script will fail on any remaining `@story()` tags, catching drift before merge.

[Risk] → Ladle's static build output path differs from Storybook's
→ **Mitigation**: `public/ladle/` replaces `public/storybook/` — update all CI configs and `LADLE_URL` defaults.

[Risk] → Smoke story files under `tests/storybook/` currently use `@storybook/test`
→ **Mitigation**: Update imports to `@ladle/react` which re-exports the same testing utilities.

[Risk] → The `runStepInStory` helper name is storybook-specific
→ **Mitigation**: Rename to `runStepInLadle` in `tests/steps/ladle.ts`; update all references.

## Migration Plan

1. Update `package.json`: remove `storybook` + `@storybook/react`, add `ladle` + `@ladle/react`, rename scripts
2. Rename all `src/components/**/*.stories.tsx` to `*.ladle.tsx`
3. Update `tests/storybook/` → `tests/ladle/` with updated file names and `@ladle()` references
4. Update `tests/steps/storybook.ts` → `tests/steps/ladle.ts` with `runStepInLadle`
5. Update `tests/steps/storybook-helpers.ts` → `tests/steps/ladle-helpers.ts`
6. Remove `.storybook/` directory
7. Update CI configs that reference `storybook` scripts or `STORYBOOK_URL`
8. Update `openspec/specs/gherkin-storybook-interaction-tests/` → archive and create new ladle spec
9. Run `bun run ladle --version` to verify installation
10. Run `bun run ladle build` and verify output at `public/ladle/`
11. Run `bun run ladle:coverage` and fix any drift
12. Run `bun run check` to verify full pipeline
