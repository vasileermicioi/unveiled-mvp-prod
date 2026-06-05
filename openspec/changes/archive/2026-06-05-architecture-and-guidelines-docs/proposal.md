## Why

As the project scales and automated agents (and human developers) contribute to the codebase, there is a critical need for structured documentation to preserve architectural alignment, styling conventions, and domain-level feature scope. Currently, the C4 architecture, TypeScript/Astro coding standards, and high-level epic definitions are not formally documented, leading to potential inconsistency and integration friction.

## What Changes

- **NEW** C4 architecture specification mapping system context (including external integrations like Stripe and Cloudflare R2), runtime containers (Astro server, SQLite/PGlite database, React client components), and communication protocols (HTTPS, Server-Sent Events, Webhooks).
- **NEW** Formal guidelines for TypeScript strict checks, Astro layouts and component organization, Biome linting/formatting rules, and styling conventions.
- **NEW** A High-Level Epic Feature Specification grouping development features by functional business domains (Discovery Feed, Member Payments, Media Storage, Venue Check-in) to define system boundaries without low-level details.

## Capabilities

### New Capabilities
- `architecture-and-guidelines`: Establish and enforce system architecture diagrams, styling/coding guidelines, and domain epics.

### Modified Capabilities

## Impact

- **Affected code**: All current and future Astro/React components, styles, database configurations, and deployment strategies must align with these specs.
- **APIs & Protocols**: Stripe webhook endpoints, SSE connection configurations, and REST/Astro endpoints will now follow defined integration protocols.
- **Tooling**: Biome configuration and `bun run check` script execution will be linked to the defined guidelines as validation gates.
