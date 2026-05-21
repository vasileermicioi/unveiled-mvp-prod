## Context

Legacy physical QR codes at partner venues were printed using query parameters on the root URL: `/?venuePartner=PARTNER_ID&venueToken=TOKEN`. In the migrated Astro app, check-ins are handled at the `/venue-check-in/[partnerId]?token=TOKEN` route. Currently, scanning an old QR code loads the homepage and does not trigger check-in or redirect.

## Goals / Non-Goals

**Goals:**
- Detect `venuePartner` and `venueToken` query parameters on root page loads.
- Redirect users to `/venue-check-in/[partnerId]?token=[venueToken]` to trigger check-ins.
- Ensure the redirection works for both authenticated and guest users.

**Non-Goals:**
- Handling direct database writes or checks on the homepage loader.

## Decisions

### 1. Server-Side Redirect in `src/pages/index.astro`
- **Choice:** Extract search parameters and perform a server-side redirect using `Astro.redirect()` within `src/pages/index.astro`.
- **Rationale:** Server-side redirection is faster and cleaner than executing a client-side `window.location` redirect in React code, preventing page flash and saving CPU cycles.
- **Alternatives Considered:**
  - *Client-side React useEffect checking search parameters:* This would result in rendering the index page and then running a script to redirect the page, causing a visual flash and unnecessary data loading.
  - *Astro Middleware redirection:* Middleware would parse all requests to `/`, but redirect logic is simple enough to reside directly in the index page script.

## Risks / Trade-offs

- **Risk:** Stale check-in page cache.
  - **Mitigation:** Redirection triggers a standard browser navigation redirect, which bypasses cache or includes correct header controls.
