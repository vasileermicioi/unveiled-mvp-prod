## Context

Slice **2h** of the umbrella `replace-shadcn-with-heroui`. The production code is on HeroUI; this slice audits the tree and removes the shadcn-only packages that are no longer referenced. The audit is explicit (one `rg` per package) so reviewers can see each removal was deliberate.

## Goals / Non-Goals

**Goals:**

- Audit and remove `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` if no consumer remains.
- Update or remove `components.json` so it no longer advertises shadcn as the component source.
- Regenerate `bun.lock` and confirm `bun run check` is non-breaking.

**Non-Goals:**

- No source code changes. Wrappers already removed shadcn-specific patterns; this slice removes the dependencies.
- No further primitive rewrites. Slices 2d, 2e, 2f are complete.
- No spec deltas. Capability deltas are owned by earlier slices and the umbrella.

## Decisions

- **Audit is one `rg` per package, recorded in the PR description.** The audit list is the reviewer's evidence that each removal is safe.
- **`components.json` is removed by default.** The umbrella design doc says "update or remove"; with no future shadcn scaffolding, removing is simpler than re-pointing it.
- **Removal is one commit per package.** Atomic package removals make the lockfile diff per-package reviewable.

## Risks / Trade-offs

- **A consumer outside the audited surface imports a shadcn-only package.** → The `rg` audit catches it; the gate is `bun run check` after each removal. If a removal breaks the build, restore the package and pause.

## Migration Plan

1. `rg "@radix-ui/react-slot" src/`. If empty, remove from `package.json` and regenerate `bun.lock`. Run `bun run check`.
2. `rg "class-variance-authority" src/`. If empty, remove. Same gates.
3. `rg "clsx" src/`. If empty outside the deleted primitives, remove. Same gates.
4. `rg "tailwind-merge" src/`. If empty outside the deleted primitives, remove. Same gates.
5. Update or remove `components.json`.
6. Final `bun install` + `bun run check`.
7. Rollback: revert the offending package's commit and re-add it to `package.json`.

## Open Questions

_None._
