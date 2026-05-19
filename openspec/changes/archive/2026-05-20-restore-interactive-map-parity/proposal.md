## Why

The migrated app already shows discovery content, but it does not yet match the legacy interactive map flow: users cannot rely on the same map-open behavior, marker selection handoff, or safe loading and error states when provider configuration is missing. Restoring that behavior closes a visible parity gap on discovery surfaces for both public and member flows.

## What Changes

- Add a shared interactive discovery map surface for public and member discovery.
- Close the filter panel when the map opens and keep the event list usable.
- Render markers from live event location data when available, with safe fallbacks when not.
- Allow marker selection to surface event details and open the event details view or booking modal.
- Add visible loading, provider-missing, and provider-error states that preserve list usability.
- Introduce deployment-safe map provider configuration handling so browser code can read only approved values.
- Add regression coverage for map panel states, marker labels, and map-driven event opening.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pages`: discovery pages gain interactive map panel behavior and filter/map coordination.
- `display-data`: discovery display data gains marker, selection, loading, and fallback state fields for the map surface.
- `ui-system`: the map component contract expands to support interactive selection, contextual actions, and safe visible fallback states.
- `deployment`: runtime configuration must safely expose only public map provider values while keeping secrets out of browser and server-visible output.

## Impact

- Discovery page routes and their shared shell behavior.
- Event display-data mapping for coordinates, labels, selection, and fallback states.
- Map UI component contracts and marker interaction patterns.
- Runtime environment configuration for map provider keys and safe client exposure.
- Route smoke and component test coverage for discovery map behavior.
