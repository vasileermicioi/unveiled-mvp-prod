## Context

Iteration 11 change 1 (`add-heroui-ladle-design-system`) approved the HeroUI-based visual contract for the Unveiled app and shipped a Ladle-only replica of every production primitive under `src/components/ui/heroui-replica/`. The live app, however, still ships shadcn-based primitives from `src/components/ui/button.tsx`, `src/components/ui/unveiled-primitives.tsx`, and the rest of `src/components/`, `src/pages/`, and `src/layouts/`. Two parallel UI systems mean every consumer is effectively forked, the Ladle contract is not the source of truth for production, and the dependency tree is carrying both shadcn scaffolding (`@radix-ui/react-slot`, `class-variance-authority`) and a HeroUI package that is pinned to `devDependencies` only.

This change promotes HeroUI to the production component library, rebuilds every primitive on top of it while preserving the Unveiled look-and-feel and the existing prop signatures, and rewires every consumer so the live app matches the approved Ladle contract. It is the second half of the "ship HeroUI" work; the first half (the Ladle replica itself) is already complete.

## Goals / Non-Goals

**Goals:**

- Ship exactly one UI system. Production code consumes HeroUI-backed primitives; the Ladle replica remains a design-system reference under `src/components/ui/heroui-replica/` and stays gated by `bun run heroui-design-system-replica:check`.
- Preserve every public prop signature, `data-testid`, and selector reachable through the gherkin suite so `bun run test:e2e` and `bun run test:ladle` keep passing without a parallel test rewrite.
- Keep the visual output byte-identical to the approved Ladle contract: same Unveiled palette, borders, shadows, typography, and motion.
- Promote HeroUI to `dependencies`, regenerate `bun.lock`, and remove the shadcn scaffolding that is no longer referenced.
- Wire `HeroUIProvider` into the client root without breaking SSR on Cloudflare Workers.

**Non-Goals:**

- Adding new user-visible capabilities. This change replaces the implementation of existing surfaces, not the surfaces themselves.
- Rewriting the visual contract. The Ladle contract from change 1 is the source of truth; this change only re-implements the production primitives against it.
- Touching TypeSpec, the OpenAPI document, server actions, or the data-access layer. None of those surfaces depend on the UI library.
- Replacing the Ladle replica. The replica stays as a design-system reference and as the test harness for new components.

## Decisions

- **HeroUI is the production library, not a shim.** Production primitives import `@nextui-org/react` directly and compose variants through HeroUI's `Button` (and equivalents) plus the Unveiled theme tokens. We do not keep a shadcn-compatible re-export shim on top of HeroUI; the only HeroUI shim in the tree is the Ladle replica, which stays in `src/components/ui/heroui-replica/` and is gated.
  - *Alternatives considered:* (a) keep shadcn as a thin wrapper around HeroUI — rejected because it leaves two UI systems in the dependency tree and forces every contributor to learn the wrapper. (b) build a custom primitive set on top of Tailwind — rejected because the Ladle contract is already approved against HeroUI and a re-implementation would drift visually.
- **Theme module location: `src/lib/heroui-theme.ts`.** The promoted theme lives next to other app-wide configuration under `src/lib/`, not under `src/styles/` (which holds generated CSS) and not under `src/components/ui/heroui-replica/` (which is Ladle-only). The replica's `provider.tsx` is updated to import from the production module.
  - *Alternatives considered:* (a) keep the theme inside the replica and import it from production — rejected because that reverses the intended direction (Ladle-only → production) and would couple production to a gated directory. (b) inline the theme in `heroui-provider.tsx` — rejected because the same theme is needed by both the replica (for parity) and the production provider.
- **Provider is mounted from `src/components/providers/heroui-provider.tsx`.** A dedicated module keeps the HeroUI provider opt-in for any future test or storybook entry point and avoids growing `query-provider.tsx` beyond its TanStack Query concern. The provider is composed into the existing client root stack used by `src/components/unveiled/app-shell.tsx`.
  - *Alternatives considered:* (a) fold the provider into `query-provider.tsx` — rejected because it would conflate two distinct providers and complicate the test seam. (b) instantiate `HeroUIProvider` inside every island — rejected because that would defeat the purpose of a root provider and would balloon the bundle.
- **Client-only HeroUI APIs are gated with `client:only="react"`.** HeroUI ships several APIs that touch `window`/`document` (notably portals, popovers, and the theme runtime). On Cloudflare Workers SSR, these must not execute during server rendering. The convention: the production islands that wrap a HeroUI client-only surface are mounted with `client:only="react"` at the Astro call site, and any in-island dynamic import uses a `useEffect`-gated branch.
  - *Alternatives considered:* (a) mount every HeroUI consumer with `client:load` — rejected because `client:load` still hydrates on the server and would crash on HeroUI's `window` access. (b) re-implement the client-only surface in raw React — rejected because it duplicates work HeroUI already does correctly.
- **Public prop signatures are preserved verbatim.** The HeroUI-backed `Button` and primitive wrappers expose the same `variant`/`size`/`tone`/`shadow`/`interactive`/`state`/`loading`/`asChild` props the shadcn-based versions did, mapped to HeroUI's variant/size enum internally. This keeps the gherkin suite green and avoids a parallel PR that is half refactor and half test rewrite.
  - *Alternatives considered:* (a) break the prop surface and use HeroUI's native prop names everywhere — rejected because it would force every consumer and every gherkin scenario to be rewritten in the same change, exploding the diff.
