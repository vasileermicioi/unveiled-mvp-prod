## 1. Auth landing form

- [x] 1.1 In `packages/design-system/src/organisms/auth/login-form/login-form.tsx`, add an optional `footerSlot: ReactNode` prop and render it after the create-account button.
- [x] 1.2 Mirror the change in `packages/design-system/src/organisms/auth/signup-form/signup-form.tsx` with a `footerSlot` prop and a default "Already a member? Log in" link that calls `onSwitchToLogin`.
- [x] 1.3 In `packages/app/src/components/unveiled/visual-system-app.tsx`, wire the `LandingPage` so it renders the right footer slot for each mode and toggles `mode` on click.
- [x] 1.4 Add a new local state `signedInPath: string | null` in `LandingPage`. On mount, if `getViewer(...)` returns `authenticated`, set `signedInPath = getAuthRedirectPath(viewer, callbackURL)` and `window.location.assign` it. Keep the existing `useEffect` shape so SSR doesn't trip.

## 2. Astro pages

- [x] 2.1 In `packages/app/src/pages/[lang]/login.astro` and `packages/app/src/pages/[lang]/signup.astro`, call `getViewer` before render. If `viewer.kind === "authenticated"`, return `Astro.redirect(getAuthRedirectPath(viewer))`.
- [x] 2.2 In `packages/app/src/pages/[lang]/membership.astro`, render the marketing copy and the `VisualSystemApp` (mode `signup`) on the same page. For authenticated viewers, render an "Open app" button instead of the form.

## 3. Shell nav

- [x] 3.1 In `packages/app/src/lib/auth-display.ts`, flip `primaryAction.label` and `primaryAction.targetHref` based on `viewer.kind === "authenticated"`. The CTA becomes `${prefix}${routePathFor(viewer.viewerContext)}` with copy "Open app" (DE: "App öffnen", EN: "Open app").
- [x] 3.2 Add the new "Open app" / "App öffnen" keys to the DE and EN dictionaries in `packages/api/src/i18n.ts` (or wherever the typed shell copy bundle lives) so the typed `i18n.shell.*` constraint is satisfied.

## 4. Tests

- [x] 4.1 Add `tests/features/auth/landing-modes/feature.feature` with three scenarios from the spec above (signup-form links to login, login-form links to signup, signed-in redirect), each tagged `@ladle(component="login-form", story="signed-in")`, `…="signed-in-as-partner"`, `…="guest"`.
- [x] 4.2 Add `tests/features/auth/landing-modes/login-form.ladle.tsx` with three matching stories.
- [x] 4.3 Add a unit test in `packages/app/src/lib/auth-display.test.ts` (new) asserting `primaryAction.label` switches on `viewer.kind`.

## 5. Documentation

- [x] 5.1 Update `docs/auth.md` with the unified-form rule and the "already signed in redirect" behaviour.