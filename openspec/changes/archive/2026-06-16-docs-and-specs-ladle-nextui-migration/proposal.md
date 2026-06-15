## Why

Three OpenSpec changes land in this iteration that replace the UI tooling (Storybook → Ladle) and the component library (shadcn/ui → Hero UI). Every piece of documentation and every remaining spec in the 10-iteration queue must be updated to reflect the new philosophy and toolchain before the actual migrations ship, so the team works against a consistent contract throughout.

## What Changes

- Update `AGENTS.md` to document Ladle as the storybook replacement, Hero UI as the component library, and the Playwright + proximity selector discipline for all UI testing.
- Update `docs/guidelines.md` to reflect the new component authoring model and testing conventions.
- Update `CONTRIBUTING.md` if it references Storybook or shadcn/ui.
- Update every remaining 10-iteration spec file (`09-jobs-notifications-aria.md` through `31-storybook-runner-extension-already-shipped.md`) to replace any mention of Storybook with Ladle and shadcn/ui with Hero UI, and to use the Playwright + proximity selector testing pattern.
- Update the `openspec/specs/app-shell/spec.md` and any other capability spec that references Storybook or shadcn/ui conventions.
- Update the `architecture/model.ts` LikeC4 model if any component library migration introduces a new external dependency node.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `app-shell`: docs and spec references updated to reflect Ladle and Hero UI naming.

## Impact

- Modified files: `AGENTS.md`, `docs/guidelines.md`, `CONTRIBUTING.md`, all `10-iteration/*.md` specs from 09 onward, `openspec/specs/app-shell/spec.md`, `architecture/model.ts`.
- Out of scope: actual Ladle migration, actual Hero UI component rewrite.