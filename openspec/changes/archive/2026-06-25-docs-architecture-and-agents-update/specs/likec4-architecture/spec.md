## MODIFIED Requirements

### Requirement: Drift Check Fails On Missing Paths

A drift check SHALL walk every model element's referenced file path (`metadata.path`) and fail the build if any path is missing from the repo. Every `metadata.path` value SHALL be anchored under one of the live workspace roots declared in `package.json` `workspaces` (`packages/api`, `packages/app`, `packages/landing`, `packages/orchestrator`, `packages/design-system`) so the architecture model cannot regress to pre-monorepo `src/...` paths after a future rename or extraction. A `metadata.path` value is considered anchored when it is exactly the workspace root name (a directory-level path) or when it starts with the workspace root followed by `/` (a file-level path). The LikeC4 model SHALL declare a `DesignSystem` container inside `unveiled` with `metadata.path = packages/design-system`, and the container's components (`atoms`, `molecules`, `organisms`, `templates`, `pages`) SHALL each carry `metadata.path` anchored under `packages/design-system/src/<layer>/` (or omit `metadata.path` if the layer directory does not yet exist on disk). The drift script SHALL refuse to allow a `metadata.path` value of `src/components/ui/heroui-replica/` or any other pre-iteration-13 `src/`-anchored path; the value MUST be re-rooted under a live workspace root.

#### Scenario: Drift check is wired as a script

- **WHEN** a developer runs `bun run arch:drift`
- **THEN** the script walks every model element
- **AND** asserts each `metadata.path` value is anchored under one of the live workspace roots (`packages/api`, `packages/app`, `packages/landing`, `packages/orchestrator`, `packages/design-system`), matching either the bare root or the root followed by `/`
- **AND** asserts each `metadata.path` value exists in the repo
- **AND** exits non-zero on the first missing path or the first path that is not anchored under a live workspace root.

#### Scenario: Drift check runs in CI

- **WHEN** a pull request is opened or updated
- **THEN** CI runs `bun run arch:check` and `bun run arch:drift`
- **AND** the build fails if either check reports an error
- **AND** a contributor who adds a `metadata.path` value of `src/lib/foo.ts` (or any other non-workspace-root prefix) sees a clear failure that names the offending path.

#### Scenario: Deleting a tracked file fails CI

- **WHEN** a contributor deletes a tracked file (e.g. an Astro page or lib module) without updating the model
- **THEN** the drift check reports the missing path
- **AND** the build fails with a clear error message.

#### Scenario: Drift check supports a deliberate rename

- **WHEN** a contributor renames a tracked file
- **THEN** running `bun run arch:drift --update` rewrites the model paths in place
- **AND** a subsequent `bun run arch:drift` (without `--update`) passes.

#### Scenario: Adding a new live workspace root extends the allow-list

- **WHEN** a contributor adds a new workspace root to `package.json` `workspaces` (e.g. `packages/foo/`)
- **THEN** the drift script's allow-list is updated to include `packages/foo/` in the same change
- **AND** the model can immediately reference files under the new root without the drift check rejecting them.

#### Scenario: Design-system container and components are anchored correctly

- **WHEN** `bun run arch:drift` runs after iteration 13 lands
- **THEN** the `designSystem` container inside `unveiled` carries
  `metadata.path = packages/design-system`
- **AND** every layer component under `designSystem` (`atoms`,
  `molecules`, `organisms`, `templates`, `pages`) carries a
  `metadata.path` anchored under `packages/design-system/src/<layer>/`
  or omits `metadata.path` entirely
- **AND** the drift check exits 0; the design-system container is
  treated as a first-party peer of `App` and `Landing`.