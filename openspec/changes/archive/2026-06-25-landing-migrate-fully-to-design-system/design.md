## Context

`@unveiled/landing` is the public Astro 6 SSR surface mounted at `/`
behind the orchestrator's `LANDING` service binding
(`wrangler.orchestrator.toml`). The package today owns:

- `packages/landing/src/layouts/landing-layout.astro` — the only
  Astro layout; composes the HTML document around a `<LandingLayout>`
  mount from `@unveiled/design-system/layouts/landing-layout`.
- `packages/landing/src/pages/index.astro` — the only page;
  instantiates the layout, the header, the hero, and the footer
  directly with `<LandingHeader>`, `<LandingHero>`, `<LandingFooter>`
  imports from `~/components/landing/...`.
- `packages/landing/src/components/landing/landing-{header,hero,footer}.tsx`
  — three thin re-export shims whose only job is to rename
  `LandingHeaderPresentational` → `LandingHeader` (etc.). All three
  are pure pass-throughs; the rename adds no value and creates a
  parallel surface that future contributors may extend by accident.
- `packages/landing/src/styles/global.css` — single import line into
  `@unveiled/design-system/styles/global.css`.

The organism presentationals (`LandingHeaderPresentational`,
`LandingHeroPresentational`, `LandingFooterPresentational`) were
promoted into `@unveiled/design-system` by proposals 02–04 (atoms,
molecules, organisms). The existing `LandingLayout` slot wrapper
already composes the header, optional hero, page body, and footer;
the design-system spec
(`openspec/specs/design-system-package/spec.md:592-596`) already
documents that the Astro layout MUST mount `LandingLayout` around
`<slot />` for the landing surface. The page today still instantiates
the organisms directly through three landing-local re-export shims,
which creates a parallel landing-local surface that future
contributors could accidentally extend with landing-local UI logic.

The original proposal also proposed `navItems` / `footerLinks` /
`heroCopy` / `currentPath` props plus a new `LandingTemplate` that
takes those props. Inspection during implementation showed those
props do not exist on the presentationals today and adding them is
real new design-system work outside this change's scope. The user
chose the narrower path: add a small `LandingTemplate` organism in
the design system that composes the existing presentationals with
their current prop surfaces, drop the `landing-config` capability
entirely, and let the landing own only the Astro wrapper.

## Goals / Non-Goals

**Goals:**

- Collapse the landing onto the design-system surface: the page body
  is a single `<LandingHeroPresentational>` mount, the Astro layout
  is a single `<LandingTemplate>` mount, and the
  `packages/landing/src/components/landing/` folder is deleted.
- Add a new `LandingTemplate` organism in the design system
  (`packages/design-system/src/organisms/landing/landing-template/`)
  that composes `LandingHeaderPresentational`, an optional
  `LandingHeroPresentational`, an optional body, and
  `LandingFooterPresentational`. The component uses the same prop
  surfaces as the existing presentationals (`authenticated` only;
  no `navItems`, `footerLinks`, `heroCopy`, or `currentPath` props).
- Delete `packages/landing/src/components/landing/` and its three
  re-export shims so the path no longer exists in the source tree.
- Tighten the design-system-package requirement that says "landing
  package consumes the design system, not its internals" so the gate
  is the styling-ownership check plus a new `R-LANDING-NO-LOCAL-UI`
  regression rule.
- Preserve the visible output (gherkin parity suite, visual
  regression baseline, dev/readyz smoke). The proposal is a code
  reorganisation; no copy or nav changes.

**Non-Goals:**

- Adding `navItems`, `footerLinks`, `heroCopy`, or `currentPath`
  props to any presentational. The landing surface is hard-coded
  inside the design-system presentationals today; making those
  configurable is a follow-up iteration.
- Adding new landing routes (e.g. `/pricing`, `/about`).
- Touching `packages/app/`, the orchestrator, or the Wrangler
  config (`wrangler.landing.toml`).

## Decisions

### Decision 1 — `LandingTemplate` (not `LandingLayout`) is the React mount in the Astro layout

The Astro layout today mounts `<LandingLayout>` (the existing slot
wrapper from the design-system `layouts/landing-layout/` folder).
After this change the Astro layout mounts `<LandingTemplate>` from
the design-system `organisms/landing/landing-template/` folder — a
new organism that composes the three landing presentationals around
an optional body slot. The Astro layout projects `<slot />` through
to `LandingTemplate`'s body prop, so the page body still renders
inside the template's `<main>`.

