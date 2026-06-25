## Context

The product surface today exposes three separate auth routes — `/login`,
`/signup`, `/membership` — that render overlapping pieces of the same form.
The landing `LandingPage` component already takes an `initialMode` prop
(`"login" | "signup"`) so the form primitive is unifiable, but the routes
that mount it and the public nav CTA that points at it were wired
independently:

- `LandingPage` lives in
  `packages/app/src/components/unveiled/visual-system-app.tsx` and is
  mounted by `pages/[lang]/login.astro` and `pages/[lang]/signup.astro`,
  each passing its own `initialMode`. There is no in-form toggle link,
  so switching modes means a navigation round-trip.
- `pages/[lang]/membership.astro` is a marketing page that links to
  "Start membership" — a button that today routes the user *back* to
  the same `LandingPage` with `initialMode="signup"`.
- The public nav's primary CTA is rendered by
  `packages/app/src/lib/auth-display.ts` and always reads "Become a
  member" / "Mitglied werden", regardless of viewer state.
- Neither `login.astro` nor `signup.astro` checks the session cookie
  before rendering; an authenticated viewer sees the form as if they
  were a guest.

The fix needs to: (a) make the form the single source of truth across
all three routes, (b) keep `/membership` as a marketing page *and*
inline the form, (c) flip the nav CTA based on viewer state, and (d)
short-circuit the auth flow for authenticated viewers with a server-side
redirect so no flicker of the form is visible.

## Goals / Non-Goals

**Goals:**

- One form, three modes (`login`, `signup`, `forgot-password`), reachable
  from any of `/login`, `/signup`, `/membership` without a navigation.
- A signed-in visitor never sees the auth form (server-side
  `Astro.redirect`).
- The public nav CTA is "Become a member" for guests and "Open app" /
  "App öffnen" for authenticated viewers, pointing at the
  role-appropriate product surface.
- The `login-form` and `signup-form` organisms expose a `footerSlot:
  ReactNode` so the page that mounts them owns the toggle copy without
  hard-coding "Already a member? Log in" inside the primitive.
- New gherkin scenarios cover guest, signed-in, and
  signed-in-as-partner flows.

**Non-Goals:**

- Removing `/login` or `/signup` URLs entirely. Deep links stay live;
  they just render the unified form (and redirect when authenticated).
- Rewriting the marketing copy on `/membership`.
- Touching the Better Auth server configuration or session shape.

## Decisions

- **Render the form inline on `/membership` rather than redirecting.**
  First-time visitors stay in the marketing context while signing up;
  the "Start membership" CTA on the marketing copy scrolls to the
  form (anchor link + `scrollIntoView`) instead of routing. Alternative
  considered: redirect `/membership` → `/signup?from=membership` —
  rejected because it adds a click and breaks marketing-CTA analytics.

- **Server-side `Astro.redirect` for the signed-in path; client-side
  `useEffect` only as a fallback.** Astro pages call `getViewer`
  before render and return `Astro.redirect(getAuthRedirectPath(viewer))`
  when the cookie is present. The React island additionally watches
  `getViewer(...)` in a `useEffect` so cookies issued after the page
  rendered (e.g. immediately after a sign-in redirect) still trigger a
  client-side jump without server round-trip. Alternative considered:
  client-only `useEffect` redirect — rejected because it flickers the
  form briefly, which the spec forbids.

- **Bidirectional mode toggle via `footerSlot: ReactNode` prop.**
  Adding a hard-coded link inside the form primitive would force the
  primitive to know about both modes. Instead, the primitive owns the
  chrome (button labels, validation) and accepts a slot for the
  "switch mode" affordance. `LandingPage` renders the right slot for
  each `initialMode` and toggles `mode` state on click. This keeps the
  primitive dumb and re-usable across contexts.

- **Nav CTA target derived from `viewer.viewerContext`.** For
  authenticated viewers, `auth-display.ts` builds
  `${prefix}${routePathFor(viewer.viewerContext)}` (already used by
  other shells), with copy "Open app" (DE: "App öffnen"). For guests,
  the CTA stays "Become a member" → `/membership`.

- **`useEffect` redirect state shape: `signedInPath: string | null`.**
  On mount, if `getViewer(...)` returns `authenticated`,
  `setSignedInPath(getAuthRedirectPath(viewer, callbackURL))` and
  `window.location.assign(signedInPath)`. The existing
  `useEffect`-after-mount discipline is preserved so SSR doesn't trip
  on `window`.

## Risks / Trade-offs

- **SEO: rendering the form on `/membership` could change how search
  engines index the page.** → Mitigation: keep the marketing copy
  above the form, mark the form region with `noindex` / `aria-hidden`
  hints, and ensure the page title still reflects the marketing topic.

- **Localisation drift: the new "Open app" copy must be added to the
  DE and EN dictionaries.** → Mitigation: the new dict keys are added
  in this change (task 3.1) and picked up by the existing i18n check
  in `bun run check`.

- **Server-side redirect race with hydration.** If the session cookie
  is rotated between the server check and the client `useEffect`, the
  page could render the form for one tick before the `useEffect`
  fires. → Mitigation: `useEffect` is the *fallback*; the server-side
  redirect handles the steady-state. The flicker is one frame at most
  and only happens in the race window.

- **`/login` and `/signup` deep links from external auth providers
  (e.g. email confirmation links).** They must continue to work for
  *unauthenticated* users. → Mitigation: the redirect only fires when
  `viewer.kind === "authenticated"`; guests still see the form.

- **Breaking the `login-form` / `signup-form` organism contracts.**
  Adding `footerSlot: ReactNode` is purely additive (optional prop),
  so existing consumers compile unchanged. → Verified by
  `bun run typecheck:workspaces`.

## Migration Plan

1. Land the form primitive changes (`footerSlot` prop) first; no
   consumer impact.
2. Land the `LandingPage` mode-toggle wiring.
3. Land the `/membership` inline-form rendering.
4. Land the server-side redirect on `/login` and `/signup`.
5. Land the nav CTA flip in `auth-display.ts`.
6. Land the gherkin + Ladle stories + unit test.
7. Roll forward; no migration of stored data. Rollback is per-commit
   revert; the change is contained to the public auth surface.

## Open Questions

- Should the `signed-in-redirect` apply to `/signup` too, or only to
  `/login`? — Decision (per proposal): both routes redirect, since a
  signed-in viewer has nothing to gain from either.
- Do we keep `/signup` as a routable alias or remove it? — Decision
  (per non-goals): keep it routable for deep-links; the unified form
  renders identically.
- Where does `getAuthRedirectPath` live? — Already exported from
  `packages/app/src/lib/auth-display.ts` (or a sibling); we reuse the
  existing helper.