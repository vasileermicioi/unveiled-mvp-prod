## Context

The atoms, molecules, and organisms layers of `@unveiled/design-system`
landed in proposals 02, 03, and 04. The remaining atomic-design
layers — **layouts** (frame shells that place organisms in a page
chrome) and **pages** (a layout instantiated with mock organisms +
mock data) — are still missing.

Today the layout shell lives in two Astro files:

- `packages/app/src/layouts/base-layout.astro` wraps every page in
  `packages/app/src/pages/`. It owns the HTML document, meta tags,
  the `@unveiled/design-system/styles/global.css` import, and an
  empty `<body><slot /></body>` body. The page chrome (header,
  mobile drawer, content shell, footer) lives in
  `packages/app/src/components/unveiled/shell/AppShell.tsx` +
  `PageShell.tsx`, which the page imports and composes by hand.
- `packages/landing/src/layouts/landing-layout.astro` is structurally
  identical to the app layout. The landing chrome lives in
  `LandingHeader.tsx` + `LandingHero.tsx` + `LandingFooter.tsx`,
  composed by hand in every landing page.

Neither Astro layout is in the design system; neither is demoable in
Ladle; and neither follows the layer contract that the
`check-atomic-layers` gate now enforces.

The design-system-package spec already reserves the `layouts/` and
`pages/` layers and lays down the forward-looking rule "layouts and
pages compose atoms, not HeroUI directly" (proposal 03). This change
inherits that rule and makes `layouts/` and `pages/` concrete.

## Goals / Non-Goals

**Goals:**

- Extract the app and landing layout shells into the design system
  as `AppLayout` and `LandingLayout` React components under
  `packages/design-system/src/layouts/<layout>/`. Each layout is a
  thin composition of existing shell / landing organisms; no new
  organisms, no new HeroUI surface.
- Ship `*.mock.ts` fixtures and `<layout>.ladle.tsx` bare-frame
  stories for both layouts, so `bun ladle` lists them under the
  `Layouts` group.
- Ship demo pages for every user-facing surface (`auth/login`,
  `auth/signup`, `auth/password-recovery`, `discovery/discover`,
  `members/member-feed`, `bookings/booking-modal`,
  `admin/admin-panel`, `partner/partner-portal`,
  `payments/admin-freeze-unfreeze`, `payments/credit-ledger`,
  `payments/stripe-checkout`, `payments/subscription-portal`,
  `landing/landing`) as `*.page.ladle.tsx` files that compose a
  layout + organism + mock fixtures with
  `parameters.layout = "fullscreen"`.
- Update the Astro layouts to import the React layout and project it
  via the existing `<slot />`. The Astro layer keeps the HTML
  document, meta tags, and the global CSS import; the layout keeps
  the React tree. No Astro page is modified; the boundary is purely
  the Astro wrapper.
- Extend `check-atomic-layers.ts` with the four new rules described
  in the proposal so the gate fails loudly if the new layer
  contracts are violated.
- Re-export the `Layouts` namespace and a Ladle-only `Pages`
  namespace from `packages/design-system/src/index.ts`. `Pages` is
  gated by the existing
  `tests/unit/no-ladle-replica-in-production.test.ts` policy (the
  same gate that protects `heroui-replica/`).
- Add a permanent unit test that asserts every file under
  `packages/design-system/src/pages/` ends in `.page.ladle.tsx` and
  imports a `*.mock` fixture.

**Non-Goals:**

- Authoring actual production pages. `pages/` is for demos only.
  Production pages stay under `packages/app/src/pages/` and
  `packages/landing/src/pages/` and are migrated in proposals 07 and
  08.
- Splitting layouts into mobile / desktop / tablet variants. The
  first layouts cover the existing `lg:` breakpoint boundary that
  the shell organisms already encode; a follow-up proposal can
  introduce responsive variants if needed.
- New copy / new CTAs. The mock fixtures reuse the strings already
  in the organisms.
- A `pages/` runtime export. Pages are Ladle demos only; the design
  system does not ship a runtime pages surface (the app and landing
  packages own that surface).