- **Alternative A**: keep `LandingLayout` and have the Astro layout
  compose the three presentationals directly. Rejected — the
  presentationals are already wired up inside `LandingLayout`, so
  routing the Astro layout to `LandingTemplate` and asking
  `LandingTemplate` to do the same composition is a cleaner
  one-mount story and matches the design-system `Organisms` layer.
- **Alternative B**: introduce a new design-system layout
  (`LandingShell` or similar). Rejected — the existing
  `LandingLayout` is the right slot-only wrapper; the new organism
  is the right React composition.

### Decision 2 — `LandingTemplate` reuses the existing prop surfaces

`LandingTemplate` accepts the same prop shape the underlying
presentationals already accept:

```ts
interface LandingTemplateProps {
  authenticated?: boolean;
  hero?: boolean;
  children?: ReactNode;
}
```

`authenticated` is forwarded to `LandingHeaderPresentational` and
`LandingHeroPresentational` (when `hero === true`). `hero` controls
whether the hero renders inside the template body. `children` is the
optional page body that renders inside the `<main>` slot.

This means the proposal's original `navItems` / `footerLinks` /
`heroCopy` / `currentPath` props do not land in this iteration. A
future change can expand the presentational prop surfaces and add
the `landing-config` capability back; this iteration stops at
"single mount, no landing-local UI code".

### Decision 3 — Astro layout keeps the HTML document; `LandingTemplate` owns body chrome

The Astro layer keeps exclusive ownership of the HTML document
(`<html>`, `<head>`, meta tags, the `@unveiled/design-system/styles/global.css`
import) per `design-system-package/spec.md:582-584`. The React
layer (`LandingTemplate`) owns the body chrome (header + footer +
page body). The page (`index.astro`) does not import the Astro
layout or the header / footer islands; it only mounts the hero.

### Decision 4 — `R-LANDING-NO-LOCAL-UI` is a regression guard, not a live check

The path `packages/landing/src/components/landing/...` is deleted
in this change, so the rule is a forward-looking guard: if a
future contributor re-creates the folder (or imports from it via a
relative path that survives a partial revert), the gate fails. The
rule is a small addition to
`packages/design-system/scripts/check-styling-ownership.ts` and
runs as part of `bun run check:styling-ownership` (which is
already wired into `bun run check`).

### Decision 5 — `landing-config` capability is removed

The original proposal created a new `landing-config` capability to
own the copy/nav literals moved into `landing-config.ts`. Because
the simplified scope does not introduce a `landing-config.ts` (the
presentationals still own the literals internally and there is no
landing-local copy to move), the `landing-config` capability is
removed entirely. The `design-system-package` ADDED requirement is
the only delta spec for this change.

### Decision 6 — Astro `client:load` directive stays

The Astro layout mounts `<LandingTemplate client:load>`. The
`client:load` directive is required because the template composes
interactive organisms (the mobile drawer is part of
`LandingHeaderPresentational`). The same directive was used on the
three landing islands before this change, so this is not a
hydration regression; the `client:load` count simply moves up
the tree.

## Risks / Trade-offs

- **`/app/*` vs `/` URL collision** → the landing is mounted at
  `/*` per AGENTS.md §2; the new layout does not change the
  orchestrator's routing. No risk.
- **Hydration regression** → the `<LandingTemplate client:load>`
  directive is required because the template composes the mobile
  drawer. The directive was already used on the three landing
  islands before this change; the count moves up the tree, the
  behaviour is unchanged. Verified via the existing gherkin
  parity scenario (`tests/features/landing/home/feature.feature`).
- **Visual regression** → the proposal is a code reorganisation,
  not a copy or component change. The visual-regression baseline
  under `tests/visual/` is the safety net.
- **Future re-introduction of `packages/landing/src/components/landing/`**
  → the new `R-LANDING-NO-LOCAL-UI` rule in
  `check-styling-ownership.ts` rejects any future file under
  `packages/landing/src/**` that imports from
  `../components/landing/...`. The rule fails the umbrella
  `bun run check`.
- **No copy configurability** → the presentationals still own their
  copy / nav literals. A future iteration can extend the
  presentational prop surfaces and add a `landing-config.ts` plus a
  follow-up `landing-config` capability.