# Unveiled MVP C4 Architecture

> **The C4 diagrams in this document are not maintained here.** The single
> source of truth is the LikeC4 model under [`architecture/`](../architecture/).
> Hand-edited Mermaid blocks outside the LikeC4 model source are not
> permitted; the drift check in `bun run arch:drift` fails the build if a
> referenced file path is missing from the repo. Diagrams are for developer
> consumption — open the `.likec4` files in an editor with the [LikeC4 VS Code
> extension](https://marketplace.visualstudio.com/items?itemName=likec4.likec4)
> (or any LikeC4-compatible LSP client) to view them.

This document is the **narrative companion** to the model: it explains the
intent, deployment topology, and communication protocols. The diagrams
themselves live in the model.

## Single Source of Truth

| Layer | Location | How it's maintained |
| :--- | :--- | :--- |
| C4 model (L1–L5) | `architecture/*.likec4` | Edited by hand; `bun run arch:check` validates. |
| Cross-references (openspec, TypeSpec, gherkin) | `architecture/specs.likec4` | Edited by hand; same validation. |
| Drift check | `scripts/check-architecture-drift.ts` | Runs in `arch:check` and in CI. |

To update the architecture, edit the `.likec4` files, then run
`bun run arch:check` to validate the model and verify the drift check still
passes. CI will fail the build if either step fails.

---

## 1. System Context (L1)

The L1 view (in `architecture/views.likec4` under the `C4` folder) shows the
boundaries of the Unveiled MVP system and its interactions with users and
external services.

### Context Components & Boundaries

| Actor / System | Description | Trust Boundary / Protocol |
| :--- | :--- | :--- |
| **Guest User** | Unauthenticated viewer browsing public discovery, FAQ, and membership landing pages. | Untrusted, HTTPS |
| **Member User** | Authenticated subscriber booking cultural access events, checking credits, saving events. | Authenticated user session, HTTPS |
| **Partner / Venue** | Authenticated partner check-in agent registering event arrivals at venues. | Authenticated partner session, HTTPS |
| **Admin** | Superuser overseeing users, venues, global credits, and system operational configs. | Authenticated admin session, HTTPS |
| **Unveiled MVP** | Core Astro SSR Application and associated state layers. | Core system |
| **Stripe** | External billing processor handling subscriptions, checkout charges, and billing portals. | External trusted API, HTTPS / Webhooks |
| **Cloudflare R2** | Cloud object storage bucket used for hosting event/venue images and uploads. | External trusted API, HTTPS |

---

## 2. Container Architecture (L2)

The L2 view (in `architecture/views.likec4` under the `C4` folder) breaks
down the runtime environments within the Unveiled MVP system.

### Container Details

* **Client Container (Web Browser)**:
  * **Astro Page Templates**: Statically or server-rendered templates forming the structural UI.
  * **React Client Component Islands**: Selected dynamic views (e.g. Booking modal interactive flows, filter components) hydrated on the client.
  * **Vanilla JS**: Quick browser-native styles and navigation drawer transitions.
* **Server Container (Astro SSR Server / Cloudflare Worker)**:
  * Runs the Astro Server middleware and endpoint routing. Runs on Cloudflare Workers/Pages in production.
  * **Better Auth Engine**: Handles user sessions, registration, and role verification (User, Admin, Partner).
  * **Astro Actions**: Structured endpoint functions for type-safe client-server mutations.
  * **SSE Endpoint**: Server-Sent Events stream for push updates (e.g., live venue check-in notifications).
  * **Drizzle ORM**: Maps database queries to type-safe TypeScript interfaces.
* **Data Container**:
  * **PGlite / Neon Postgres**: Relational data store. PGlite runs locally (`./.data/pglite`), while production uses a managed Postgres instance. Both use standard Drizzle integrations.
  * **R2 Bucket**: Object storage for uploaded event/partner/avatar images.

---

## 3. Communication Protocols

All component communication boundaries follow strict interface protocols:

1. **HTTPS / REST Actions**:
   * Client-to-Server interactions utilize type-safe **Astro Actions** over POST requests.
   * Responses return JSON with standard status codes.
2. **Server-Sent Events (SSE)**:
   * Real-time notifications (such as live check-ins) use standard `text/event-stream` connections.
   * The client initiates an SSE channel; the server streams JSON messages to keep client state synchronized without polling.
3. **Webhooks**:
   * Stripe triggers asynchronous events (e.g. `customer.subscription.updated`) directed to `/api/webhooks/stripe`.
   * These webhooks must be verified using Stripe's signing secret and processed idempotently.

---

## 4. Editing the Model

1. Edit the relevant `.likec4` file under `architecture/`.
2. Run `bun run arch:check` to validate the model and run the drift check.
3. Commit the change.

The drift check verifies that every element's `metadata.path` value resolves to
a real file in the repo, so renaming an Astro page without updating the model
fails the build with a clear error. Use `bun run arch:drift --update` from a
renaming PR to surface the affected files.

To view the diagrams while editing, install the
[LikeC4 VS Code extension](https://marketplace.visualstudio.com/items?itemName=likec4.likec4).
