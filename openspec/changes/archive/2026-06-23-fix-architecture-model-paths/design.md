## Context

The LikeC4 model at `architecture/model.likec4` carries one `#has-path` block per element. Each block declares a `path` value that the drift script `scripts/check-architecture-drift.ts` walks to assert the file (or directory) exists in the repo. The script is wired into `bun run check` via `bun run arch:check` (which runs `likec4 validate` followed by `bun run scripts/check-architecture-drift.ts`).

After changes 02 (`2026-06-19-extract-api-package`) and 04 (`2026-06-20-extract-app-package`) moved every file under the legacy `src/` into `packages/app/src/`, `packages/api/src/`, and the orchestrator's `packages/orchestrator/src/`, the model was rewritten so every `path` value is now anchored under one of the live workspace roots. As of this proposal, `bun run arch:drift` reports `arch:drift OK — checked 28 metadata.path value(s) against the repo.` and the umbrella `bun run check` is green for this gate.

The remaining gap: nothing in the drift script prevents a future model edit (or a future rename) from re-introducing a stale `src/...` path. The existing check only validates `existsSync` on the resolved file; it does not assert that the path is under a known workspace root. Without that prefix check, a contributor who pastes a pre-monorepo path (or who moves a file outside `packages/<pkg>/src/...` without rewriting the model) would get a passing drift run until someone notices.

## Goals / Non-Goals

**Goals:**

- Add a prefix allow-list to `scripts/check-architecture-drift.ts` that requires every `metadata.path` value to be anchored under one of `packages/api`, `packages/app`, `packages/landing`, `packages/orchestrator`, or `packages/design-system`. A path is "anchored" when it equals the root exactly (a directory-level path, e.g. `packages/api`) or starts with the root followed by `/` (a file-level path, e.g. `packages/app/src/lib/auth.ts`).
- Keep the allow-list as a hard-coded array in the drift script; mirror the same five workspaces that `package.json` `workspaces` enumerates.
- Surface the failure with the same diagnostic style as the existing missing-path failure (element id, declared path, source file).
- Document the prefix requirement in `AGENTS.md` §7 next to the `arch:check` and `arch:drift` entries.

**Non-Goals:**

- Re-writing any `metadata.path` value in `architecture/model.likec4` — the model is already correct.
- Adding a new `--update` flag behavior or changing the existing `--update` codemod semantics.
- Validating that the path falls under the declared element's package (e.g. an `api` element pointing at `packages/app/...`). That is a stricter invariant and is deferred; the prefix allow-list is the minimum regression guard.
- Touching `likec4 validate` (the upstream type checker) — we are tightening the custom drift script, not LikeC4 itself.

## Decisions

- **Allow-list lives in `scripts/check-architecture-drift.ts`, not in a new config file.** The script is the only consumer; a hard-coded array of five workspace roots is simpler than introducing a `architecture/path-prefixes.json` (or similar) for what is effectively a closed set.
  - *Alternatives considered:*
    - **Read the prefixes dynamically from `package.json` `workspaces`.** Rejected — `package.json` `workspaces` lists `"packages/*"` (a glob), not an enumerated set; parsing it is more code than the value it adds. The hard-coded list mirrors the same five workspaces and is easy to keep in sync.
    - **Move the allow-list to a `likec4.config.json` next to `model.likec4`.** Rejected — the drift script already owns the policy; introducing a parallel config file splits the source of truth.
- **Fail on prefix mismatch before the existence check.** A path that does not start with a live workspace root is never going to exist (or rather, if it does exist it is the wrong file), so the prefix check is a fast pre-filter that produces a clearer error message than `existsSync: false`.
  - *Alternatives considered:*
    - **Run `existsSync` first, then prefix-check only the missing ones.** Rejected — the prefix check is cheap and produces a more diagnostic message ("path is not under a live workspace root" vs. "file not found at src/lib/auth.ts").
- **Single-line error format, matching the existing missing-path style.** The existing report format is `  - element <id> -> metadata.path = '<path>' (declared in <sourceFile>)`. The prefix violation reuses that exact format so reviewers see one consistent diagnostic regardless of why a path failed.
  - *Alternatives considered:*
    - **Use a different prefix-specific error.** Rejected — diverging formats make the script's stderr harder to scan; one format per failure type is enough.
- **`AGENTS.md` update is a one-line annotation under §7.** The drift script's prefix requirement is a contributor-facing invariant; it belongs next to the `arch:check` / `arch:drift` rows in the toolchain table.
  - *Alternatives considered:*
    - **A new `docs/architecture-drift.md` doc.** Rejected — the invariant is one sentence; a doc page is overkill.

## Risks / Trade-offs

- **Drift script becomes more brittle if a new workspace is added without updating the allow-list.** → Mitigation: the spec scenario "Adding a new live workspace root extends the allow-list" makes this explicit; the README in `packages/` already documents the workspace list as the source of truth. The error message names the offending prefix so a contributor can immediately see which root is missing.
- **An element intentionally declared outside the workspace (e.g. a `scripts/` element) would be rejected.** → Mitigation: at the time of this proposal, no element uses a non-workspace path. If one is added in the future, the spec allows the allow-list to be extended deliberately rather than by accident.
- **Confusion between `architecture/` (the model directory) and `packages/*/src/` (the target directories).** The drift script's `path` values point at code, never at the model itself. → Mitigation: the prefix check is explicit and does not accept `architecture/...`; the script's existing error message already names the offending path.
- **The `likeC4 validate` step runs before the drift script.** If the model has a malformed `#has-path` block, `likec4 validate` will fail first and the drift script never runs. → Mitigation: `bun run arch:check` reports both failure modes; this change does not affect `likec4 validate`.

## Migration Plan

This change is additive (a new check) and non-breaking. The model is currently clean, so the rollout is:

1. Read `architecture/model.likec4` once and verify that every `path` tag starts with a live workspace root. (`rg -n "path '[^']*'" architecture/*.likec4` should return only lines starting with `packages/...`.)
2. Edit `scripts/check-architecture-drift.ts` to introduce the prefix allow-list (a `const ALLOWED_PATH_PREFIXES = [...]` array near the top of `main()`) and apply it inside the per-element loop, before the `existsSync` call.
3. Run `bun run arch:drift` to confirm the script still passes against the current model.
4. Add a one-line note to `AGENTS.md` §7 under the `bun run arch:check` / `bun run arch:drift` rows stating that the drift script rejects paths outside `packages/<pkg>/src/...`.
5. Run `bun run check` to confirm the umbrella gate stays green.
6. Commit `scripts/check-architecture-drift.ts` and `AGENTS.md` together.

Rollback: revert the script change and the `AGENTS.md` line. The model is untouched, so there is nothing to re-migrate. The drift script returns to its pre-change behavior.

## Open Questions

- None. The drift script's interface (`existsSync`-style assertion with a `--update` mode) is preserved exactly; the prefix check is an additive fast-fail in the same loop. The allow-list is intentionally closed at the five workspace roots and the spec documents the extension procedure.