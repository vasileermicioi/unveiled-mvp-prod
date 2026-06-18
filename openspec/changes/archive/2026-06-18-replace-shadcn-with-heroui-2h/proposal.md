## Why

Slices 2a–2g moved the production UI onto HeroUI end-to-end. The shadcn scaffolding (`@radix-ui/react-slot`, `class-variance-authority`, possibly `tailwind-merge` and `clsx`) is no longer used by the new code paths. Slice **2h** audits the tree, removes the unused packages, and updates `components.json` so it no longer advertises shadcn as the component source.

This is slice **2h** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Update or remove `components.json` so it no longer advertises shadcn as the component source.
- Audit `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, and `tailwind-merge`. Remove any with no remaining consumer.
- Regenerate `bun.lock` via `bun install`.
- Verify with `bun run check` that the cleanup is non-breaking.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

_None._ The teardown is purely a dependency and config change. The capability deltas for `app-shell` and `ui-system` are owned by earlier slices and the umbrella.

## Impact

- **Modified files:** `package.json`, `bun.lock`, `components.json`.
- **Removed packages (audited):** `@radix-ui/react-slot`, `class-variance-authority`, possibly `clsx`, possibly `tailwind-merge`.
- **No source code changes.** The wrapper slices already removed the shadcn-specific patterns; this slice removes the dependencies they left behind.
