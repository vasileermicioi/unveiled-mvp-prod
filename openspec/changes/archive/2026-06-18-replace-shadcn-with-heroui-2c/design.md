## Context

Slice **2c** of the umbrella `replace-shadcn-with-heroui`. The HeroUI dependency and theme are in place; this slice adds the root provider and gates any client-only surface for SSR on Cloudflare Workers.

## Goals / Non-Goals

**Goals:**

- Add `src/components/providers/heroui-provider.tsx` wrapping children in `HeroUIProvider` with the production theme.
- Mount it from `src/components/unveiled/app-shell.tsx` so every island inherits the provider.
- Audit islands that wrap HeroUI client-only surfaces (portals, popovers) and gate them with `client:only="react"` or a `useEffect`-gated dynamic import.
- Verify with `bun run build` that SSR does not crash on the Cloudflare Workers adapter.

**Non-Goals:**

- No primitive rewrites. This slice only adds the provider and the client-only gate; later slices (2d, 2e, 2f) actually start using HeroUI components in production.
- No consumer walk. The provider is mounted globally; per-island usage is owned by slices 2d, 2e, 2f, 2g.

## Decisions

- **Provider lives at `src/components/providers/heroui-provider.tsx`** (per your decision; not folded into `query-provider.tsx`).
- **`HeroUIProvider` is a client component.** It is mounted from the Astro `app-shell.tsx` with the `client:*` directive pattern already in use for other React islands in that file. No `client:only` is required for the provider itself — the provider is a thin React context wrapper; the client-only surfaces are the islands that consume it.
- **Gate client-only surfaces, not the provider.** HeroUI's `Modal`, `Drawer`, `Popover`, and similar portals touch `window`/`document`. Per the umbrella design doc, the convention is `client:only="react"` at the Astro call site OR a `useEffect`-gated dynamic import inside the island. Slice 2c does the audit; slice 2f adds the first such surfaces.

## Risks / Trade-offs

- **Mounting the provider at app-shell level adds bytes to every page.** → Acceptable: the provider is a context wrapper, not a render-heavy component. Measure with `bun run build`; the umbrella's slice 2i enforces the bundle budget.
- **An island that uses a HeroUI client-only API is missed by the audit and crashes SSR.** → Mitigation: `bun run build` is the gate. If it fails, add the missing `client:only` or dynamic-import gate and re-run.

## Migration Plan

1. Create `src/components/providers/heroui-provider.tsx` exporting a default React component that wraps children in `HeroUIProvider` and applies the production theme.
2. Edit `src/components/unveiled/app-shell.tsx` to compose the new provider into the existing client root.
3. Audit every `.astro` page that mounts a React island wrapping a HeroUI client-only surface; add `client:only="react"` (or the equivalent dynamic import) where needed.
4. Run `bun run build`; resolve any SSR crash by adding the missing gate.
5. Run `bun run check`.
6. Rollback: revert the single commit.

## Open Questions

_None._
