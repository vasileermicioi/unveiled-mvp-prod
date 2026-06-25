# agent-guidance Specification

## Purpose
Defines the canonical repo-root `AGENTS.md` (and its human `CONTRIBUTING.md` mirror) that every new contributor — human or AI agent — reads first. The doc is the single entrypoint for the tech stack, file layout, coding conventions, OpenSpec workflow, iteration cycle, toolchain commands, and definition of done.
## Requirements
### Requirement: Repo-root AGENTS.md exists and is canonical

The project MUST have an `AGENTS.md` at the repository root that acts as the
canonical entrypoint for new contributors and AI agents, and the doc MUST be
kept in sync with the current stack, file layout, and iteration cycle. The
doc MUST describe the design-system boundary introduced in iteration 13:
the atomic-design layering (atoms → molecules → organisms → layouts →
pages) under `packages/design-system/src/`, the rule that `app/` and
`landing/` consume the design system only and never its dependencies
(HeroUI, `lucide-react`, `@unveiled/design-system/lib/*`), and the
forbidden use of raw Tailwind utility classes in `app/` and `landing/`
outside the design-system semantic classes imported via
`@unveiled/design-system/styles/global.css`.

#### Scenario: New agent reads the entrypoint first

- **WHEN** a new contributor (human or agent) opens the repository
- **THEN** the first file they read is `AGENTS.md` at the repo root
- **AND** the doc names the project, the tech stack with pinned versions, the
  file layout, the coding conventions, the OpenSpec workflow, the iteration
  cycle, the toolchain commands, and the definition of done
- **AND** §2 (Styling) calls out atomic-design layering and lists HeroUI as
  a private dependency of `@unveiled/design-system`
- **AND** §3 (file layout) shows the layered design-system directory tree
  (atoms, molecules, organisms, layouts, pages, providers, lib, styles,
  heroui-replica) under `packages/`
- **AND** §4 (conventions) forbids raw Tailwind utility classes in `app/`
  and `landing/` outside the design-system semantic classes
- **AND** §7 (toolchain commands) lists `bun run check:atomic-layers` and
  `bun run check:styling-ownership` as gate scripts
- **AND** §8 (definition of done) requires a Ladle page for every UI change
  in `app/` or `landing/`
- **AND** §9 (what NOT to do) treats the design-system boundary as a hard
  rule (no HeroUI / lucide imports outside the design system; no raw
  Tailwind utilities outside the design-system semantic classes; no
  `@unveiled/design-system/lib/*` imports).

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
- **AND** it links out to `docs/architecture.md#design-system-boundary`
  for the long-form layer hierarchy and CSS ownership rules
- **AND** it links out to `openspec/specs/design-system-package/spec.md`
  for the testable capability contract.

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

### Requirement: Iteration 13 E2E Reference Surfaces In AGENTS.md

`AGENTS.md` §7 (Toolchain commands) and §8 (Definition of done) SHALL surface the `design-system-e2e-tests-collect` OpenSpec change as the single source of truth for the iteration-13 gherkin parity, visual-regression, and dev/readyz smoke obligations, and SHALL remove the reference once iteration 13 archives.

#### Scenario: AGENTS.md points contributors at the consolidation change

- **WHEN** a contributor reads `AGENTS.md` during iteration 13
- **THEN** §7 names `bun run test:e2e`, the visual-regression baselines under `tests/visual/**`, and the `/healthz` / `/readyz` smoke checks
- **AND** §7 points contributors at the `design-system-e2e-tests-collect` change as the canonical source of those obligations for the duration of the iteration

#### Scenario: Definition of done defers to the consolidation change

- **WHEN** a contributor reads `AGENTS.md` §8 during iteration 13
- **THEN** the iteration-13 refactor proposals cite the `design-system-e2e-tests-collect` change rather than restating gherkin, visual-regression, or smoke checks
- **AND** once iteration 13 archives, the docs/AGENTS update proposal removes the reference so §8 reverts to the canonical end-to-end checks

