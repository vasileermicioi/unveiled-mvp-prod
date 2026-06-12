## ADDED Requirements

### Requirement: Loader Input Shapes Are Representable In The OpenAPI Contract
Every data-access surface loader and the `/api/data-access/[surface].json` route SHALL be representable in the OpenAPI 3.1 contract under `typespec/`, and the contract description SHALL be the source of truth for the loader's input schema.

#### Scenario: Each loader has a TypeSpec operation
- **WHEN** a new export is added to `src/lib/data-access/loaders.ts`
- **THEN** a matching operation is added under `SurfaceService.<surface>` in `typespec/`
- **AND** the operation's input model describes the loader's filter, pagination, and authorization parameters

#### Scenario: The data-access route uses the generated validator
- **WHEN** a request reaches `/api/data-access/[surface].json`
- **THEN** the route parses the request through the Zod validator emitted for `DataAccessService.querySurface`
- **AND** the response body conforms to the per-surface response model declared in TypeSpec

#### Scenario: Surface union is closed
- **WHEN** the TypeSpec project is compiled
- **THEN** the `surface` parameter of `DataAccessService.querySurface` is a closed union of every export of `src/lib/data-access/loaders.ts`
- **AND** adding a new loader requires a corresponding TypeSpec update before `bun run specs:check` passes
