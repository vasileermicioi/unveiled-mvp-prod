## Why

The umbrella change `replace-shadcn-with-heroui` promotes HeroUI from a Ladle-only dev dependency to the production component library. This slice does only the dependency move: `package.json` + `bun.lock` + a non-breaking check. No code is touched.

This is slice **2a** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Move `@nextui-org/react` (and any HeroUI peer packages it requires at runtime) from `devDependencies` to `dependencies` in `package.json`.
- Run `bun install` to regenerate `bun.lock`; commit the lockfile.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

_None._ This slice is a dependency-only change. Spec-level requirements for `app-shell` and `ui-system` are owned by slices 2c, 2d, 2e, 2f, 2g, and the umbrella itself.

## Impact

- **Modified files:** `package.json`, `bun.lock`.
- **No source code changes.** No consumers are updated in this slice.
