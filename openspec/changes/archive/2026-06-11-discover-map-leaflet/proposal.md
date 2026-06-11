## Why

The current discovery map surface depends on a proprietary map provider that requires a `PUBLIC_` browser-exposed API key and introduces an avoidable vendor lock-in, billing surface, and key-management footprint. Swapping the discover page geolocated map to Leaflet with an open tile provider preserves the legacy-visible bordered panel, custom dark squared brand-yellow-stroked markers, and the click-to-open event popup, while eliminating the proprietary provider configuration from the client bundle. We also need a precise contract for the smooth panning animation that fires when a user clicks an event card in the list, including immediate cancellation when the user starts a manual drag or pointer interaction, so the viewport never fights the user.

## What Changes

- Replace the proprietary map provider used by the discover page geolocated map panel with Leaflet and an open tile provider (CartoDB Voyager or OpenStreetMap).
- Keep the legacy-visible fixed-height bordered panel, the dark squared marker with brand-yellow stroke, and the popup that exposes category, neighborhood, title, formatted time, and a "Book now" / "View event" action.
- Center the map on Berlin by default (coordinates `52.52`, `13.405`).
- Animate the map viewport to the selected event coordinates with a 400ms `easeInOutCubic` transition when an event card is clicked in the list.
- Cancel the active panning animation frame as soon as the user starts a manual drag or pointer interaction on the viewport.
- Remove the requirement to expose a `PUBLIC_` map provider API key on the client, while keeping the safe-fallback behavior when tile loading or the map provider itself is unavailable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ui-system`: The Map Component requirement now mandates Leaflet with an open tile provider, specifies the default Berlin center coordinates, the dark squared marker with brand-yellow stroke, the popup contents, the 400ms `easeInOutCubic` panning animation, and drag/pointer cancellation of the active panning frame.
- `deployment`: The Public Map Provider Configuration requirement is relaxed to "open tile provider configuration" — no `PUBLIC_` proprietary map API key is required, while the safe-fallback, missing-config, and secret-hiding guarantees are preserved.

## Impact

- Discovery page routes and their shared map surface (public + member discovery).
- Shared map component contract and its provider-adapter boundary (Leaflet becomes the underlying renderer).
- Runtime environment configuration: the `PUBLIC_` map provider API key binding can be removed from Cloudflare configuration; the safe-fallback path remains in place.
- Component and route smoke tests for the map panel states, marker styling, panning animation, and cancellation behavior.
