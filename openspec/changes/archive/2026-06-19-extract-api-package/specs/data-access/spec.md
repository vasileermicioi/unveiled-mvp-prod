## MODIFIED Requirements

### Requirement: Loader Input Shapes Are Representable In The OpenAPI Contract

Every data-access surface loader and the `/api/data-access/[surface].json` route SHALL be representable in the OpenAPI 3.1 contract under `typespec/`, and the contract description SHALL be the source of truth for the loader's input schema. Drizzle queries used by the HTTP layer SHALL live under `packages/api/src/data-access/**`; the Astro app SHALL keep a thin re-export at `src/lib/data-access/**` for the duration of the shim window.

#### Scenario: Each loader has a TypeSpec operation

- **WHEN** a new export is added to `packages/api/src/data-access/loaders.ts`
- **THEN** a matching operation is added under `SurfaceService.<surface>` in `typespec/`
- **AND** the operation's input model describes the loader's filter, pagination, and authorization parameters

#### Scenario: The data-access route uses the generated validator

- **WHEN** a request reaches `/api/data-access/[surface].json`
- **THEN** the Hono route parses the request through the Zod validator emitted for `DataAccessService.querySurface`
- **AND** the response body conforms to the per-surface response model declared in TypeSpec

#### Scenario: Surface union is closed

- **WHEN** the TypeSpec project is compiled
- **THEN** the `surface` parameter of `DataAccessService.querySurface` is a closed union of every export of `packages/api/src/data-access/loaders.ts`
- **AND** adding a new loader requires a corresponding TypeSpec update before `bun run specs:check` passes

#### Scenario: Hono routes import data-access from @unveiled/api

- **WHEN** a Hono route under `packages/api/src/routes/**` needs a Drizzle query
- **THEN** it imports the query from `@unveiled/api/data-access` (which is `packages/api/src/data-access/**`)
- **AND** it does not reach into `src/lib/data-access/**` directly

#### Scenario: Astro app keeps the re-export shim

- **WHEN** an SSR page in the Astro app imports a data-access helper
- **THEN** the import resolves through the `src/lib/data-access/**` re-export shim
- **AND** the shim delegates to `@unveiled/api/data-access`
- **AND** the shim is removed in change 04

## ADDED Requirements

### Requirement: Data-Access Layer Is Owned By @unveiled/api

The Drizzle query layer used by the HTTP surface SHALL live under `packages/api/src/data-access/**` and SHALL be re-exported by the package as `@unveiled/api/data-access`. Astro-only data access (SSR pages) SHALL continue to live under `src/lib/data-access/**` until change 04.

#### Scenario: Hono package owns HTTP-layer data access

- **WHEN** a contributor inspects `packages/api/src/data-access/**`
- **THEN** it contains every Drizzle query used by the Hono routes under `packages/api/src/routes/**`

#### Scenario: Astro app keeps SSR-page data access

- **WHEN** a contributor inspects `src/lib/data-access/**`
- **THEN** it contains every Drizzle query used by SSR pages under `src/pages/`
- **AND** it re-exports the Hono package's queries for backward compatibility