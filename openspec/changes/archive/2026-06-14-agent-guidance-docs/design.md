## Context

OpenSpec already gives the repo a clear "what the system should do" layer (capability specs in `openspec/specs/` and change proposals in `openspec/changes/`). What it does not give is a single "how to work in this repo" entrypoint. Today the closest things are:

- `README.md` — a 50-line overview focused on local setup, not conventions.
- `docs/guidelines.md` — TypeScript, Astro layout, and styling rules; useful but does not cover OpenSpec, the iteration cycle, the LikeC4/TypeSpec/Style Dictionary toolchains, the gherkin feature model, or the release/deploy story.
- `docs/architecture.md` — system architecture only.
- `openspec/project.md` — legacy app scope rules; does not describe the current stack.
- `openspec/config.yaml` — schema and rules; commented out, no context.
- A handful of `openspec/changes/archive/*/proposal.md` files that exemplify the proposal format.

There is no single document that tells an agent:

1. What the project is, who uses it, and what is in scope vs. out of scope.
2. What tech stack to use and what versions are pinned.
3. How to find existing capability specs, write a new proposal, and run the validation commands.
4. What the file layout conventions are, including the new `architecture/`, `typespec/`, `design-tokens.json`, and `tests/features/<domain>/` directories.
5. How to run the iteration loop (read the proposal → make the change → run the checks → archive the change).
6. What the "definition of done" is for any change (lint, type-check, gherkin, visual, contract, drift checks).

The repo also has no `CONTRIBUTING.md` for human PR conventions and no machine-readable summary of the same context in `openspec/config.yaml`, so Codex-style agents and CI consumers each re-derive the same facts in their own way.

## Goals / Non-Goals

**Goals:**

- Add `AGENTS.md` at the repo root as the canonical entrypoint for every new contributor (human or agent), in ≤ 400 lines.
- Mirror the same information in a short human `CONTRIBUTING.md` (≤ 80 lines) with PR/review/release specifics.
- Mirror the same information in machine-readable form in `openspec/config.yaml` under a `context:` block.
- Extend `openspec/specs/architecture-and-guidelines/spec.md` with a `## MODIFIED Requirements` block that requires `AGENTS.md` to exist, to be ≤ 400 lines, and to be reviewed whenever the stack or iteration cycle changes.
- Add a parallel `agent-guidance` capability spec that defines the content rules for `AGENTS.md` and `CONTRIBUTING.md`.
- Slim `README.md` to a one-screen pointer that defers everything else to `AGENTS.md` (keep the install/dev/build commands).
- Add a top-of-file pointer in `docs/guidelines.md` to `AGENTS.md` so the style doc defers to the canonical entrypoint.

**Non-Goals:**

- No runtime, database, API, or UI primitive changes.
- No replacement of `docs/guidelines.md` or `docs/architecture.md` — they remain the source of truth for their topics; `AGENTS.md` only links to them.
- No automation that rewrites `AGENTS.md` (the doc is hand-maintained, updated as part of every iteration summary).
- No new CI checks — `openspec validate agent-guidance-docs` is the only machine check this change adds.
- No changes to the OpenSpec schema, the gherkin feature model, or any of the toolchain scripts.

## Decisions

### Decision: One canonical `AGENTS.md` at the repo root, ≤ 400 lines

- **Rationale**: Repo-root placement is the convention every major agent (Claude, Codex, Aider, Cursor) auto-loads. ≤ 400 lines keeps it readable in one sitting and forces it to link out to deeper docs instead of duplicating them.
- **Alternatives considered**:
  - Splitting into `AGENTS.md` + `AGENTS/*.md`: rejected; the entrypoint should be one file.
  - Embedding everything in `README.md`: rejected; `README.md` is a user-facing install/quickstart doc, not a contributor manual.
  - Putting it in `docs/AGENTS.md`: rejected; agents do not all auto-discover `docs/`.

### Decision: Mirror the same content in `CONTRIBUTING.md` (≤ 80 lines) and in `openspec/config.yaml` (`context:` block)

