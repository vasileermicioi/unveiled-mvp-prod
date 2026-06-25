## Context

After the landing- and app-migration changes (`2026-06-25-landing-migrate-fully-to-design-system` and `2026-06-25-app-migrate-fully-to-design-system`) the design system owns every UI surface — atoms, molecules, organisms, layouts, and pages — plus the global CSS chain, the Tailwind v4 theme overrides, and the `cn` helper. The one remaining escape hatch is the theme provider: `packages/app/src/components/providers/heroui-provider.tsx` still imports `NextUIProvider` from `@nextui-org/react`, and the landing package's `index.astro` has no provider at all (which is fine today because the landing hero is a HeroUI molecule that renders correctly without context — but the moment any new landing page mounts an island that depends on HeroUI context, the rule "no direct HeroUI imports in landing" will be the only thing protecting it).

The replica's own provider at `packages/design-system/src/heroui-replica/provider.tsx` is a parallel `NextUIProvider` wrapper used by every Ladle replica story. It is the only other `NextUIProvider` wrapper in the repo today. After this change there is one provider, owned by the design system, used by production and Ladle stories alike.

The iteration-13 prompt is strict: "all components are based on HeroUI" and "landing and app packages only components from design-system package, no direct import from HeroUI". The boundary-gate unit tests added by prior proposals (`tests/unit/app-design-system-import-boundary.test.ts`, `tests/unit/landing-design-system-import-boundary.test.ts`) already reject any third-party UI import in app or landing — but neither test rejects a `@nextui-org/react` import because they have historically allowed it via the legacy provider file. This proposal moves the provider and then adds the final, repo-wide gate that closes the loop.

## Goals / Non-Goals

**Goals:**

- One theme provider in the repo, owned by `@unveiled/design-system`, exported as `UnveiledThemeProvider`.
- App and landing mount the new provider around every HeroUI-context island; the old `HeroUIProvider` name disappears from production surfaces.
- The replica stories keep working via a thin re-export at `packages/design-system/src/heroui-replica/provider.tsx`.
- A permanent unit test under `tests/unit/` enforces "no file outside `packages/design-system/**` imports HeroUI".

**Non-Goals:**

- Removing `@nextui-org/react` from the dependency tree. The package remains a peer dependency of `@unveiled/design-system`; rewriting every atom that wraps a HeroUI primitive is a separate, larger iteration.
- Changing the theme tokens, the Tailwind v4 theme block, or adding dark mode. The provider does not own them.
- Removing the `HeroUIReplicaProvider` name. A follow-up change (proposal 11 in the iteration-13 plan) retires the replica and the shim.
- Touching `packages/app/src/components/providers/query-provider.tsx`. TanStack Query is app-level state; the provider stays in the app and pages mount both providers.

## Decisions

### Decision: Provider lives at `packages/design-system/src/providers/theme-provider.tsx`

`packages/design-system/src/providers/` is a new directory in this iteration. The provider shape:

```tsx
"use client";

import { NextUIProvider } from "@nextui-org/react";
import type { ReactNode } from "react";

export interface UnveiledThemeProviderProps {
  children: ReactNode;
}

export function UnveiledThemeProvider({ children }: UnveiledThemeProviderProps) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
```

The provider takes no `theme` prop — the brand theme is fixed inside the design system. Consumers cannot override it. This is parity with the current `HeroUIProvider`, not a regression.

**Rationale:** the iteration-13 rule is "the design system owns every UI surface". A provider that wraps HeroUI's context is a UI surface — it is the root of every HeroUI-rendered island's context tree. The provider therefore belongs in the package, not the app.

**Alternatives considered:**

- Put the provider under `packages/design-system/src/heroui-replica/` because it is a HeroUI wrapper. Rejected: replica files are `// @ladle-only` and the production provider must not be gated by the replica isolation contract.
- Keep the provider in `packages/app/src/components/providers/` and re-export from `@unveiled/design-system`. Rejected: re-exporting a file that still lives in the app violates the "no third-party UI imports in app" gate and leaves the app on the hook for the file's lifecycle. The file must move.

### Decision: Rename `HeroUIProvider` → `UnveiledThemeProvider`

**Rationale:** the previous name leaks the implementation detail into consumer code. A consumer writing `import { HeroUIProvider } from "@unveiled/design-system"` is reading a name that says "HeroUI", not "Unveiled theme". The new name describes the provider's contract (it provides the Unveiled theme context) without naming the library.

**Alternatives considered:**

- Keep the `HeroUIProvider` name but move the file. Rejected: the name is a maintenance hazard — if HeroUI is later swapped for another base, every consumer breaks.
- Generic name like `ThemeProvider`. Rejected: too generic; the codebase has the `query-provider.tsx` next door which could equally be called a theme provider in the broad sense.

### Decision: Two re-export shapes (`Providers` namespace + flat `UnveiledThemeProvider`)

`packages/design-system/src/index.ts` gains:

```ts
export * as Providers from "./providers";
export { UnveiledThemeProvider } from "./providers/theme-provider";
```

`packages/design-system/src/providers/index.ts` re-exports `UnveiledThemeProvider` from `./theme-provider`.

**Rationale:** the existing barrel exports `Atoms`, `Molecules`, `Organisms`, `Layouts` as namespaces — `Providers` matches that convention. The flat re-export covers the common case where a consumer only needs the theme provider.

