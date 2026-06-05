# Unveiled MVP C4 Architecture

This document defines the system context, runtime containers, component organization, and communication protocols for the Unveiled MVP platform.

---

## 1. System Context (L1)

The System Context diagram shows the boundaries of the Unveiled MVP system and its interactions with users and external services.

```mermaid
graph TD
    Guest([Guest User]) -->|Browses events & memberships via HTTPS| Unveiled[Unveiled MVP System]
    Member([Member User]) -->|Manages bookings, saves events, payments via HTTPS| Unveiled
    Partner([Partner / Venue Manager]) -->|Checks in members, manages venue details via HTTPS| Unveiled
    Admin([Administrator]) -->|Manages users, venues, systems via HTTPS| Unveiled

    Unveiled -->|API requests / HTTPS| Stripe[Stripe Payment Gateway]
    Stripe -->|Webhook notifications / HTTPS| Unveiled
    
    Unveiled -->|File storage / HTTPS| R2[Cloudflare R2 Storage]
```

### Context Components & Boundaries

| Actor / System | Description | Trust Boundary / Protocol |
| :--- | :--- | :--- |
| **Guest User** | Unauthenticated viewer browsing public discovery, FAQ, and membership landing pages. | Untrusted, HTTPS |
| **Member User** | Authenticated subscriber booking cultural access events, checking credits, saving events. | Authentrusted User Session, HTTPS |
| **Partner / Venue** | Authenticated partner check-in agent registering event arrivals at venues. | Authentrusted Partner Session, HTTPS |
| **Admin** | Superuser overseeing users, venues, global credits, and system operational configs. | Authentrusted Admin Session, HTTPS |
| **Unveiled MVP** | Core Astro SSR Application and associated state layers. | Core System |
| **Stripe** | External billing processor handling subscriptions, checkout charges, and billing portals. | External Trusted API, HTTPS / Webhooks |
| **Cloudflare R2** | Cloud object storage bucket used for hosting event/venue images and uploads. | External Trusted API, HTTPS |

---

## 2. Container Architecture (L2)

The Container level diagram breaks down the runtime environments within the Unveiled MVP system.

```mermaid
graph TB
    subgraph BrowserContainer [Client Container - Web Browser]
        direction TB
        AstroPages[Astro Page Templates]
        ReactIslands[React Client Component Islands]
        VanillaJS[Vanilla JS micro-interactions]
    end

    subgraph ServerContainer [Runtime Container - Astro SSR Server / Cloudflare Worker]
        direction TB
        BetterAuth[Better Auth Engine]
        AstroActions[Astro Actions Handler]
        SSEEndpoint[Server-Sent Events / SSE Service]
        DrizzleORM[Drizzle ORM Layer]
    end

    subgraph StorageContainer [Data Container]
        direction TB
        SQLiteDB[(SQLite / PGlite Database)]
    end

    subgraph ExternalServices [External Services]
        StripeAPI[Stripe Payments API]
        R2Bucket[Cloudflare R2 Bucket]
    end

    %% Interactions
    AstroPages -->|Delivers HTML/JS| BrowserContainer
    ReactIslands -->|Invoke server-side functions via HTTPS| AstroActions
    ReactIslands -->|Listen to live updates via SSE| SSEEndpoint
    
    BetterAuth -->|Read/Write user schema| DrizzleORM
    AstroActions -->|Read/Write database data| DrizzleORM
    DrizzleORM -->|SQL Queries| SQLiteDB
    
    AstroActions -->|HTTPS API Requests| StripeAPI
    StripeAPI -->|HTTPS Webhook events| AstroActions
    AstroActions -->|S3-compatible HTTPS APIs| R2Bucket
```

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
  * **SQLite / PGlite**: Relational data store. PGlite runs locally in memory/disk (`./.data/pglite`), while production uses a managed Postgres instances. Both use standard Drizzle integrations.

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
