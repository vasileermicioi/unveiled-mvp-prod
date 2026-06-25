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

---

## 5. Design system boundary

The Unveiled design system is the **single source of UI**. It lives in
`@unveiled/design-system` (`packages/design-system/`) and is organised by
atomic-design layer. The model under `architecture/` declares it as a
first-party container inside the `unveiled` system, peer to `App` and
`Landing`. This section is the long-form narrative for the layer
hierarchy, the presentational / container split, the CSS ownership rule,
the Ladle demo obligation, and the gate-script enforcement. The
testable contract is in
[`openspec/specs/design-system-package/spec.md`](../openspec/specs/design-system-package/spec.md).

### 5.1 Layer hierarchy

The design system source tree is organised by atomic-design layer. The
import direction is strictly downward — atoms may not import from
molecules / organisms / layouts / pages, and so on.

- **Atoms** — smallest indivisible UI primitives (Button, Badge, Card,
  Divider, Panel, TextInput, TextArea, Tabs, SafeImage, SelectItem,
  Table primitive). May import from `@nextui-org/react` / `@heroui/*`
  and from `./lib/*` only. May NOT import from any other layer.
- **Molecules** — compositions of atoms (Field, StatePanel, StatPanel,
  SelectInput, Toast, Drawer, Modal, Menu). May import from `atoms/`,
  `lib/`. May NOT import from `@nextui-org/react` directly; if a
  molecule needs a HeroUI primitive that no atom exposes, the molecule
  grows a new atom first.
- **Organisms** — domain-shaped compositions of atoms + molecules
  (AppShell, LoginForm, PublicDiscover, AdminPanel, BookingModal, etc.).
  May import from `atoms/`, `molecules/`, `lib/`, and other organisms
  in the same domain. May NOT import from `@nextui-org/react` or from
  sibling organisms in a different domain (cross-domain pieces live
  under `organisms/_shared/`).
- **Layouts** — layout shells (AppLayout, LandingLayout). Compose
  organisms. May NOT import from HeroUI or from `./pages/`.
- **Pages (Ladle-only)** — demo pages that mount layouts with mock
  organisms and mock data. Not used in production; import-isolated from
  app / landing / design-system barrel by a permanent unit test.

The rule is enforced by the `check-atomic-layers` gate script
(`bun run --filter @unveiled/design-system check:atomic-layers`),
wired into `bun run check`.

### 5.2 Presentational / container split

Organisms in the design system are **presentational** — they take their
data via props and expose callbacks. Data hooks (`useQuery`,
`useMutation`, `useEffect`, `fetch`, `authClient`, server actions,
Stripe calls, etc.) stay in the `app/` and `landing/` **containers**
(`packages/app/src/containers/`,
`packages/landing/src/components/landing/`). Containers import the
presentational piece from the design system and re-export it under the
original component name so every existing call site continues to
compile. The presentational piece exports its props type from
`<organism>.types.ts`; the container imports the same type so the
type-checker catches prop-surface drift between the two halves.

The split keeps the design system free of data-layer dependencies, which
in turn keeps the Ladle stories pure (no server spin-up is required to
view them) and keeps the LikeC4 model honest (the design-system
container has no edges to Stripe, Better Auth, or the database).

### 5.3 CSS ownership

Every CSS rule lives in
[`packages/design-system/src/styles/global.css`](../packages/design-system/src/styles/global.css).
The file imports the generated tokens (`tokens.css`) and the Tailwind
v4 theme (`tailwind-theme.css`), then declares the semantic classes used
by app / landing (`unveiled-page-shell`, `unveiled-card-stack`,
`unveiled-hero-section`, etc.). `app/` and `landing/` each have a
one-line `global.css` that re-imports the design-system global CSS; they
do not declare any rules of their own. Raw Tailwind utility classes
(`grid`, `flex`, `gap-*`, `bg-*`, `text-*`, `p-*`, `m-*`, etc.) are
forbidden in `packages/app/src/**` and `packages/landing/src/**`
outside the design-system semantic classes. The rule is enforced by the
`check:styling-ownership` gate script (`bun run check:styling-ownership`),
wired into `bun run check`.

The atom-chrome CSS (visual chrome applied to HeroUI primitives in the
atoms layer — the `unveiled-text-input-wrapper` 4px solid border, the
table header colour, the selected-tab shadow, etc.) lives in
`packages/design-system/src/styles/atom-chrome.css` and is re-imported
by every atom that uses the chrome classes. The rules are concrete
values, not Tailwind utilities, and use `!important` on visual
properties so they reliably override HeroUI's defaults regardless of
cascade order.

### 5.4 Demo obligation

Every page surface has a demo page under
[`packages/design-system/src/pages/`](../packages/design-system/src/pages/).
The demo is a Ladle story that mounts the layout (`AppLayout` or
`LandingLayout`) with the relevant organism(s) and a mock fixture
(`<organism>.mock.ts`); no server spin-up is required to view it. Pages
are import-isolated from production by the permanent unit test
`tests/unit/design-system-pages.test.ts`; the pages folder exists only
as Ladle stories and is not re-exported from the design-system barrel.

The Ladle coverage script (`bun run ladle:coverage`) asserts that every
`@ladle(component=…, story=…)` gherkin tag has a matching story and
every story is referenced or opted out. A new UI change in `app/` or
`landing/` that does not land a Ladle story fails the definition of
done (see [`AGENTS.md` §8](../AGENTS.md#8-definition-of-done)).

### 5.5 Enforcement

The design-system boundary is enforced by four gate scripts, all wired
into `bun run check`:

- `bun run --filter @unveiled/design-system check:atomic-layers` —
  enforces the layer hierarchy and the import-direction rule. Walks
  every file under `packages/design-system/src/**` and asserts the
  import allow-list per layer; fails with the offending file path.
- `bun run check:styling-ownership` — enforces the CSS ownership rule.
  Walks every file under `packages/app/src/**` and
  `packages/landing/src/**` and asserts that no raw Tailwind utility
  class is used outside the design-system semantic classes imported via
  `@unveiled/design-system/styles/global.css`.
- `bun run ladle:coverage` — enforces the demo obligation. Asserts that
  every `@ladle(component=…, story=…)` gherkin tag has a matching story
  and every story is referenced or opted out.
- `bun run heroui-design-system-replica:check` — enforces the
  Ladle-only invariant on `packages/design-system/src/heroui-replica/`.
  The replica is Ladle-only; no production file may import it.

In addition, the permanent unit test
`tests/unit/design-system-hero-ui-boundary.test.ts` (part of
`bun run test:unit`, therefore `bun run check`) asserts that no file
outside `packages/design-system/src/**` imports `@nextui-org/*` or
`@heroui/*`. See [`AGENTS.md` §9](../AGENTS.md#9-what-not-to-do) for
the full "what NOT to do" list.
