## Context

Slice **2i** of the umbrella `replace-shadcn-with-heroui`. The umbrella's work is complete; this slice is the final verification gate and the archival step. No source code is modified unless a test reveals a real prop-signature drift, in which case the umbrella's `proposal.md` is updated and re-validated before archival.

## Goals / Non-Goals

**Goals:**

- Run the umbrella's full check matrix end-to-end and confirm green.
- Update the umbrella's `proposal.md` (or supersede with a new proposal) if any public prop signature changed during slices 2d/2e/2f.
- Archive the umbrella change with `openspec archive` once the PR merges.

**Non-Goals:**

- No new code. Source code is owned by slices 2a–2h.
- No new packages. Dependency changes are owned by 2a and 2h.

## Decisions

- **Test failure policy: stop and report.** Per your decision, any failure in `bun run test:e2e` or `bun run test:ladle` pauses the slice; do not silently rewrite scenarios or wrappers.
- **Bundle size: enforce the existing budget.** If `bun run build` reports a regression, file a follow-up task; do not roll back a shipped slice to fix bundle size.

## Risks / Trade-offs

- **A test reveals a real prop-signature drift that was not caught during 2d/2e/2f.** → Update the umbrella's `proposal.md` to record the drift, re-validate, and proceed. If the drift is breaking (a behavior change, not just a name change), file a follow-up change and pause 2i.
- **The umbrella's `proposal.md` was never updated for the slice approach.** → If the proposal is now stale (it describes one umbrella change, not nine), supersede it with a one-page summary that points at the nine sub-changes.

## Migration Plan

1. Run `bun run check` (umbrella check).
2. Run `bun run check:heroui-replica` (umbrella replica check).
3. Run `bun run test:e2e`. On failure, stop and report.
4. Run `bun run test:ladle`. On failure, stop and report.
5. Run `bun run build` and confirm bundle size is within the existing budget.
6. Update the umbrella's `proposal.md` if any prop signature drifted; otherwise leave it.
7. Run `openspec validate replace-shadcn-with-heroui`.
8. After the PR merges: `openspec archive replace-shadcn-with-heroui`.
9. Rollback: revert any individual slice; this slice has no source code of its own to roll back.

## Open Questions

_None._
