## MODIFIED Requirements

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