## Decisions

### 1. Layouts compose organisms (never HeroUI directly)

`AppLayout` and `LandingLayout` follow the same contract as the
molecules layer: they consume organisms (and atoms / molecules
indirectly through them), never `@nextui-org/react` directly. This
keeps HeroUI's surface confined to the atoms layer.

The current organism contracts are narrower than the original
proposal sketched:

- `AppShellPresentational` accepts `{ header: ReactNode; children: ReactNode }` —
  it does NOT take `user`, `creditBalance`, `navItems`, or `currentPath`
  directly. Those go into the consumer's `ShellNavigation` header
  component, which the page passes in via the `header` slot.
- `LandingHeaderPresentational` accepts `{ authenticated: boolean }`.
- `LandingHeroPresentational` accepts `{ authenticated: boolean }`.
- `LandingFooterPresentational` accepts no props.

`AppLayout` therefore exposes a slot-based API: `header`,
`pageHeader`, `pageBody`, `pageAside`. The demo pages compose
`ShellNavigation`-style headers via mock fixtures, and the Astro
wrapper passes real-data headers in production.

```tsx
// packages/design-system/src/layouts/app-layout/app-layout.tsx
import type { ReactNode } from "react";
import { AppShellPresentational } from "../../organisms/shell/app-shell";
import type { AppLayoutProps } from "./app-layout.types";

export function AppLayout({
  header,
  pageHeader,
  pageBody,
  pageAside,
}: AppLayoutProps) {
  return (
    <AppShellPresentational header={header}>
      <div className="space-y-6">
        {pageHeader}
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div>{pageBody}</div>
          {pageAside ? <aside>{pageAside}</aside> : null}
        </div>
      </div>
    </AppShellPresentational>
  );
}
```

### 2. `LandingLayout` is its own organism composition

```tsx
// packages/design-system/src/layouts/landing-layout/landing-layout.tsx
import type { ReactNode } from "react";
import { LandingHeaderPresentational } from "../../organisms/landing/landing-header";
import { LandingHeroPresentational } from "../../organisms/landing/landing-hero";
import { LandingFooterPresentational } from "../../organisms/landing/landing-footer";
import type { LandingLayoutProps } from "./landing-layout.types";

export function LandingLayout({
  authenticated = false,
  hero = false,
  children,
}: LandingLayoutProps) {
  return (
    <>
      <LandingHeaderPresentational authenticated={authenticated} />
      {hero ? <LandingHeroPresentational authenticated={authenticated} /> : null}
      <main>{children}</main>
      <LandingFooterPresentational />
    </>
  );
}
```

The hero is optional; the discover-page demo omits it, the
landing-page demo includes it. The `authenticated` flag controls
the header CTA ("Log in" vs "Go to app") and the hero's secondary
CTA.

### 3. `*.mock.ts` per layout, fixtures are overridable

`app-layout.mock.ts` exports `makeMockAppLayoutProps(overrides?)`
with sensible defaults: a mock navigation header
(`<div>Mock navigation</div>`), a `pageHeader`, a `pageBody`, and
no `pageAside`. Each demo page calls
`makeMockAppLayoutProps({ pageBody: <SomeOrganism ... /> })` and
overrides the slot it cares about. The mock is the single source of
truth for "what does the layout look like with sample data" — the
demo pages do not re-define the fixture inline.

`landing-layout.mock.ts` follows the same shape
(`authenticated: false`, `hero: false`, placeholder `children`).

### 4. Pages are Ladle-only stories

`packages/design-system/src/pages/**` ships only
`*.page.ladle.tsx` files. The page folder has an `index.ts` that
re-exports nothing (it exists only to make TypeScript happy; it
already exists and is empty). A demo page looks like:

