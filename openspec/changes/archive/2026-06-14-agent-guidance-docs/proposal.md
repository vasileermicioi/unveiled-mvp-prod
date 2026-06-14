## Why

OpenSpec captures "what the system should do" via capability specs and change proposals, but new agents and human contributors still land in the repo with no single "how to work here" entrypoint. `README.md` is a 50-line setup blurb, `docs/guidelines.md` covers style only, and `openspec/project.md` describes the legacy app scope. There is no document that explains the current stack, the OpenSpec workflow, the iteration cycle, the LikeC4/TypeSpec/Style Dictionary toolchains, the gherkin feature model, the file layout, or the definition of done — so every agent session re-derives that context from scratch. This change adds a canonical `AGENTS.md` at the repo root (plus a parallel `CONTRIBUTING.md` for humans and a `context:` block in `openspec/config.yaml`) so that the entrypoint is one read away.

## What Changes

- Add `AGENTS.md` at the repo root (≤ 400 lines) covering: project pitch, `_old_app/` reference-only rule, tech stack with pinned versions, annotated file layout, coding conventions, OpenSpec workflow, iteration cycle, toolchain commands, definition of done, and a "what NOT to do" list.
- Add `CONTRIBUTING.md` (≤ 80 lines) that links to `AGENTS.md` and adds the human-only sections (PR template, review checklist, release process).
- Add a `## MODIFIED Requirements` block to `openspec/specs/architecture-and-guidelines/spec.md` that requires `AGENTS.md` to exist, to be ≤ 400 lines, and to be reviewed whenever the tech stack or iteration cycle changes.
- Add a `context:` block to `openspec/config.yaml` summarizing the same content in machine-readable form for agents that consume the config directly.
- Slim `README.md` to a one-screen pointer to `AGENTS.md` (keep the install/dev/build commands, drop everything else).
- Add a pointer from `docs/guidelines.md` (top of file) to `AGENTS.md` so the existing style doc defers to the canonical entrypoint.

## Capabilities

### New Capabilities

- `agent-guidance`: A repo-root `AGENTS.md` that documents the tech stack, file layout, coding conventions, OpenSpec workflow, iteration cycle, toolchain commands, and definition of done — plus a parallel `CONTRIBUTING.md` for humans and a `context:` block in `openspec/config.yaml`. The doc is the single entrypoint for every new contributor (human or agent) and is updated as part of every iteration summary.

### Modified Capabilities

- `architecture-and-guidelines`: The project MUST have an `AGENTS.md` at the repo root that satisfies the format and content rules in the new `agent-guidance` spec. The doc is reviewed whenever the tech stack or iteration cycle changes.

## Impact

- New files: `AGENTS.md`, `CONTRIBUTING.md`, `openspec/changes/agent-guidance-docs/specs/agent-guidance/spec.md`, `openspec/changes/agent-guidance-docs/specs/architecture-and-guidelines/spec.md` (delta).
- Modified files: `README.md` (slimmed), `openspec/config.yaml` (add `context:` block), `openspec/specs/architecture-and-guidelines/spec.md` (applied delta), `docs/guidelines.md` (top-of-file pointer).
- No runtime, no database, no UI primitive, no API contract changes.
- The new doc is the first thing an agent should read in `09-iteration` when picking up a task. The iteration summary in `09-iteration/00-summary.md` will reference it explicitly.
