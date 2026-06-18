## Context

Slice **2a** of the umbrella `replace-shadcn-with-heroui`. The umbrella promotes HeroUI to the production component library; this slice is the dependency-only precondition for every later slice. No source code is modified.

## Goals / Non-Goals

**Goals:**

- Move `@nextui-org/react` (and any HeroUI peer packages required at runtime) from `devDependencies` to `dependencies`.
- Regenerate `bun.lock` via `bun install`.
- Confirm the dependency move alone is non-breaking (`bun run check` + `bun run ladle:coverage` stay green).

**Non-Goals:**

- No code changes. No consumer updates. No shadcn removal. No provider mounting.
- No new HeroUI imports. The package simply becomes resolvable from production code paths.

## Decisions

- **Move only `@nextui-org/react` in this slice; audit peers during slice 2c.** Peer packages (e.g. `@nextui-org/theme`, `framer-motion`) are pulled transitively today and remain transitive after the move. If any peer is later required at runtime from production code, slice 2c (provider mount) will catch it and add it explicitly.
- **Lockfile is committed.** `bun.lock` is part of the source of truth; reviewers should see the diff.

## Risks / Trade-offs

- **Lockfile churn looks large in review.** → Keep the PR description short: one-line summary + bullet list of any new transitive packages. No functional change.
- **Hidden runtime peer requirement is not surfaced until slice 2c.** → Slice 2c's `bun run build` gate (SSR smoke) will catch it; if it fails, add the missing peer to `dependencies` in that slice and re-run.

## Migration Plan

1. Edit `package.json`: move `@nextui-org/react` from `devDependencies` to `dependencies`.
2. Run `bun install`.
3. Run `bun run check` and `bun run ladle:coverage`.
4. Commit `package.json` + `bun.lock` as a single dependency-only change.
5. Rollback: revert the single commit. No code is touched, so rollback is one `git revert`.

## Open Questions

_None._
