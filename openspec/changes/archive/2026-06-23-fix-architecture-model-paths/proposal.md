## Why

The LikeC4 model at `architecture/model.likec4` previously carried 25 stale `path` tags pointing to pre-monorepo locations (`src/lib/auth.ts`, `src/actions/index.ts`, `src/db/schema.ts`, etc.) after changes 02 (`2026-06-19-extract-api-package`) and 04 (`2026-06-20-extract-app-package`) moved every file under `src/` into `packages/app/src/` or `packages/api/src/`. `bun run arch:drift` (wired into `bun run check`) walked the `path` tags and failed the umbrella gate. The model has since been updated to point at the post-monorepo locations, but there is no regression guard: nothing prevents a future model edit (or a future monorepo move) from re-introducing stale `src/...` paths, and the drift script does not assert that every container's `path` tag is anchored under one of the live `packages/<pkg>` roots. This change locks the model in its current correct state and adds the regression guard that was missing.

## What Changes

- **Audit `architecture/model.likec4`** and confirm every `#has-path` block uses a `path` value that resolves to an existing file under one of the four live workspace roots (`packages/api`, `packages/app`, `packages/landing`, `packages/orchestrator`, or `packages/design-system`).
- **Tighten `scripts/check-architecture-drift.ts`** so it (a) rejects any `path` tag that does not start with one of the live workspace roots (`packages/api/`, `packages/app/`, `packages/landing/`, `packages/orchestrator/`, `packages/design-system/`) and (b) continues to assert the file exists on disk.
- **Re-run `bun run arch:check`** and `bun run arch:drift` to confirm the umbrella gate stays green.
- **Document the regression guard** in `AGENTS.md` §7 (toolchain) so future contributors know that the drift script enforces the package-root prefix.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `likec4-architecture`: the architecture model's `path` tags MUST point to files under one of the live workspace roots (`packages/api/`, `packages/app/`, `packages/landing/`, `packages/orchestrator/`, `packages/design-system/`), and the drift script MUST reject any `path` tag whose value does not start with one of those prefixes in addition to checking that the file exists.

## Impact

- **New files:** _none._
- **Modified files:**
  - `scripts/check-architecture-drift.ts` — reject `path` tags that don't start with a live workspace root, before the existing existence check.
  - `AGENTS.md` §7 — note the package-root prefix requirement next to the `arch:check` / `arch:drift` entries.
  - `architecture/model.likec4` — only if the audit surfaces a residual stale path (none expected at proposal time; `bun run arch:drift` is currently green).
- **Removed files:** _none._
- **Dependencies changed:** _none._
- **Risks:**
  - **False positive on a legitimate non-package path.** A future container that intentionally lives outside the workspace (e.g. `scripts/` or `architecture/`) would be rejected. → Mitigation: limit the prefix allow-list to the five workspace roots and require that any new "live" root be added to both the allow-list and `workspaces` in `package.json`.
  - **Audit reveals a real stale path.** → Mitigation: the script change is independent of the audit; the audit runs first and any residue is rewritten in the same change before the guard is added.