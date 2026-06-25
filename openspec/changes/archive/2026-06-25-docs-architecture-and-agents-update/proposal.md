## Why

Iteration 13 (proposals 01–09) established a new UI architecture: every
production primitive lives in `@unveiled/design-system`, organised by
atomic-design layer (atoms → molecules → organisms → layouts → pages),
with HeroUI as a private dependency of the design system and
semantic-class CSS as the styling source of truth. The iteration's
gate scripts (`check:atomic-layers`, `check:styling-ownership`,
`heroui-design-system-replica:check`, `ladle:coverage`) are wired into
`bun run check`, but the contributor-facing docs — `AGENTS.md`,
`docs/architecture.md`, the LikeC4 model under `architecture/`, and
the live `design-system-package` capability spec — still describe the
pre-iteration state. A new contributor reading `AGENTS.md` would not
learn that UI lives in `packages/design-system/src/`, that raw Tailwind
utilities are forbidden outside the design system's semantic classes,
or that `App` and `Landing` consume `DesignSystem` as a dependency. We
need to update all four sources of truth so future features implement
against the new boundary without re-litigating the decisions.

## What Changes

- Update `AGENTS.md` §2 (Styling bullet) to call out atomic-design
  layering, HeroUI as a private dependency of the design system, and
  the gate scripts that enforce the boundary.
- Update `AGENTS.md` §3 (file layout) to replace the `packages/`
  block with the new layered design-system layout
  (atoms/molecules/organisms/layouts/pages/providers/lib/styles/heroui-replica)
  and the corresponding app/landing containers-only blocks.
- Update `AGENTS.md` §4 (conventions) to add a bullet forbidding raw
  Tailwind utility classes in `app/` and `landing/` outside the
  design-system semantic classes.
- Update `AGENTS.md` §7 (toolchain commands) to add
  `bun run check:atomic-layers` and `bun run check:styling-ownership`
  rows and to mark `bun ladle` as "MUST work; no stories is a
  regression".
- Update `AGENTS.md` §8 (definition of done) to require a Ladle page
  for every UI change in `app/` or `landing/`.
- Update `AGENTS.md` §9 (what NOT to do) to add the design-system
  boundary as a hard rule (no HeroUI / lucide imports outside the
  design system; no raw Tailwind utilities outside the design-system
  semantic classes; no `@unveiled/design-system/lib/*` imports — use
  the barrel).
- Create (or extend) `docs/architecture.md` with a new "Design system
  boundary" section documenting the layer hierarchy, the
  presentational/container split, the CSS ownership rule, the Ladle
  demo obligation, and the gate-script enforcement.
- Update the LikeC4 model under `architecture/` to add a `DesignSystem`
  container inside `unveiled`, with `Atoms` / `Molecules` /
  `Organisms` / `Templates` / `Pages` components; add `HeroUI` as an
  external library element with `uses` relationships from `Atoms` and
  `Molecules`; add explicit `uses` relationships from `App` and
  `Landing` to `DesignSystem`; ensure `metadata.path` values are
  anchored under live workspace roots so `arch:drift` stays green.
- Walk every ADDED / MODIFIED requirement from iteration-13 proposals
  01–09 and confirm each has been folded into the live
  `design-system-package` capability spec; add the new top-level
  "Design system boundary" requirement to the live spec.

No code under `packages/app/` or `packages/landing/` is changed.
No production primitive is added, removed, or restyled.
No runtime behaviour changes. This is a documentation + model +
spec-only change.

## Capabilities

### New Capabilities

(none — no new runtime capability is introduced)

### Modified Capabilities

- `agent-guidance`: AGENTS.md must call out atomic-design layering in
  §2, the layered design-system file layout in §3, the no-raw-Tailwind
  convention in §4, the `check:atomic-layers` / `check:styling-ownership`
  toolchain commands in §7, the Ladle-demo definition-of-done item in
  §8, and the design-system-boundary "what NOT to do" items in §9.
- `architecture-and-guidelines`: `docs/architecture.md` must document
  the design-system boundary as a new section (layer hierarchy,
  presentational/container split, CSS ownership, Ladle demo
  obligation, gate-script enforcement); the doc must continue to
  point at the LikeC4 model source instead of embedding Mermaid.
- `likec4-architecture`: the model under `architecture/` must add a
  `DesignSystem` container with its layers as components, declare
  `HeroUI` as an external library element, declare explicit `uses`
  relationships from `App` and `Landing` to `DesignSystem`, and keep
  every `metadata.path` anchored under a live workspace root so
  `arch:drift` stays green.
- `design-system-package`: the live spec must (a) contain every ADDED
  / MODIFIED requirement from proposals 01–09 (verified during
  execution) and (b) carry a new top-level "Design system boundary"
  requirement stating that all UI lives in `packages/design-system/`
  and that `app/` / `landing/` consume the design system and never
  its dependencies.

## Impact

- `AGENTS.md` (the canonical contributor entrypoint) — content
  update; size stays under the 400-line cap (link out to
  `docs/architecture.md` and `openspec/specs/design-system-package/spec.md`
  for full detail).
- `docs/architecture.md` — adds a "Design system boundary" section;
  if the file does not exist, it is created.
- `architecture/*.likec4` — LikeC4 model additions (new container +
  library element + `uses` edges); no removal of existing elements.
  Also adds a new `tag spec-design-system-package` value to
  `architecture/specification.likec4` and to the `SPEC_TAGS` enum in
  `packages/app/src/lib/architecture/tags.ts` (the closed enum the
  `tests/architecture/model-tags.test.ts` unit test enforces).
- `openspec/specs/design-system-package/spec.md` — adds one new
  top-level requirement and folds in any iteration-13 requirement
  not yet present (verify-during-execution).
- No package code under `packages/app/`, `packages/landing/`,
  `packages/api/`, `packages/orchestrator/`, or
  `packages/design-system/src/` changes.
- `package.json` (root) is unchanged; both gate scripts
  (`check:atomic-layers` and `check:styling-ownership`) are already
  wired into `bun run check` (verified at execution time).