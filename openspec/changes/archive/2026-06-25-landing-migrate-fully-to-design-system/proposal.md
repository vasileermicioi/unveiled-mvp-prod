## Why

`@unveiled/landing` already imports organisms (`LandingHeader`,
`LandingHero`, `LandingFooter`) from `@unveiled/design-system`, but the
landing-local shim files under `packages/landing/src/components/landing/`
and the page body in `packages/landing/src/pages/index.astro` still
arrange those organisms with landing-local markup. The Astro layout
composes the document around a `<LandingLayout>` mount, but the page
itself instantiates the layout, the header, the hero, and the footer
directly through three re-export shims. This proposal collapses the
landing onto the design-system surface by adding a single
`LandingTemplate` organism (which composes the three existing
landing presentationals), mounting `<LandingTemplate>` from the Astro
layout and `<LandingHeroPresentational>` from the page, deleting
`packages/landing/src/components/landing/`, and extending the
`check:styling-ownership` gate with a regression guard that fails if
the landing package re-introduces local UI code.

## What Changes

- Add `packages/design-system/src/organisms/landing/landing-template/`
  with a new `LandingTemplate` React organism that composes
  `LandingHeaderPresentational`, an optional
  `LandingHeroPresentational`, an optional body, and
  `LandingFooterPresentational`. The component uses the same
  prop surface the existing presentationals already accept
  (`authenticated?`, `hero?`, `children?`); no new copy / nav
  configurability is introduced.
- Re-export `LandingTemplate` from the design-system barrel
  (`packages/design-system/src/index.ts`) and the
  `Organisms` namespace.
- Delete `packages/landing/src/components/landing/landing-header.tsx`,
  `landing-hero.tsx`, and `landing-footer.tsx` (the current
  re-export shims). Delete the now-empty
  `packages/landing/src/components/landing/` directory.
- Rewrite `packages/landing/src/layouts/landing-layout.astro` to
  keep only the HTML document (`<html>`, `<head>`, meta tags, the
  `@unveiled/design-system/styles/global.css` import) and mount a
  single `<LandingTemplate client:load>` from
  `@unveiled/design-system` that wraps `<slot />`.
- Rewrite `packages/landing/src/pages/index.astro` to render only
  the `<LandingHeroPresentational client:load>` mount. The page
  no longer imports the header, footer, or Astro layout directly.
- Add a `R-LANDING-NO-LOCAL-UI` rule to
  `packages/design-system/scripts/check-styling-ownership.ts` that
  rejects any future file under `packages/landing/src/**` that
  imports from `../components/landing/...` (the path no longer
  exists; the rule is a regression guard).
- Tighten the design-system-package requirement that already
  says the landing consumes the design system, not its internals,
  so the gate is the styling-ownership check plus the new
  `R-LANDING-NO-LOCAL-UI` rule plus a new permanent unit test.

## Capabilities

### Modified Capabilities

- `design-system-package`: ADD the requirement "Landing package
  consumes the design system, not its internals" (with the
  `R-LANDING-NO-LOCAL-UI` rule and the new
  `landing-design-system-import-boundary.test.ts`).
- `landing-package`: MODIFY the existing "reuses design-system
  primitives" requirement so the Astro layout mounts a single
  `<LandingTemplate>` and the page renders only the hero; REMOVE
  the "ships landing-specific React islands" requirement (the
  shims are deleted; the design-system `LandingTemplate` owns the
  composition).

## Impact

- `packages/design-system/src/organisms/landing/landing-template/` —
  new organism (component + index + barrel re-export + Ladle
  story).
- `packages/design-system/src/index.ts` — re-export
  `LandingTemplate` plus the `LandingTemplateProps` type.
- `packages/landing/` — rewrites `src/layouts/landing-layout.astro`
  and `src/pages/index.astro`; deletes `src/components/landing/`.
- `packages/design-system/scripts/check-styling-ownership.ts` —
  adds the `R-LANDING-NO-LOCAL-UI` regression rule and wires it
  into the umbrella `bun run check:styling-ownership` script.
- `tests/unit/landing-design-system-import-boundary.test.ts` —
  new permanent unit test under `bun run test:unit`.
- No new dependencies. No new routes. No orchestrator change.
  No copy / nav changes.