## Why

The public landing surface currently exposes three URLs (`/login`, `/signup`,
`/membership`) that all funnel into pieces of the same auth form. Two seams
hurt the UX: (1) clicking "Become a member" on the public nav opens
`/membership` as a marketing page, and the user must click "Start
membership" to *actually* become a member — only to land on the auth
landing form again. (2) When an authenticated viewer hits `/login` or
`/signup`, the form silently treats them as a guest with no "you're already
signed in" affordance. This change unifies the three routes into a single
form surface, makes `/membership` render the form inline, and adds a
signed-in redirect for the auth routes.

## What Changes

- Make `/membership` render the signup form (`initialMode="signup"`) below
  the marketing copy. The "Start membership" CTA on the marketing copy
  scrolls the page to the form rather than navigating away.
- Add an "Already a member? Log in" link inside the auth landing form in
  every mode, plus a matching "Become a member" link inside `login` mode,
  so the user can flip between modes without a page navigation.
- Surface a `signed-in-redirect` terminal state when a guest hits `/login`
  or `/signup` while a valid session cookie is present: the page
  server-side redirects (Astro `Astro.redirect`) to the role-appropriate
  product surface; client-side `useEffect` only as a fallback for cookies
  issued after the page rendered.
- Hide the public nav "Become a member" CTA when the viewer is already
  authenticated. The CTA becomes "Open app" instead, pointing at
  `/app/<lang>/app` (or the role-appropriate `/app/<lang>/admin`,
  `/app/<lang>/partner`).
- Add a `footerSlot: ReactNode` prop to `login-form` and `signup-form`
  organisms so the primitive stays the source of truth for the toggle
  links.

## Capabilities

### New Capabilities

_None — every behaviour above extends an existing capability spec._

### Modified Capabilities

- `auth`: extend the **Better Auth Email Password Flow** requirement with
  a new requirement — **Auth Landing Form Has A Single Source Of Truth** —
  that mandates (a) a one-click mode switch between `login` / `signup`
  from inside the form, and (b) a server-side redirect to the
  role-appropriate product surface for authenticated viewers hitting
  `/login` or `/signup`, with no client-side flicker of the auth form.
- `pages`: extend the **Membership Marketing Page** requirement so that
  `/membership` always renders the signup form below the marketing copy
  for guests (the "Start membership" CTA scrolls to the form, not
  navigates) and renders an "Open app" button instead of the form for
  authenticated viewers.
- `shell-aria-i18n`: extend the **Public Nav Primary Action** rule so
  the CTA label and target flip on `viewer.kind === "authenticated"`
  ("Open app" / "App öffnen" → role-appropriate `/app/<lang>/...`
  surface).

## Impact

- **Touched files (estimated):**
  - `packages/design-system/src/organisms/auth/login-form/login-form.tsx`
    — add optional `footerSlot: ReactNode` prop.
  - `packages/design-system/src/organisms/auth/signup-form/signup-form.tsx`
    — add optional `footerSlot: ReactNode` prop with default "Already a
    member? Log in" link.
  - `packages/app/src/components/unveiled/visual-system-app.tsx` —
    render the right footer slot for each mode, toggle `mode` on click,
    and add the `signedInPath` `useEffect` redirect fallback.
  - `packages/app/src/pages/[lang]/login.astro`,
    `packages/app/src/pages/[lang]/signup.astro` — call `getViewer`
    before render; if authenticated, return `Astro.redirect(...)`.
  - `packages/app/src/pages/[lang]/membership.astro` — render marketing
    copy + `VisualSystemApp` (mode `signup`) on the same page; for
    authenticated viewers render an "Open app" button instead of the
    form.
  - `packages/app/src/lib/auth-display.ts` — flip `primaryAction.label`
    and `primaryAction.targetHref` on `viewer.kind === "authenticated"`.
  - `packages/app/src/lib/auth-display.test.ts` (new) — unit test for
    `primaryAction.label` switching on viewer kind.
  - `tests/features/auth/landing-modes/feature.feature` (new) — gherkin
    scenarios for `guest`, `signed-in`, `signed-in-as-partner`.
  - `tests/features/auth/landing-modes/login-form.ladle.tsx` (new) —
    three matching Ladle stories.
  - `docs/auth.md` — document the unified-form rule and the "already
    signed in" redirect.
- **New dict strings** for "Open app" / "App öffnen" in DE + EN
  dictionaries (`api/i18n.ts`).
- **Breaking:** none. `/login` and `/signup` URLs remain routable; they
  just render the unified form.