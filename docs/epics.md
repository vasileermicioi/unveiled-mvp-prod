# Project Scrum Epics & Functional Domains

This document provides a comprehensive map of all functional domains and Scrum Epics in the Unveiled MVP system, inferred from the codebase, configuration files, and system specifications. 

---

## Domain 1: Core Platform & UI System

Governs the unified presentation shell, global page structures, styling themes, and language/localization state management.

### Epic: App Shell & Responsive Layout
* **Description**: Delivers a consistent top header, sidebar navigation drawer for mobile screens, and layout page slots.
* **Core Capabilities**:
  * Sticky header layout with dynamic logo, credits counts, saved count badges, and context-aware action groups.
  * Collapsible sliding mobile navigation drawer triggered by menu controls.
  * Shared page wrappers implementing global state containers (loading, empty, error views).
* **System Boundaries**: Layout wraps both server-side Astro pages and hydrates React islands inside slots.

### Epic: Localized Theme & Primitives
* **Description**: Enforces high-contrast brand styling guidelines (EK Notice Sans, bold borders, offset card shadows) and DE/EN localization strings.
* **Core Capabilities**:
  * Style system primitives (`.unveiled-border`, `.unveiled-shadow`, `.unveiled-card-hover`).
  * Segmented DE/EN language toggles prepending language parameter routes (`/[lang]/...`) and syncs via browser cookies.
  * Localized system banners (e.g. membership warnings or check-in alert status panels).
* **System Boundaries**: Layout styles must inherit from `global.css` CSS-variables. Biome ignores Astro templates but checks CSS/JS.

---

## Domain 2: Identity & Access Management (IAM)

Handles credential processing, session hydration, and role-based action authorization boundaries.

### Epic: Session & Profile Hydration
* **Description**: Integrates Better Auth for email/password credentials and links credentials to internal profile records.
* **Core Capabilities**:
  * Authenticated user session creation, profile persistence, and credential password validations.
  * DB sync mapping users to unique roles (`USER`, `PARTNER`, `ADMIN`).
  * Persistence of user-specific preferences (onboarding indicators, language preference).
* **System Boundaries**: Leverages client/server Better Auth middleware and endpoints.

### Epic: Role-Aware Authorization & Redirects
* **Description**: Controls route permissions, preventing unauthorized access to protected member, partner, and admin dashboards.
* **Core Capabilities**:
  * Middleware interception verifying active session tokens before page builds.
  * Type-safe route checks redirection utility functions.
  * Endpoint permission validation blocking illegal operations (e.g., guests attempting member bookings).
* **System Boundaries**: Redirect rules execute server-side in Astro middleware.

---

## Domain 3: Event Discovery & Calendars

Enables users to search, filter, and view upcoming cultural events, and add bookings to external calendars.

### Epic: Search, Filter, & Geo-Mapping
* **Description**: Displays events in card grids, plots them on an interactive coordinate map, and applies multi-parameter filters.
* **Core Capabilities**:
  * Card grid displaying event titles, times, costs, venues, and status tags.
  * Map component displaying geographic coordinates utilizing configurable Map Providers.
  * State synchronization coordinating filter queries and coordinates dynamically.
* **System Boundaries**: Map coordinates use configured provider parameters. Search states refresh page-scoped query parameters.

### Epic: Calendar Integration
* **Description**: Allows booked members to download event details directly to their personal calendars.
* **Core Capabilities**:
  * Generation of booking success metadata.
  * Dynamic calendar invitation format outputs (e.g., .ics or external link structures).
* **System Boundaries**: Success modal retrieves event calendar data after booking transactions complete.

---

## Domain 4: Member Billing & Subscriptions

Manages Stripe integrations, recurring plans, audit ledgers, and credit limits.

### Epic: Stripe Subscription Sync
* **Description**: Binds member accounts to recurring Stripe price IDs, syncing payment statuses through webhooks.
* **Core Capabilities**:
  * Stripe checkout session initialization and payment portal redirects.
  * Webhook receipt handlers updating local subscription statuses (active, unpaid, past-due, canceled) idempotently.
  * Storage of billing addresses and masked default payment method data.
* **System Boundaries**: Internal profiles store billing references; payments are processed externally by Stripe.

