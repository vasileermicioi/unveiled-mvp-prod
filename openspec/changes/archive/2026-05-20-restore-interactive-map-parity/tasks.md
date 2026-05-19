## 1. Data And Configuration

- [x] 1.1 Extend discovery display-data mapping so events expose map-ready coordinates, marker labels, selected marker state, and safe fallback metadata.
- [x] 1.2 Add browser-safe map provider configuration handling and validation for the client-side discovery map surface.
- [x] 1.3 Define the fallback state shape for missing coordinates, missing provider config, and provider load failure.

## 2. Shared Map Surface

- [x] 2.1 Implement or refactor the shared interactive discovery map component around a single provider adapter boundary.
- [x] 2.2 Render loading, error, and safe fallback states without blocking the surrounding event list.
- [x] 2.3 Support marker selection handoff so the component emits the selected event and the surface-specific open action target.
- [x] 2.4 Skip unusable events cleanly when coordinates are missing and keep marker labels stable for seeded data.

## 3. Page Integration

- [x] 3.1 Wire the shared map into the public discovery surface and close filters when the map opens.
- [x] 3.2 Wire the shared map into the member discovery surface with the same open behavior and member-specific handoff.
- [x] 3.3 Ensure the surrounding discovery list remains visible and usable when the map is loading or fails.

## 4. Regression Coverage

- [x] 4.1 Add component tests for map open, loading, error, missing-provider, missing-coordinate, and marker-selection states.
- [x] 4.2 Add route smoke coverage for discovery and member discovery map panel visibility, marker labels, and fallback behavior.
- [x] 4.3 Verify seeded event data still renders the expected visible labels and that the list remains usable when the map is unavailable.