- **Variant matrix is normalized once in the wrapper, not at every call site.** `Button` (and the other primitives) own a single `class-variance-authority` (or HeroUI equivalent) mapping from our `variant × size` space to HeroUI's enum space. Consumers pass Unveiled names; the wrapper translates.
  - *Alternatives considered:* (a) let consumers pass HeroUI variant strings — rejected because it leaks HeroUI vocabulary into the app and breaks the gherkin selector discipline.
- **HeroUI is added to `dependencies` and shadcn-only packages are removed in the same change.** `@nextui-org/react` moves from `devDependencies` to `dependencies`. `@radix-ui/react-slot` and `class-variance-authority` are removed once the audit confirms no remaining consumer. `clsx` and `tailwind-merge` are kept only if other call sites (beyond the removed primitives) still need them; otherwise they are removed too. The lockfile is regenerated by `bun install` and committed.
  - *Alternatives considered:* (a) keep shadcn packages for one release as a safety net — rejected because it would leave the two-system problem in place and would force a follow-up cleanup. (b) remove shadcn packages first, then promote HeroUI — rejected because the order would break the build mid-change; promoting HeroUI first and removing shadcn only after the audit lands the change atomically.
- **`components.json` is updated, not removed outright.** shadcn no longer owns the component source, but `components.json` is still the entrypoint for any future component scaffolding decision. We update it to point at the new component convention (HeroUI + the Unveiled theme) or remove it entirely if no future scaffolding is planned; the decision is made during the audit task.
  - *Alternatives considered:* (a) leave `components.json` untouched — rejected because it would advertise a component source that no longer matches the code.

## Risks / Trade-offs

- **HeroUI bundle size grows the client bundle.** → Measure `bun run build` output before and after; enforce the existing performance budget. If the budget is exceeded, code-split the heaviest HeroUI surfaces (modal/drawer) and lazy-load them on first interaction.
- **SSR hydration mismatch on Cloudflare Workers when a HeroUI client-only API runs on the server.** → Gate every consumer island with `client:only="react"` and add a Ladle + Playwright smoke test for each HeroUI-backed surface. Run `bun run check` after every consumer migration.
- **Accessibility regression (focus trap, aria patterns) when swapping Radix-backed shadcn primitives for HeroUI.** → Run the existing gherkin parity suite; add targeted a11y assertions for `Modal`, `Drawer`, and `Menu` against the WCAG 2.1 AA rules already enforced elsewhere in the suite.
- **Variant/size prop drift between the production wrapper and the Ladle replica.** → The replica is the source of truth; before merging, run a side-by-side Ladle story for every replaced primitive and diff the rendered className + DOM structure.
- **`bun.lock` churn scares reviewers.** → Pin HeroUI to a single minor version bump; include a short note in the PR description explaining the lockfile size and listing any transitive packages that moved.
- **Consumer audit misses an import path.** → Run `rg "@/components/ui/(button|unveiled-primitives)" src/` as a final gate; the task list treats any unconverted import as a blocker.

## Migration Plan

1. Promote HeroUI to `dependencies` and audit which shadcn-only packages are no longer used. Land the dependency change in its own commit so reviewers can see the lockfile diff in isolation.
2. Move `src/components/ui/heroui-replica/theme.ts` → `src/lib/heroui-theme.ts`; update the replica's `provider.tsx` to import from the new location. Confirm `bun run heroui-design-system-replica:check` still passes.
3. Add `src/components/providers/heroui-provider.tsx`; mount it from `src/components/unveiled/app-shell.tsx` (or `query-provider.tsx` if folded). Verify SSR does not crash on `bun run build`.
4. Rebuild `Button` and the `unveiled-primitives` set one primitive at a time, keeping the public prop signatures stable. For each primitive, run `bun run check`, the matching gherkin scenario, and the matching Ladle story.
5. Add the new production primitives (`Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`) as HeroUI-backed wrappers and migrate the consumer call sites that previously shimmed those surfaces.
6. Walk `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, `src/layouts/` and convert every remaining shadcn-specific pattern. Run the consumer audit (`rg "@/components/ui/(button|unveiled-primitives)" src/`) until it returns zero hits outside the primitives themselves.
7. Update or remove `components.json` and drop the shadcn-only packages that the audit confirms are unused.
8. Run the full gate: `bun run check`, `bun run test:e2e`, `bun run test:ladle`, `bun run ladle:coverage`, `bun run heroui-design-system-replica:check`, `bun run check:heroui-replica`, `bun run build`.
9. Rollback: each step is independently revertible. If a HeroUI primitive regresses a gherkin scenario, revert just that primitive's commit; the dependency promotion and theme move are the only non-per-primitive commits and are both revertible without touching the rest of the app.

## Open Questions

- **Where exactly does the new provider module live — `src/components/providers/heroui-provider.tsx` or folded into `query-provider.tsx`?** The decision above favors a dedicated module; the implementation step in `tasks.md` records the final location once the `app-shell` consumer is reviewed.
- **Does `components.json` stay (updated) or go (removed)?** Resolved during the audit step; the default is "remove" unless a future scaffolding need surfaces.
- **Are `clsx` and `tailwind-merge` used outside the primitives being removed?** Resolved by the consumer audit; if they have no remaining call site they are removed in the same change.
