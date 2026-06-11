## Context

The current discover page geolocated map is rendered through a proprietary map provider that requires a `PUBLIC_` browser-exposed API key. That dependency brings vendor lock-in, a per-load billing surface, and an extra piece of secret-style configuration to manage in Cloudflare. The legacy-visible map panel is the only required user-facing surface; the rendering engine and the proprietary provider itself are not.

We also need a precise contract for the panning animation that fires when an event card is clicked in the list. Today the "pan to selected marker" behavior is mentioned in passing, but the duration, easing, and cancellation rules are not specified, which makes it easy for the viewport to keep animating after the user has started dragging.

## Goals / Non-Goals

**Goals:**
- Render the discover page map with Leaflet and an open tile provider (CartoDB Voyager or OpenStreetMap).
- Preserve the legacy-visible bordered fixed-height panel, the dark squared brand-yellow-stroked marker, and the popup contents (category, neighborhood, title, formatted time, action button).
- Default-center the map on Berlin (`52.52`, `13.405`).
- Animate the viewport to selected event coordinates over 400ms with an `easeInOutCubic` curve when an event card is clicked.
- Cancel the active panning animation frame as soon as the user starts a manual drag or pointer interaction on the viewport.
- Drop the `PUBLIC_` map provider API key requirement while keeping the safe-fallback, missing-config, and secret-hiding guarantees.

**Non-Goals:**
- Reworking the discovery list, filter, or pagination behavior.
- Adding clustering, custom tile styling, geolocation, or routing on top of the map.
- Rewriting the rest of the legacy map surface (loading, error, fallback states) — they remain in the `ui-system` Map Component requirement.
- Touching admin, partner, or venue check-in surfaces.

## Decisions

### 1. Leaflet with open tile provider
The shared map component will mount Leaflet in the browser and load tiles from an open tile provider. We will not introduce a `PUBLIC_` map API key binding. The default tile source is configurable per environment via a non-secret, browser-safe configuration value (or a documented default), and the safe-fallback path still applies when the tile source is unreachable.

### 2. Default center on Berlin
The map initial viewport is `setView([52.52, 13.405], <default zoom>)` so the discover page opens on Berlin without needing live geolocation.

### 3. Custom marker and popup
Markers are rendered as a custom dark squared shape with a brand-yellow stroke (matching the Unveiled brand tokens). Popups, anchored to the marker, show category, neighborhood, title, formatted time, and a "Book now" or "View event" action button that emits the existing open-event target.

### 4. Panning animation
Clicking an event card in the list triggers a single pan animation:
- Duration: `400ms`
- Easing: `easeInOutCubic`
- Target: the selected marker's coordinates
We will use Leaflet's animation primitive (or a small `requestAnimationFrame` loop) so the curve is consistent and cancellable.

### 5. Drag/pointer cancellation
The active panning frame is cancelled on the first user-initiated drag or pointer interaction on the viewport (mousedown / touchstart / wheel on the map surface). After cancellation, the map defers to the user's interaction and does not re-trigger the animation until a new event card is clicked.

## Risks / Trade-offs

- **[Risk]** Open tile providers have rate limits and may throttle under load.
  - **Mitigation** The safe-fallback panel already exists in the `ui-system` Map Component requirement and is reused when tile loading fails. We document the chosen provider in deployment notes.
- **[Risk]** Removing the `PUBLIC_` map key binding is a small breaking change for any local environment that relied on it.
  - **Mitigation** The `PUBLIC_` map provider configuration value becomes optional; the safe-fallback path is unchanged.
- **[Risk]** A long panning animation could fight the user.
  - **Mitigation** Drag/pointer cancellation is part of the spec; we cover it with a component test.
