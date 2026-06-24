## Why

Iteration 13's prompt asks that "every page, form, layout, and component"
be groupable in the design system and viewable with mock data. The
atoms, molecules, and organisms layers landed in proposals 02/03/04.
The two atomic-design layers still missing — **layouts** (frame
shells that place organisms in a page chrome) and **pages** (a layout
instantiated with mock organisms + mock data) — close that loop.

Today the layout shell lives in
`packages/app/src/layouts/base-layout.astro` and
`packages/landing/src/layouts/landing-layout.astro`. Neither is in
the design system, neither is demoable in Ladle, and the Astro
layouts mix concerns (page chrome, Astro slot projection, data
loading) that the design system should not own. This change extracts
the layout shells into the design system as `AppLayout` and
`LandingLayout`, then composes layouts + organisms + mock data into
Ladle-demoable pages for every user-facing surface.

## What Changes

- Add `AppLayout` and `LandingLayout` under
  `packages/design-system/src/layouts/<layout>/`, each composing the
  existing shell / landing organisms (no new organisms, no new HeroUI
  surface).
- Add `*.mock.ts` fixtures for both layouts (a mock navigation
  header ReactNode, a placeholder `pageBody`, `authenticated: false`,
  `hero: false`) and co-located `<layout>.ladle.tsx` stories that
  show the bare-frame layout without organisms inside.
- Add `packages/design-system/src/pages/<domain>/<surface>.page.ladle.tsx`
  for every user-facing surface: `auth/{login,signup,password-recovery}`,
  `discovery/discover`, `members/member-feed`, `bookings/booking-modal`,
  `admin/admin-panel`, `partner/partner-portal`, `payments/{admin-freeze-unfreeze,credit-ledger,stripe-checkout,subscription-portal}`,
  and `landing/landing`. Every page exports a Ladle story with
  `parameters.layout = "fullscreen"` and instantiates the layout with
  mock data via the layout's `*.mock.ts`. For surfaces whose "page"
  organism is composed of multiple sub-organisms
  (e.g. `AdminPanelHeaderPresentational` +
  `AdminPanelTabBarPresentational` + `AdminPanelActionListPresentational`),
  the demo page composes the sub-organisms in a vertical stack inside
  the layout's `pageBody` slot.
- Update `packages/app/src/layouts/base-layout.astro` and
  `packages/landing/src/layouts/landing-layout.astro` to import the
  React `AppLayout` / `LandingLayout` and project it via the existing
  Astro `<slot />`. The Astro layer keeps the HTML document and meta
  tags; the layout keeps the React tree.
- Extend `packages/design-system/scripts/check-atomic-layers.ts`
  with four new rules: `R-LAYOUTS-NO-PAGE-IMPORT`, `R-LAYOUTS-NO-HEROUI`,
  `R-PAGES-LADLE-ONLY` (every file under `pages/` ends in
  `.page.ladle.tsx`), and `R-PAGES-USE-MOCK` (every file under
  `pages/` imports at least one `*.mock` helper).
- Re-export `Layouts` and a Ladle-only `Pages` namespace from
  `packages/design-system/src/index.ts`. `Pages` is gated by the
  existing `tests/unit/no-ladle-replica-in-production.test.ts`
  policy: production code (anything outside `packages/design-system/src/pages/`)
  cannot import it.
- Add a permanent unit test that asserts every file under
  `packages/design-system/src/pages/` ends in `.page.ladle.tsx` and
  imports a `*.mock` fixture.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-package`: ADDED requirement `Layouts are layout shells with no page-specific data`; ADDED requirement `Every page surface has a demo page viewable in Ladle with mock data`. The capability also gains an explicit "layouts compose organisms (never HeroUI directly)" rule and an explicit "pages are Ladle-only" rule that mirror the molecules-layer contract.

## Impact

- `packages/design-system/src/layouts/` — two new layout folders
  (`app-layout/`, `landing-layout/`) with `<layout>.tsx`,
  `<layout>.types.ts`, `<layout>.mock.ts`, and `<layout>.ladle.tsx`.
- `packages/design-system/src/pages/` — ~12 new `*.page.ladle.tsx`
  files spread across `auth/`, `discovery/`, `members/`, `bookings/`,
  `admin/`, `partner/`, `payments/`, `landing/`.
- `packages/design-system/src/index.ts` — barrel adds `Layouts`
  namespace and a Ladle-only `Pages` namespace.
- `packages/design-system/scripts/check-atomic-layers.ts` — four
  new rule functions; the `LAYERS` constant already includes
  `layouts` and `pages`, so the existing walker will pick them up.
- `packages/app/src/layouts/base-layout.astro` and
  `packages/landing/src/layouts/landing-layout.astro` — Astro
  layouts become thin wrappers around the React layout; existing
  `<slot />` projection is preserved.
- `tests/unit/` — a new permanent unit test
  (`design-system-pages.test.ts`) that asserts every file under
  `packages/design-system/src/pages/` ends in `.page.ladle.tsx` and
  imports a `*.mock` fixture.
- `package.json` — `bun run check` already invokes `bun run check:atomic-layers`;
  no new scripts are introduced.