### Epic: Booking Credit Allocation & Auditing
* **Description**: Grants member booking credits on successful subscription invoices and tracks credits via an immutable audit ledger.
* **Core Capabilities**:
  * Automatic credit refills mapping to configured monthly allowances without rollover accumulation.
  * Credit ledger logging refilling, debit bookings, and admin adjustments with audit metadata.
  * Admin dashboards enabling authorized admins to freeze/unfreeze credit availability or adjust balances.
* **System Boundaries**: All ledger updates and credit balance updates are transaction-isolated.

---

## Domain 5: Atomic Bookings & Capacity Management

Controls the high-integrity booking engine, capacity allocation, waitlists, and ticket redemptions.

### Epic: Transactional Ticket Booking
* **Description**: Runs isolated transactions to secure tickets, debit member credits, and decrement event capacities.
* **Core Capabilities**:
  * User-scoped booking idempotency validation via unique transaction keys.
  * Concurrent booking isolation protecting event maximum capacities.
  * Waitlist registration flows for sold-out events without credit debits.
  * Admin booking controls allowing manual override ticket creation.
* **System Boundaries**: Operates as database-isolated transactions.

### Epic: Redemption Protocols
* **Description**: Resolves redemption codes (vouchers, password hashes, external URLs) for member event booking confirmations.
* **Core Capabilities**:
  * Unique code generation, manual entry configurations, and website links storage.
  * Display protection ensuring redemption details do not leak to unauthorized views or past sessions.
* **System Boundaries**: Codes are resolved server-side and returned only on active booking confirmation states.

---

## Domain 6: Live Operations & Management Portals

Provides administrators and venue partners with portals to manage assets, scan check-ins, and export reports.

### Epic: Partner Check-in Portal
* **Description**: Offers physical venue check-in interfaces, scan lookups, and operational CSV export filters.
* **Core Capabilities**:
  * Real-time ticket scan and manual check-in status verification.
  * CSV/Excel data export capabilities filtered by event ranges.
* **System Boundaries**: Restricts views strictly to users with the `PARTNER` role.

### Epic: Admin Control Panels
* **Description**: CRUD interfaces for events, venues, users, and audit logs.
* **Core Capabilities**:
  * Paginated lists with CRUD safety confirmation dialogues.
  * Event/Member search and filter controls.
  * Operational read-model views mapping user booking behavior analytics.
* **System Boundaries**: Restricted strictly to users with the `ADMIN` role.

---

## Domain 7: Cloud Asset Management

Manages upload actions and public delivery of venue and event media assets.

### Epic: Cloud Storage Integration
* **Description**: Integrates S3-compatible endpoints for file uploads.
* **Core Capabilities**:
  * Generation of secure presigned upload URLs.
  * File size validation bounds checks on the server.
  * Database fields linking images to events and venues.
* **System Boundaries**: Actual files reside in Cloudflare R2; image URL references are stored in the database.

---

## Domain 8: Background Jobs & Notifications

Executes asynchronous background processes, partner report emails, and scheduled sync cycles.

### Epic: Scheduled Partner Emails
* **Description**: Asynchronously compiles venue check-in statistics and dispatches scheduled voucher/access codes.
* **Core Capabilities**:
  * Integration with email delivery providers (Resend).
  * Duplicate dispatch prevention logic and database logging.
* **System Boundaries**: Triggered via cron engines or manual admin executions.

### Epic: Cron Workers & Monitoring
* **Description**: Scheduled execution tasks running inside Cloudflare runtime context.
* **Core Capabilities**:
  * Cloudflare Scheduled event handlers.
  * Centralized monitoring logs and failure alerting boundaries.
* **System Boundaries**: Uses separate job configs (`wrangler.jobs.toml`).

---

## Domain 9: Platform Infrastructure & Verification

Hosts the server runtimes, handles database connections, and runs integration regression suites.

### Epic: Server & DB Runtime Config
* **Description**: Adapts DB connections dynamically between local development setups and Cloudflare environments.
* **Core Capabilities**:
  * Local database orchestration via in-memory/disk PGlite.
  * Neon Serverless (WebSocket) vs Neon HTTP connection pools management.
* **System Boundaries**: Dictated by environmental config variables (`DATABASE_URL`, `DATABASE_DRIVER`).

### Epic: Quality Assurance & Parity Verification
* **Description**: Ensures legacy parity remains intact via automated contract, integration, and visual regression suites.
* **Core Capabilities**:
  * Playwright visual snapshot assertions.
  * Transactional tests running on separate mock database schemas.
* **System Boundaries**: Invoked via CLI commands (`bun run test:parity`, `bun run test:visual`).
