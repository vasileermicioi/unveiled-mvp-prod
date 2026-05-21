## Why

Legacy physical QR codes at partner venues were printed using query parameters on the root URL: `/?venuePartner=PARTNER_ID&venueToken=TOKEN`. In the migrated Astro app, check-ins are handled at the `/venue-check-in/[partnerId]?token=TOKEN` route. Currently, scanning an old QR code loads the homepage and does not trigger check-in or redirect, breaking functionality for active members at venues.

## What Changes

- Add a check for `venuePartner` and `venueToken` query parameters on the root page (`src/pages/index.astro`) or via middleware (`src/middleware.ts`).
- If both parameters are present:
  - Perform a server-side redirect (HTTP 302) to `/venue-check-in/[venuePartner]?token=[venueToken]`.
  - This redirects both authenticated and guest users to the check-in landing page, which automatically asks them to log in/sign up if needed.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `pages`: Support legacy query-parameter-based venue check-in routes through automatic server-side redirection.

## Impact

- `src/pages/index.astro` (or `src/middleware.ts`): Implement query parameter check and redirect logic.
