## 1. Renderer Swap

- [x] 1.1 Replace the proprietary map provider adapter with Leaflet inside the shared discovery map component.
- [x] 1.2 Configure the open tile layer (CartoDB Voyager or OpenStreetMap) via a non-secret, browser-safe configuration value, falling back to a documented default.
- [x] 1.3 Default-center the map on Berlin (`52.52`, `13.405`) with the documented default zoom.
- [x] 1.4 Render event markers as a custom dark squared shape with a brand-yellow stroke and keep marker labels stable for seeded data.

## 2. Popup And Action Handoff

- [x] 2.1 Open a popup on marker click showing category, neighborhood, title, formatted time, and a "Book now" or "View event" action button.
- [x] 2.2 Emit the existing open-event target from the popup action so the page can route to the event details view or booking modal.

## 3. Panning Animation

- [x] 3.1 On event card click in the list, animate the viewport to the selected marker coordinates over `400ms` using an `easeInOutCubic` curve.
- [x] 3.2 Cancel the active panning animation frame on the first user drag or pointer interaction (`mousedown` / `touchstart` / wheel) on the map surface.
- [x] 3.3 Do not re-trigger the panning animation until a new event card is clicked.

## 4. Deployment Configuration

- [x] 4.1 Make the `PUBLIC_` map provider API key binding optional in Cloudflare configuration.
- [x] 4.2 Keep the missing-config and safe-fallback behavior for when the tile source is unreachable.
- [x] 4.3 Confirm logs, build output, client bundles, and health responses never include any map provider secret.

## 5. Verification

- [x] 5.1 Add component tests for: tile load, default Berlin center, marker render, popup contents, panning animation start, and drag/pointer cancellation.
- [x] 5.2 Add route smoke coverage for the discover map panel still rendering its bordered panel and popup on seeded data.
- [x] 5.3 Verify no `PUBLIC_` map API key is required for local preview or production builds.