```tsx
// packages/design-system/src/pages/admin/admin-panel.page.ladle.tsx
import type { StoryObj } from "@ladle/react";
import { AppLayout } from "../../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../../layouts/app-layout/app-layout.mock";
import { AdminPanelPresentational } from "../../../organisms/admin/admin-panel";
import { makeMockAdminPanelProps } from "../../../organisms/admin/admin-panel/admin-panel.mock";

export const Default: StoryObj = {
  render: () => (
    <AppLayout
      {...makeMockAppLayoutProps({ currentPath: "/admin" })}
      pageBody={<AdminPanelPresentational {...makeMockAdminPanelProps()} />}
    />
  ),
};
Default.parameters = { layout: "fullscreen" };
```

Every page story sets `parameters.layout = "fullscreen"` so Ladle
gives the page the full viewport (it normally caps at ~800 px). The
hero/landing pages additionally set `viewport: { defaultViewport:
"desktop" }` for parity with the production breakpoints.

### 5. Astro layouts become thin wrappers

`packages/app/src/layouts/base-layout.astro` and
`packages/landing/src/layouts/landing-layout.astro` keep their
existing HTML document, meta tags, and `global.css` import. They
import the React layout from `@unveiled/design-system/layouts/<layout>`
and project the slot through it. The Astro wrapper passes
`header={undefined}` (or omits the prop) so the layout renders in
its "slot-only" mode: no shell chrome is added, and the page's
own `<VisualSystemApp>` / `<LandingPageApp>` composition is the
sole source of the shell.

```astro
---
// packages/app/src/layouts/base-layout.astro
import "../styles/global.css";
import { AppLayout } from "@unveiled/design-system/layouts/app-layout";

interface Props {
  title: string;
  lang?: string;
  description?: string;
}

const {
  title,
  lang = "en",
  description = "Unveiled cultural access visual system",
} = Astro.props;
---
<html lang={lang.toLowerCase()}>
  <head>...</head>
  <body>
    <AppLayout>
      <slot />
    </AppLayout>
  </body>
</html>
```

`AppLayout` (and `LandingLayout`) accept an optional `header` prop.
When `header` is omitted, the layout renders only the page-body
grid (or the `<main>{children}</main>` for the landing variant),
without the `AppShellPresentational` / `LandingHeaderPresentational`
chrome. This keeps the Astro wrapper change a *visible no-op* for
every existing page: the page still emits its own shell via
`<VisualSystemApp>` (in `@unveiled/app`) or `<LandingPageApp>`
(in `@unveiled/landing`).

The wrapper change is intentional: proposals 07 and 08 will
migrate the existing Astro pages to drop their own shell
composition and pass `header={<ShellNavigation ... />}` through
the layout. Until then, the wrapper imports the layout so the
dependency is wired and the boundary is exercisable, but the
visible output is unchanged.

### 6. Pages are import-isolated from production

The existing
`tests/unit/no-ladle-replica-in-production.test.ts` policy asserts
that no production entry point (in `packages/app/src/**`,
`packages/landing/src/**`, or the design-system's own runtime
export) reaches a module under `packages/design-system/src/heroui-replica/`.
This change extends the policy in code by adding a parallel gate
that asserts the same isolation for `packages/design-system/src/pages/`.

### 7. Gate additions

`packages/design-system/scripts/check-atomic-layers.ts` gains four
new rule functions:

- `R-LAYOUTS-NO-PAGE-IMPORT`: `layouts/**` cannot import from
  `./pages/...`.
- `R-LAYOUTS-NO-HEROUI`: `layouts/**` cannot import from
  `@nextui-org/react` or `@heroui/*` (already implied by
  `checkHigherLayersDoNotImportHeroUI`; restated for clarity in the
  design).
- `R-PAGES-LADLE-ONLY`: every file under `pages/` must end in
  `.page.ladle.tsx`.
- `R-PAGES-USE-MOCK`: every file under `pages/` must import at
  least one `*.mock` helper (the script greps for
  `from .*\.mock"` in each file).

A new permanent unit test
(`tests/unit/design-system-pages.test.ts`) provides a second line of
defence: it walks `packages/design-system/src/pages/**`, asserts
every file ends in `.page.ladle.tsx`, and asserts every file
imports a path matching `.*\.mock"`.

