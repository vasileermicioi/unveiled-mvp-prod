## Context

The migrated app currently mounts the visual product experience from `src/pages/index.astro` into a hydrated React island. That proves the shell and display data path work, but it leaves most legacy-visible surfaces reachable only through client view state or not reachable at all.

The legacy app used React Router and role-based view redirects. The target app should not preserve that routing implementation, but it must preserve the user-visible contract: public pages have stable URLs, member pages are protected, partner users land in the partner portal, and admin users land in admin operations.

## Goals / Non-Goals

**Goals:**

- Add Astro-owned pages for all legacy-visible public, member, partner, and admin surfaces.
- Resolve viewer role on the server for each route before protected display data is loaded.
- Keep shared shell behavior consistent by passing route-derived shell display state into the existing visual app/components.
- Make navigation activate normal URL changes and derive selected state from the current path.
- Keep `/venue-check-in/[partnerId]?token=...` as the target-native QR check-in route.

**Non-Goals:**

- Rebuild every legacy form interaction as part of route parity.
- Reintroduce React Router or legacy client route state.
- Change database schema or payment provider contracts.
- Preserve Firebase query parameters except visible QR check-in behavior.

## Decisions

1. Astro pages own URL routing.

   Each stable route is represented by an Astro page under `src/pages/`. The page resolves the viewer, applies route ownership rules, loads only the display data needed for that surface, and renders the shared shell or visual app with an explicit route/surface identifier.

   Alternative considered: keep one catch-all page and switch client views after hydration. That would preserve the current prototype shape but fails stable URL ownership, SSR authorization, and active navigation requirements.

2. `/app` is the authenticated member discovery surface.

   `/discover` remains public discovery. `/app` renders member discovery with saved-state and membership-aware data for role `USER`. This avoids changing public discovery semantics and gives signed-in members a stable home equivalent to the legacy current-access view.

   Alternative considered: redirect signed-in members from `/app` to `/discover`. That would overload `/discover` with public and member meanings and make route-derived navigation less explicit.

3. Role redirects happen before protected loaders.

   Guests opening protected routes go to a guest-safe landing/login experience. Partners opening member or admin pages go to `/partner` unless the target is public. Admins opening `/partner` without partner ownership go to `/admin`. Protected loaders should not run until the route owner is validated.

   Alternative considered: render forbidden states on protected pages. Redirects better match the legacy visible behavior and reduce accidental protected-data fetches.

4. Navigation links are generated from shell display data.

   Shell navigation receives route targets and active identifiers from server-derived display data. Hydrated components can still manage local UI interactions, but primary product navigation uses anchors or URL navigation rather than demo-only view setters.

   Alternative considered: keep local view switching and update `history.pushState`. That creates two routing sources of truth and makes SSR state harder to reason about.

## Risks / Trade-offs

- Route pages duplicate similar viewer/loading boilerplate -> Use small route helper functions for ownership checks, shell creation, and redirects.
- Existing visual-system island may assume local view switching -> Introduce route/surface props incrementally and keep local state only for non-route UI controls.
- Membership checkout for guests may need provider initialization after login -> Public `/membership` renders plan and sign-in affordance; provider-backed payment controls require an authenticated eligible member.
- Partner/admin ownership can be misapplied if only navigation is hidden -> Enforce authorization in route pages and data loaders, not just in visible nav.

## Migration Plan

1. Add shared route metadata and ownership helpers for public, member, partner, and admin surfaces.
2. Add Astro pages for each stable route and wire them to existing shell/display loaders.
3. Update shell navigation to use URL targets and derive active state from the route.
4. Add redirects for unauthorized role/page combinations before protected loaders run.
5. Verify build and targeted route behavior locally.
