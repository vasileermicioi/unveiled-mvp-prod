## 1. Author AGENTS.md

- [x] 1.1 Draft `AGENTS.md` at the repo root (≤ 400 lines) with the section list from the proposal: project pitch + `_old_app/` reference-only rule, tech stack with pinned versions, annotated file layout, coding conventions, OpenSpec workflow, iteration cycle, toolchain commands, definition of done, and a "what NOT to do" list.
- [x] 1.2 Confirm `AGENTS.md` is ≤ 400 lines and links out to `docs/guidelines.md`, `docs/architecture.md`, `openspec/specs/`, and `.development-plan/0N-iteration/` instead of duplicating their content.

## 2. Author CONTRIBUTING.md

- [x] 2.1 Draft `CONTRIBUTING.md` at the repo root (≤ 80 lines) that links to `AGENTS.md` and adds the human-only sections: pull request template pointer, review checklist, and release process.
- [x] 2.2 Confirm `CONTRIBUTING.md` defers all stack, layout, convention, OpenSpec, and definition-of-done content to `AGENTS.md` and only adds the human-only specifics.

## 3. Add openspec/config.yaml context block

- [x] 3.1 Add a `context:` block to `openspec/config.yaml` summarizing the project, stack, file layout, OpenSpec workflow, iteration cycle, toolchain commands, and definition of done, and pointing back at `AGENTS.md` for full detail.

## 4. Slim README.md and link from docs/guidelines.md

- [x] 4.1 Slim `README.md` to a one-screen pointer: keep the install/dev/build commands and replace the rest with a single line that defers to `AGENTS.md` and `CONTRIBUTING.md`.
- [x] 4.2 Add a top-of-file pointer in `docs/guidelines.md` that defers to `AGENTS.md` for the canonical contributor entrypoint.

## 5. Apply Spec Deltas

- [x] 5.1 Apply the `agent-guidance` capability spec to `openspec/specs/agent-guidance/spec.md` (copy from `openspec/changes/agent-guidance-docs/specs/agent-guidance/spec.md`).
- [x] 5.2 Apply the `architecture-and-guidelines` MODIFIED Requirements delta to `openspec/specs/architecture-and-guidelines/spec.md` (copy from `openspec/changes/agent-guidance-docs/specs/architecture-and-guidelines/spec.md`).

## 6. Verify

- [x] 6.1 Run `openspec validate agent-guidance-docs` and confirm the change is consistent.
- [x] 6.2 Run `openspec status --change agent-guidance-docs` and confirm every `applyRequires` artifact is `done`.
- [x] 6.3 Confirm `AGENTS.md` is ≤ 400 lines and `CONTRIBUTING.md` is ≤ 80 lines.

## 7. Archive

- [x] 7.1 Run the archive command (`openspec archive agent-guidance-docs`) once all of the above is verified.
