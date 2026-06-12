## ADDED Requirements

### Requirement: Astro Action Inputs Are Parsed By The Generated Zod Schema
Every Astro Action under `src/actions/index.ts` SHALL declare its input schema by importing from `src/lib/generated/actions`, and the runtime envelope SHALL remain Astro Action's `safe` / `data` / `error` shape.

#### Scenario: Action input is parsed by the generated schema
- **WHEN** an Astro Action is invoked
- **THEN** its input is parsed through the Zod schema emitted by the TypeSpec build for that action
- **AND** validation failures produce the same error envelope as the existing hand-written Zod schemas

#### Scenario: Action result type is imported from the generated module
- **WHEN** a form or page consumes an Astro Action's result
- **THEN** the consumer's TypeScript types import from `src/lib/generated/actions`
- **AND** the `safe` / `data` / `error` envelope is preserved

#### Scenario: Hand-written Zod schemas in action-contracts are replaced
- **WHEN** an Astro Action is migrated to the generated module
- **THEN** its hand-written Zod schema in `src/lib/action-contracts.ts` is removed
- **AND** `src/actions/index.ts` imports the action's input schema and result type from `@/lib/generated/actions`
- **AND** `src/lib/action-contracts.ts` becomes a thin re-export shim or is removed entirely once every action is migrated
