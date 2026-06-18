## Why

Slices 2a–2h shipped the full umbrella. Slice **2i** is the closing gate: the umbrella's full check matrix runs end-to-end, the proposal is updated (or superseded) if any public prop signature drifted, and the umbrella change is archived once the PR merges.

This is slice **2i** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Run the umbrella's full check matrix: `bun run check`, `bun run check:heroui-replica`, `bun run test:e2e`, `bun run test:ladle`, `bun run build`.
- Update the umbrella's `proposal.md` (or supersede with a new proposal) if any public prop signature changed during 2d/2e/2f.
- Run `openspec validate replace-shadcn-with-heroui` after any proposal update.
- Run `openspec archive replace-shadcn-with-heroui` once the PR merges.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

_None._ This slice is a verification + archival step. Capability deltas are owned by earlier slices and the umbrella.

## Impact

- **Modified files:** `openspec/changes/replace-shadcn-with-heroui/proposal.md` (only if a public prop signature drifted).
- **Archival:** `openspec archive` moves the umbrella to `openspec/changes/archive/<date>-replace-shadcn-with-heroui/`.
