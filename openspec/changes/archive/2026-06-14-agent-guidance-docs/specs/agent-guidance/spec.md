## ADDED Requirements

### Requirement: Repo-root AGENTS.md exists and is canonical

The project MUST have an `AGENTS.md` at the repository root that acts as the
canonical entrypoint for new contributors and AI agents, and the doc MUST be
kept in sync with the current stack, file layout, and iteration cycle.

#### Scenario: New agent reads the entrypoint first

- **WHEN** a new contributor (human or agent) opens the repository
- **THEN** the first file they read is `AGENTS.md` at the repo root
- **AND** the doc names the project, the tech stack with pinned versions, the
  file layout, the coding conventions, the OpenSpec workflow, the iteration
  cycle, the toolchain commands, and the definition of done

#### Scenario: Stack changes are reflected in AGENTS.md

- **WHEN** a change updates the tech stack, the file layout, the iteration
  cycle, the toolchain commands, or the definition of done
- **THEN** the same change updates `AGENTS.md` in the same pull request
- **AND** reviewers reject the change if `AGENTS.md` was not updated

#### Scenario: AGENTS.md is short and links out

- **WHEN** `AGENTS.md` is read end to end
- **THEN** it is no more than 400 lines
- **AND** it links out to `docs/guidelines.md`, `docs/architecture.md`,
  `openspec/specs/`, and `.development-plan/0N-iteration/` instead of
  duplicating their content

### Requirement: CONTRIBUTING.md mirrors AGENTS.md for humans

The project MUST have a `CONTRIBUTING.md` at the repository root that links to
`AGENTS.md` and adds the human-only sections (pull request template, review
checklist, release process).

#### Scenario: Human contributor finds PR conventions

- **WHEN** a human contributor opens a pull request
- **THEN** `CONTRIBUTING.md` is the first doc they read after `AGENTS.md`
- **AND** it points at the pull request template, the review checklist, and
  the release process
- **AND** it is no more than 80 lines

#### Scenario: CONTRIBUTING.md defers tech details to AGENTS.md

- **WHEN** `CONTRIBUTING.md` describes the stack, the file layout, the
  conventions, the OpenSpec workflow, or the definition of done
- **THEN** it links to `AGENTS.md` for those topics instead of restating them
- **AND** only adds the human-only PR/review/release specifics

### Requirement: openspec/config.yaml exposes a machine-readable context block

The project MUST have a `context:` block in `openspec/config.yaml` that
summarizes the same content as `AGENTS.md` in machine-readable form, so
agents that consume the config directly (for example Codex-style tools) get
the same facts without re-deriving them.

#### Scenario: Agent reads context from openspec config

- **WHEN** an agent reads `openspec/config.yaml`
- **THEN** it finds a `context:` block that names the project, the stack, the
  file layout, the OpenSpec workflow, the iteration cycle, the toolchain
  commands, and the definition of done
- **AND** the block points back at `AGENTS.md` for full detail

#### Scenario: Context block is updated alongside AGENTS.md

- **WHEN** `AGENTS.md` is updated
- **THEN** the `context:` block in `openspec/config.yaml` is updated in the
  same change to keep the summary in sync
