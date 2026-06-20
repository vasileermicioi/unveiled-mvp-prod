## MODIFIED Requirements

### Requirement: Viewer Is Hydrated From Better Auth and Drizzle

The `Viewer` for a request SHALL be hydrated from the Better Auth session and the domain profile row in Drizzle, with explicit rules for each variant. The hydration logic now lives in `packages/app/src/lib/auth.ts` (moved from `src/lib/auth.ts` in this change) and reads the shared Drizzle schema from `packages/app/src/db/schema.ts` (moved from `src/db/schema.ts`). The session cookie itself is issued by the API Worker, so the app's middleware only reads and validates the cookie and then hydrates the viewer from the shared schema.

#### Scenario: Missing or invalid session yields a Guest

- **WHEN** a request arrives with no valid Better Auth session cookie
- **THEN** the hydrated `Viewer.kind` is `Guest`
- **AND** no database lookup is performed for the profile.

#### Scenario: Valid session with role USER yields Member

- **WHEN** a request arrives with a valid Better Auth session
- **AND** the resolved user has role `USER`
- **THEN** the hydrated `Viewer.kind` is `Member`
- **AND** the variant carries the user's display name, language preference, saved count, and credit count from the shared Drizzle schema.

#### Scenario: Valid session with role PARTNER yields Partner

- **WHEN** a request arrives with a valid Better Auth session
- **AND** the resolved user has role `PARTNER`
- **THEN** the hydrated `Viewer.kind` is `Partner`
- **AND** the variant carries the partner id and any partner-specific display data required by the shell.

#### Scenario: Valid session with role ADMIN yields Admin

- **WHEN** a request arrives with a valid Better Auth session
- **AND** the resolved user has role `ADMIN`
- **THEN** the hydrated `Viewer.kind` is `Admin`
- **AND** the variant carries the admin display fields required by the shell.

#### Scenario: Hydration is performed once per request

- **WHEN** a request renders multiple components
- **THEN** `Viewer` is hydrated exactly once and threaded through Astro components and React islands rather than re-querying Better Auth or Drizzle in each component.

#### Scenario: Hydration reads the shared schema

- **WHEN** the middleware hydrates a `Viewer` from a valid session
- **THEN** it reads from the Drizzle schema exported by `packages/app/src/db/schema.ts`
- **AND** the schema is the same one the API Worker queries over HTTP (consumed via the `@unveiled/app/db/schema` workspace import path).
