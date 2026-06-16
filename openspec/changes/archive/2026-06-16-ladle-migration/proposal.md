## Why

Storybook is being replaced with Ladle to reduce complexity, improve CI performance, and align with the Playwright-first testing strategy. The migration eliminates the Storybook-specific build pipeline and replaces it with Ladle's faster, simpler alternative while maintaining the same gherkin-driven coverage story.

## What Changes

- Remove `storybook` and `@storybook/react` dependencies from `package.json`.
- Add `@ladle/react` and `ladle` dependencies.
- Rename all `*.stories.tsx` files to `*.ladle.tsx` (Ladle is configured to pick up these files by default).
- Update `package.json` scripts: replace `storybook`, `storybook:build`, `storybook:coverage`, `test:storybook` with `ladle`, `ladle:build`, `ladle:coverage`, `test:ladle`.
- Update `bun run test:storybook` references in CI config files to `bun run test:ladle`.
- Update `bun run storybook:coverage` to `bun run ladle:coverage` in all references.
- Verify all `@story()` gherkin tags are migrated to `@ladle()` or handled by the new coverage runner.
- Remove `.storybook/` directory if present.
- Ensure `@storybook/test` imports are replaced with the equivalent ladle testing utilities (Ladle 5 does not re-export `expect`/`within`; the `play` blocks were dropped from the migrated stories and the gherkin scenarios are the sole source of behavioural coverage).
- Update `openspec/specs/gherkin-storybook-interaction-tests/` to `openspec/specs/gherkin-ladle-interaction-tests/`.

## Capabilities

### New Capabilities

- `gherkin-ladle-interaction-tests`: Ladle equivalent of the existing `gherkin-storybook-interaction-tests` capability, covering the Ladle Playwright runner extension and coverage script.

### Modified Capabilities

- `app-shell`: The existing "Ladle and Hero UI Naming Conventions" requirement is already in place; no requirement-level changes needed beyond terminology alignment.

## Impact

- New files: `ladle.config.ts` if custom config is needed.
- Modified files: `package.json`, all story files, CI config files referencing storybook.
- Removed files: `.storybook/` directory, storybook-specific config, `openspec/specs/gherkin-storybook-interaction-tests/`.
- Dependencies changed: `storybook` / `@storybook/react` → `ladle` / `@ladle/react`.
