## ADDED Requirements

### Requirement: VisualSystemApp Initial Mode

The `VisualSystemApp` React island exported from `packages/app/src/components/unveiled/visual-system-app.tsx` SHALL accept an optional `initialMode?: "login" | "signup" | "recovery"` prop (default `"login"`) and forward it to the embedded `LandingPage` so the auth form opens on the correct tab. The `LandingPage` SHALL use the prop to initialize its internal `mode` state (the `useState<"login" | "signup" | "recovery">` initializer) so the auth form, its endpoint (`/api/account/login`, `/api/account/signup`, `/api/account/password-recovery`), and its Zod resolver all reflect the requested mode on first paint.

#### Scenario: VisualSystemApp default initialMode is login

- **WHEN** a contributor renders `<VisualSystemApp initialShell={...} initialDiscovery={...} initialView="landing" />` without an `initialMode` prop
- **THEN** the embedded `LandingPage` opens with `mode === "login"`
- **AND** the auth form's submit endpoint is `/api/account/login`
- **AND** the form uses `loginSchema` as its Zod resolver.

#### Scenario: VisualSystemApp forwards initialMode to LandingPage

- **WHEN** a contributor renders `<VisualSystemApp initialMode="signup" ... />`
- **THEN** the embedded `LandingPage` opens with `mode === "signup"`
- **AND** the auth form's submit endpoint is `/api/account/signup`
- **AND** the form uses `signupSchema` as its Zod resolver.

#### Scenario: VisualSystemApp initialMode accepts the recovery mode

- **WHEN** a contributor renders `<VisualSystemApp initialMode="recovery" ... />`
- **THEN** the embedded `LandingPage` opens with `mode === "recovery"`
- **AND** the auth form's submit endpoint is `/api/account/password-recovery`
- **AND** the form uses `passwordRecoverySchema` as its Zod resolver.

### Requirement: Dedicated Auth Pages Render With Localized Title

Each dedicated public auth page (`packages/app/src/pages/[lang]/login.astro`, `packages/app/src/pages/[lang]/signup.astro`, `packages/app/src/pages/[lang]/recovery.astro`) SHALL mount `BaseLayout` with a localized `title` attribute (`Login | Unveiled`, `Sign up | Unveiled`, `Password recovery | Unveiled` — the EN strings; the DE equivalents are sourced through the existing i18n layer used by `BaseLayout`). Each page SHALL resolve the `lang` URL parameter via `normalizeLanguage`, hydrate the viewer via `getViewer`, build the initial shell via `createShellFromViewer(viewer, "landing")`, load public discovery data via `loadPublicDiscoveryData`, build the surface data via `createPublicInitialSurfaceData`, and render the `VisualSystemApp` island with `client:load`, `initialView="landing"`, and `initialMode` matching the page (`login`, `signup`, or `recovery`).

#### Scenario: /app/en/login renders the login form

- **WHEN** a contributor visits `/app/en/login`
- **THEN** the page renders the `BaseLayout` with `title="Login | Unveiled"`
- **AND** the embedded `VisualSystemApp` is mounted with `initialMode="login"`
- **AND** the response status is `200`.

#### Scenario: /app/en/signup renders the signup form

- **WHEN** a contributor visits `/app/en/signup`
- **THEN** the page renders the `BaseLayout` with `title="Sign up | Unveiled"`
- **AND** the embedded `VisualSystemApp` is mounted with `initialMode="signup"`
- **AND** the response status is `200`.

#### Scenario: /app/en/recovery renders the password-recovery form

- **WHEN** a contributor visits `/app/en/recovery`
- **THEN** the page renders the `BaseLayout` with `title="Password recovery | Unveiled"`
- **AND** the embedded `VisualSystemApp` is mounted with `initialMode="recovery"`
- **AND** the response status is `200`.

#### Scenario: Dedicated login page parses a safe deep-link redirect

- **WHEN** a contributor visits `/app/en/login?redirect=%2Fadmin`
- **THEN** the page frontmatter parses the `redirect` query parameter through `parseSafeRedirectTarget`
- **AND** when the helper returns a route, the page builds a safe `callbackURL` from the validated path (e.g. `/${lang.toLowerCase()}/admin`) and forwards it to the `VisualSystemApp`
- **AND** when the helper returns `null` (e.g. for an off-site or cross-language value), the page falls back to `/${lang.toLowerCase()}/` so the post-login redirect lands on the per-surface safe destination.