### Decision: Replica shim re-exports the production provider

`packages/design-system/src/heroui-replica/provider.tsx` becomes:

```tsx
// @ladle-only
export {
  UnveiledThemeProvider as HeroUIReplicaProvider,
} from "../providers/theme-provider";
```

**Rationale:** the replica stories (`HeroBadge.ladle.tsx`, `HeroButton.ladle.tsx`, …) currently import `HeroUIReplicaProvider` from `./provider`. Keeping the export name avoids touching every replica story. The `// @ladle-only` header is preserved, so the replica isolation contract still holds. Proposal 11 retires the replica and the shim in one step.

### Decision: Boundary gate is a permanent `bun:test` under `tests/unit/`

New file: `tests/unit/design-system-hero-ui-boundary.test.ts`. The test walks every `.ts` / `.tsx` / `.astro` file in the repo (excluding `packages/design-system/**`, `.ladle/`, generated artifacts, and the test file itself), and fails if any file matches `from "@nextui-org/react"`, `from "@nextui-org/...`, or `from "@heroui/...`.

**Rationale:** the existing per-package boundary tests (`app-design-system-import-boundary.test.ts`, `landing-design-system-import-boundary.test.ts`) cover app and landing but not any future package (e.g. a hypothetical `packages/orchestrator` worker that reaches for HeroUI). The repo-wide gate is the final closure of the iteration-13 rule. The test runs in `bun run test:unit` which is wired into `bun run check`.

**Alternatives considered:**

- Extend the existing per-package tests. Rejected: the new test is the repo-wide version of the same rule; folding it into the app test muddies the scope.
- Add a Biome lint rule. Rejected: Biome cannot grep arbitrary strings in the import graph; a script-style test is the established pattern in this repo.

### Decision: Query provider stays in the app, theme provider moves to the design system

`packages/app/src/components/providers/query-provider.tsx` continues to live in the app. TanStack Query is app-level state (the query cache is keyed off the current viewer session and URL). Theme context, by contrast, is a design concern — the brand theme is the same in dev, test, production, and Ladle stories.

Astro pages that mount React islands mount both providers, in this order:

```astro
<UnveiledThemeProvider client:load>
  <QueryProvider client:load>
    {/* islands */}
  </QueryProvider>
</UnveiledThemeProvider>
```

The theme provider is `client:load` so the HeroUI theme context hydrates before any island that consumes it.

## Risks / Trade-offs

- **Hydration ordering** → The audit must confirm every React island that depends on HeroUI context is wrapped in `UnveiledThemeProvider`. The current app provider wraps the entire app inside `visual-system-app.tsx` (the `visualSystemApp` component used by every Astro page in `packages/app/src/pages/**`). If the same single-mount pattern is kept, the rewire is a one-file change. The landing page today has no provider — proposal must therefore add one to `packages/landing/src/pages/index.astro` (or to a new `LandingLayout` wrapper) the moment any landing island depends on HeroUI context. Mitigation: the `bun run check` boundary test catches any direct HeroUI import in landing; the next landing change must mount the provider.
- **Replica story mismatches** → the replica shim keeps every `HeroUIReplicaProvider` import working. Mitigation: the `bun run heroui-design-system-replica:check` gate continues to enforce replica isolation.
- **Test ergonomics** → the new boundary test walks every file in the repo and runs on every `bun run check`. Mitigation: scope the walk to non-generated, non-`node_modules`, non-`.ladle/` files; early-exit on first match to keep the failure message actionable.
- **TanStack Query is a separate provider** → pages that already mount `QueryProvider` must mount `UnveiledThemeProvider` *outside* it (HeroUI context must wrap the query cache's React context). Mitigation: every page that uses `QueryProvider` is updated in the rewire step.

## Migration Plan

1. Create `packages/design-system/src/providers/theme-provider.tsx` with the shape above; add `packages/design-system/src/providers/index.ts`; add both to the design-system barrel (`Providers` namespace + flat `UnveiledThemeProvider`).
2. Update `packages/app/src/components/unveiled/visual-system-app.tsx` to import `UnveiledThemeProvider` from `@unveiled/design-system` and wrap the existing app shell tree.
3. Audit `packages/landing/src/pages/**` and `packages/landing/src/layouts/**` for any HeroUI-context island; mount `UnveiledThemeProvider` around it. Today the only consumer is `LandingHeroPresentational` (which renders correctly without context), so the mount is added at the layout level for forward compatibility.
4. Replace `packages/design-system/src/heroui-replica/provider.tsx` with the re-export shim.
5. Delete `packages/app/src/components/providers/heroui-provider.tsx`.
6. Add `tests/unit/design-system-hero-ui-boundary.test.ts`.
7. Run `bun run check`, `bun run test:unit`, `bun run heroui-design-system-replica:check`, `bun run ladle:coverage`, and the e2e suite.
8. Update `AGENTS.md` definition-of-done to mention the new boundary gate.

Rollback: revert the change. The legacy file at `packages/app/src/components/providers/heroui-provider.tsx` is restored by `git checkout`. The boundary test is the only new file under `tests/unit/`; reverting it brings the gate back to the per-package state.

## Open Questions

None. The provider shape is locked in by the iteration-13 rule, the rename is decided, and the boundary gate is the established pattern.
