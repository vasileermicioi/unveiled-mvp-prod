## Context

Slice **2f** of the umbrella `replace-shadcn-with-heroui`. The existing primitives are on HeroUI (slices 2d, 2e); this slice adds the five new primitives the umbrella calls for. All five previously lived as Mantine shims in the legacy tree; the production app has no clean source for them today, so consumers either inline a shoddy replacement or skip the surface entirely. This slice gives them a proper HeroUI-backed home.

## Goals / Non-Goals

**Goals:**

- Add `Modal`, `Drawer`, `Tabs`, `Menu`, and `Toast` as HeroUI-backed production primitives.
- Use the umbrella's prop-surface conventions (`open` / `onClose` / `title` / `children` for Modal and Drawer).
- Verify with `bun run check`, the matching Ladle stories, and the matching gherkin scenarios.

**Non-Goals:**

- No consumer changes. Slice 2g walks the call sites.
- No migration of legacy Mantine shims. The shims are in `_old_app/` (read-only reference) and were never imported by the new code; this slice adds the new primitives and lets slice 2g wire them in.
- No shadcn removal. Slice 2h audits.

## Decisions

- **One primitive per commit.** Five primitives in one commit is un-reviewable. Per-primitive commits let Ladle and gherkin gates fire per primitive.
- **Public prop surface is locked to the umbrella spec** (`open` / `onClose` / `title` / `children` for `Modal` and `Drawer`). The internal API may be richer (e.g. `size`, `placement`) but does not leak into the type signature consumers import.
- **`Toast` is a thin wrapper around HeroUI's toast API.** HeroUI's toast is a function call; the wrapper exposes a typed `useToast()` hook that returns a stable API mirroring the rest of the app.
- **`client:only="react"` is the default for any island that mounts a `Modal` or `Drawer`.** Per the umbrella design doc, portals touch `window`; SSR is gated. `Tabs` and `Menu` are non-portal and can mount with `client:load`.

## Risks / Trade-offs

- **HeroUI's `Toast` API is imperative (a function call), not a React component.** → The `useToast()` hook pattern keeps the call sites declarative; the hook owns the imperative call.
- **Per-primitive commits slow the slice down.** → Acceptable; the alternative is one unreviewable commit.
- **A primitive's `client:only` gate is missed and crashes SSR.** → `bun run build` is the gate. If it fails, add the missing directive and re-run.

## Migration Plan

1. Add `src/components/ui/modal.tsx`. Run `bun run check` + Ladle story + gherkin scenario.
2. Add `src/components/ui/drawer.tsx`. Run the same gates.
3. Add `src/components/ui/tabs.tsx`. Run the same gates.
4. Add `src/components/ui/menu.tsx`. Run the same gates.
5. Add `src/components/ui/toast.tsx`. Run the same gates.
6. Rollback: revert the offending primitive's commit.

## Open Questions

- **Does the legacy Mantine shim have a public prop surface we need to mirror exactly, or is the umbrella spec (`open` / `onClose` / `title` / `children`) the source of truth?** The umbrella spec is the source of truth; the Mantine shim is a read-only reference.
