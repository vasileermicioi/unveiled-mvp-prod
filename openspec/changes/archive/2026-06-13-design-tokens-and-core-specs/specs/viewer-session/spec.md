## ADDED Requirements

### Requirement: Viewer Is a Discriminated Union
The application SHALL expose a single `Viewer` discriminated union that every page, action, and API endpoint consumes, replacing ad-hoc viewer checks scattered across the codebase.

#### Scenario: Viewer variants cover every viewer context
- **WHEN** a contributor reads the type definition
- **THEN** `Viewer` is a discriminated union whose members cover `Guest`, `Member`, `Partner`, and `Admin`
- **AND** each variant carries the minimum fields required to render viewer-aware navigation (e.g. `Member` carries `id`, `displayName`, `languagePreference`, `savedCount`, `creditCount`)

#### Scenario: Components narrow on viewer.kind
- **WHEN** a component receives a `Viewer` prop
- **THEN** it narrows on `viewer.kind` (e.g. `if (viewer.kind === "Member")`) to access variant-specific fields
- **AND** the compiler rejects code that accesses a field on the wrong variant

#### Scenario: A single Viewer source-of-truth module
- **WHEN** a contributor searches for the `Viewer` type
- **THEN** the type is defined once in the viewer-session module
- **AND** no other module redeclares a competing `Viewer`, `User`, or `SessionUser` shape

### Requirement: Viewer Is Hydrated From Better Auth and Drizzle
The `Viewer` for a request SHALL be hydrated from the Better Auth session and the domain profile row in Drizzle, with explicit rules for each variant.

#### Scenario: Missing or invalid session yields a Guest
- **WHEN** a request arrives with no valid Better Auth session cookie
- **THEN** the hydrated `Viewer.kind` is `Guest`
- **AND** no database lookup is performed for the profile

#### Scenario: Valid session with role USER yields Member
- **WHEN** a request arrives with a valid Better Auth session
- **AND** the resolved user has role `USER`
- **THEN** the hydrated `Viewer.kind` is `Member`
- **AND** the variant carries the user's display name, language preference, saved count, and credit count from Drizzle

#### Scenario: Valid session with role PARTNER yields Partner
- **WHEN** a request arrives with a valid Better Auth session
- **AND** the resolved user has role `PARTNER`
- **THEN** the hydrated `Viewer.kind` is `Partner`
- **AND** the variant carries the partner id and any partner-specific display data required by the shell

#### Scenario: Valid session with role ADMIN yields Admin
- **WHEN** a request arrives with a valid Better Auth session
- **AND** the resolved user has role `ADMIN`
- **THEN** the hydrated `Viewer.kind` is `Admin`
- **AND** the variant carries the admin display fields required by the shell

#### Scenario: Hydration is performed once per request
- **WHEN** a request renders multiple components
- **THEN** `Viewer` is hydrated exactly once and threaded through Astro components and React islands rather than re-querying Better Auth or Drizzle in each component

### Requirement: Role and Permission Matrix Is Declared
The viewer-session module SHALL export a single role/permission matrix that the middleware, server actions, and UI components consult instead of string-typed role checks.

#### Scenario: Permission checks use the matrix
- **WHEN** an action or route must check whether a viewer can perform an operation
- **THEN** it calls a permission helper from the viewer-session module
- **AND** the helper consults the exported role/permission matrix

#### Scenario: No inline role string checks
- **WHEN** a contributor searches the codebase for `role === "ADMIN"` or `role === "PARTNER"`
- **THEN** all such checks live inside the viewer-session module
- **AND** no other module contains an inline role string comparison

### Requirement: Redirect-After-Login Table Is Declared
The viewer-session module SHALL export the redirect-after-login table that maps a pre-login URL and a viewer kind to a post-login destination.

#### Scenario: Authenticated viewer redirected from a public route to its default landing
- **WHEN** a Guest visits a public route (e.g. `/[lang]/membership`) while unauthenticated
- **AND** then completes login
- **THEN** the viewer is redirected to the public route's authenticated counterpart defined in the redirect table
- **AND** the language prefix is preserved

#### Scenario: Authenticated viewer redirected to its default surface
- **WHEN** a Guest visits `/[lang]/login`
- **AND** then completes login as a Member
- **THEN** the viewer is redirected to `/[lang]/app` per the redirect table
- **AND** the language prefix is preserved

#### Scenario: Unauthenticated access to a protected route redirects through login
- **WHEN** a Guest visits `/[lang]/admin`
- **THEN** the middleware redirects to `/[lang]/login?redirect=/[lang]/admin`
- **AND** after successful login, the redirect table routes the viewer to the requested route (or to the role default if access is denied)

### Requirement: Viewer-Aware Navigation Has Documented Requirements
Any page that renders viewer-aware navigation SHALL consume the hydrated `Viewer` prop and SHALL NOT query Better Auth or Drizzle directly.

#### Scenario: Shell consumes the Viewer prop
- **WHEN** the app shell renders
- **THEN** it receives `Viewer` as a prop from the layout
- **AND** it does not call Better Auth or Drizzle inside the shell component

#### Scenario: Page-specific nav receives the Viewer
- **WHEN** a page renders a role-specific navigation block
- **THEN** it consumes the `Viewer` prop
- **AND** it does not call Better Auth or Drizzle to re-resolve the viewer