- **Rationale**: Humans look for `CONTRIBUTING.md`; some agents consume `openspec/config.yaml` directly. The three artifacts must stay in sync, but they target different readers and do not need to be byte-identical — `AGENTS.md` is the prose source of truth, `CONTRIBUTING.md` adds PR/review/release specifics, and `context:` is a compact machine summary that points back at `AGENTS.md` for detail.
- **Alternatives considered**:
  - Single file with conditional rendering: rejected; no good templating story, and the audiences are different.
  - Just `AGENTS.md` and skip the mirrors: rejected; humans miss the PR conventions and agents that consume `openspec/config.yaml` re-derive the same facts.

### Decision: Extend the existing `architecture-and-guidelines` capability with a `MODIFIED Requirements` block

- **Rationale**: "What the contributor manual must contain" is a guideline concern, which already lives in that spec. Adding a new requirement that names `AGENTS.md`, the ≤ 400 line cap, and the "reviewed on architecture changes" rule keeps the rule discoverable in the existing capability index.
- **Alternatives considered**:
  - Putting every rule in the new `agent-guidance` capability only: rejected; reviewers reading the architecture-and-guidelines spec would not see the requirement to maintain `AGENTS.md`.
  - Creating a third capability for "doc maintenance": rejected; too granular for one requirement.

### Decision: Slim `README.md` to a one-screen pointer, keep install/dev/build commands

- **Rationale**: `README.md` is what new visitors (including recruiters and external contributors) see first. Once `AGENTS.md` exists, the long-form content in `README.md` is redundant. Keeping the install/dev/build commands preserves the one-screen quickstart.
- **Alternatives considered**:
  - Deleting `README.md` entirely: rejected; GitHub renders it on the repo root, and the install/dev/build commands are still useful as a one-liner.
  - Replacing `README.md` with a symlink to `AGENTS.md`: rejected; GitHub does not follow symlinks for the repo overview.

### Decision: Add a top-of-file pointer in `docs/guidelines.md` instead of merging it into `AGENTS.md`

- **Rationale**: `docs/guidelines.md` is the source of truth for the detailed style rules. `AGENTS.md` summarizes them and points at the doc. Merging them would create two competing sources of truth and bloat `AGENTS.md` past 400 lines.
- **Alternatives considered**:
  - Deleting `docs/guidelines.md` and moving its content into `AGENTS.md`: rejected; the doc already exists, is referenced from CI, and is richer than what `AGENTS.md` needs.

## Risks / Trade-offs

- [Risk] `AGENTS.md` drifts out of date as the stack evolves → Mitigation: The new `architecture-and-guidelines` requirement mandates a review of `AGENTS.md` on every architecture change, and the iteration summary in `.development-plan/0N-iteration/00-summary.md` will call it out as the first update.
- [Risk] `AGENTS.md` exceeds 400 lines and becomes a wall of text → Mitigation: The same requirement enforces the line cap; the doc is structured to point at `docs/guidelines.md`, `docs/architecture.md`, and the OpenSpec specs instead of duplicating them.
- [Risk] `CONTRIBUTING.md`, `AGENTS.md`, and `openspec/config.yaml` `context:` block drift apart → Mitigation: All three name `AGENTS.md` as the prose source of truth, and the validation step (`openspec validate agent-guidance-docs`) flags new capability drift.
- [Risk] Future agents ignore `AGENTS.md` because they were not told to read it → Mitigation: The iteration cycle section in `AGENTS.md` is explicit about reading it first, and the new iteration summary template references it.

## Migration Plan

- Land `AGENTS.md`, `CONTRIBUTING.md`, the `context:` block in `openspec/config.yaml`, the `docs/guidelines.md` pointer, and the slimmed `README.md` in a single change.
- Apply the spec deltas to `openspec/specs/architecture-and-guidelines/spec.md` and add the new `openspec/specs/agent-guidance/spec.md`.
- Run `openspec validate agent-guidance-docs` to confirm the artifacts are consistent.
- No rollback plan needed — the change is additive (new files) or text-only edits to existing files; the worst case is reverting the PR.

## Open Questions

- None. The existing 05-agents-md-project-guidance.md proposal already nails the section list and the line cap; this design only locks in the placement and the relationship to the existing `architecture-and-guidelines` capability.