### 8. Barrel re-exports

`packages/design-system/src/index.ts` adds:

```ts
export type * from "./layouts";
export { Layouts } from "./layouts";
export * from "./layouts/app-layout";
export * from "./layouts/landing-layout";
```

The `Pages` namespace is intentionally NOT re-exported from the
runtime barrel. The pages folder exists only as Ladle stories; the
design-system runtime surface is `Atoms`, `Molecules`, `Organisms`,
and `Layouts`. Importing from `./pages` in production code is
blocked by the unit test gate.

## Risks / Trade-offs

- **Slot projection** — the layout returns a React tree; the Astro
  layer wraps it. The boundary is the same as today's
  `base-layout.astro` → `<slot />` boundary, so this is not a
  hydration regression. *Mitigation:* the wrapper change is verified
  by re-rendering every Astro page in `packages/app/src/pages/` and
  `packages/landing/src/pages/` after the wrapper is updated.
- **CSS scope** — the layout does not introduce new CSS. It only
  rearranges existing atoms / molecules / organisms. *Mitigation:*
  `bun run tokens:check` and the existing atom-chrome gate remain
  unchanged.
- **Bundle size** — pulling every organism into the design system
  increases the design-system bundle. *Mitigation:* the atoms-only
  bundle stays small because organisms are imported lazily by the
  consumer (the same way the app imports them today). No
  code-splitting changes are required in this proposal.
- **Pages not re-exported from barrel** — contributors may try to
  import a page as a runtime component. *Mitigation:* the unit test
  gate blocks production imports of `packages/design-system/src/pages/`,
  and the design-system-package spec's existing
  `heroui-replica` import-isolation scenario is mirrored for the
  `pages/` folder.
- **Mock data drift** — the layout fixtures may diverge from the
  real shell data shape. *Mitigation:* the `*.mock.ts` is colocated
  with the layout and is the only fixture the demo pages use; the
  organisms' own `*.mock.ts` continues to own the organism-level
  fixture.

## Migration Plan

1. Implement `AppLayout` and `LandingLayout` under
   `packages/design-system/src/layouts/<layout>/` with their types,
   mocks, and bare-frame Ladle stories.
2. Implement every `packages/design-system/src/pages/**/*.page.ladle.tsx`
   listed in the proposal.
3. Re-export the new layers from `packages/design-system/src/index.ts`
   (layout namespaces only; no runtime `Pages` namespace).
4. Extend `check-atomic-layers.ts` with the four new rules; add the
   permanent unit test under `tests/unit/`.
5. Update the Astro layouts to import the React layouts and project
   them via `<slot />`.
6. Run `bun run check` (covers `astro check`, `biome check`,
   `specs:check`, `tokens:check`, `ladle:coverage`, `wrangler:check`,
   `arch:check`, and the new atomic-layers rules).
7. Run `bun ladle` and verify every demo page renders under the
   `Pages` group with mock data; verify the `Layouts` group lists
   both `AppLayout` and `LandingLayout` bare-frame stories.
8. Render every Astro page in `packages/app/src/pages/` and
   `packages/landing/src/pages/` and confirm the visible output is
   unchanged.

Rollback: revert the wrapper change in
`packages/app/src/layouts/base-layout.astro` and
`packages/landing/src/layouts/landing-layout.astro`. The new design
system code is additive and gated by the existing `bun run check`
so a failed check blocks the change from being archived.

## Open Questions

- Should `LandingLayout`'s hero slot accept a `ReactNode` (so a
  landing page can compose its own hero composition) or only a
  `LandingHeroProps` (so the demo pages always use the canonical
  hero)? *Decision:* accept `ReactNode` so the layout stays a thin
  shell and the demo pages compose the hero themselves. The
  `landing.page.ladle.tsx` demo uses the canonical hero.
- Should the design-system pages folder ship a `pages/__overview__/overview.page.ladle.tsx`
  that mounts every demo page in a vertical stack? *Decision:* no;
  the Ladle sidebar already groups pages by domain. An overview
  page would duplicate the sidebar.
