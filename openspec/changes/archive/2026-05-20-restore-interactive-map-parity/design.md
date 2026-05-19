## Context

The legacy app exposes an interactive Google Maps event map with marker selection, loading and error states, and a visible handoff into event details or booking flow. The migrated app currently has discovery UI and some map-adjacent labels, but it does not yet reproduce the interactive map surface or its safe fallback behavior.

This change spans page coordination, shared display-data shaping, UI component behavior, and runtime configuration. That makes it cross-cutting enough to justify an explicit design before implementation.

## Goals / Non-Goals

**Goals:**

- Restore the discovery map experience on public and member routes.
- Keep discovery usable when the map is loading, misconfigured, or cannot render.
- Reuse one shared map implementation across public and member discovery surfaces.
- Keep map provider credentials browser-safe and avoid leaking secrets in server-visible output.
- Support marker selection that hands off to the correct event-open action for the surface.

**Non-Goals:**

- Rebuilding geocoding or coordinate enrichment infrastructure.
- Recreating Firebase or the exact legacy implementation details.
- Pixel-perfect Google Maps tile styling beyond visible parity.
- Changing unrelated discovery, booking, or admin data models.

## Decisions

### Use a shared browser-only map adapter

Implement the interactive map as a shared client-side component that accepts a small adapter boundary for the provider. Keep the first implementation on Google Maps because the legacy behavior, marker semantics, and info-window style are already aligned with that provider.

Alternatives considered:

- A lighter provider such as Mapbox or Leaflet. Rejected for this change because it would increase the visible parity gap and require more UI re-tuning for marker and info-window behavior.
- A server-rendered static map snapshot. Rejected because it cannot support the marker selection and open-event handoff needed for parity.

### Share the same map surface between public and member discovery

Use one map component with a surface-specific action callback. The public route can open the event details or booking modal, while the member route can open the member-visible event path. The component should not own route logic; it should only emit the selected event and surface state.

Alternatives considered:

- Separate public and member map components. Rejected because it would duplicate loading, error, and selection logic with little functional benefit.
- Embedding navigation logic directly in the map component. Rejected because it would make the component harder to reuse and test.

### Treat missing coordinates as a safe omission

If an event lacks usable coordinates, do not create a broken marker. The event remains visible in the list and detail cards, but the map surface skips the marker and can show a neutral state if all events lack map-ready coordinates.

Alternatives considered:

- Deriving coordinates from addresses in this change. Rejected because it introduces geocoding complexity and new failure modes outside the scope of parity restoration.
- Hiding the event entirely. Rejected because the list must remain usable even when map data is incomplete.

### Keep provider configuration browser-safe

Expose only `PUBLIC_` map provider values or another explicitly browser-safe config path to the client. The browser component reads those values directly and the server never logs or serializes secret provider credentials into the page payload.

Alternatives considered:

- Reading a server-only secret at render time. Rejected because the client needs the value and the change must avoid leaking secrets.
- Baking the provider key into build output. Rejected because it makes rotation harder and increases the chance of accidental exposure.

## Risks / Trade-offs

- [Risk] Map provider loading or quota issues could still block the map surface. -> Mitigation: always render the list and a safe visible fallback, and keep retry/dismiss behavior explicit.
- [Risk] Event coordinate coverage may be incomplete for some rows. -> Mitigation: omit broken markers, preserve list rendering, and treat missing coordinates as a supported state.
- [Risk] Public and member flows may diverge over time if the surface callback contract is not kept small. -> Mitigation: keep the map component presentation-only and route-specific behavior in the page layer.
- [Risk] Google Maps may be heavier than a lighter provider. -> Mitigation: confine the provider to one adapter so a future swap is localized if product direction changes.

## Migration Plan

1. Add the shared map adapter and wire it into discovery and member discovery surfaces behind existing map entry points.
2. Shape display data so event coordinates, labels, and selected marker state are available before the map renders.
3. Add browser-safe provider configuration and safe fallback rendering for missing or failed provider loads.
4. Add route/component regression coverage for map open, marker select, loading, error, and missing-coordinate states.
5. Roll out with the existing list view intact so the map can fail safely without blocking discovery.

Rollback strategy:

- Remove the discovery map entry point wiring and leave the list view behavior untouched.
- Revert the provider configuration path if credentials exposure or load reliability becomes a concern.

## Open Questions

- What exact public browser-safe environment variable name should be standardized for the provider key?
- Do public and member discovery open the same event detail surface, or do they need different primary actions at the page layer?
- What percentage of existing event rows already have usable coordinates, and does the seeded test data cover enough map-ready events?
