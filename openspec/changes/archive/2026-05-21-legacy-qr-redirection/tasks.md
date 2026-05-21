## 1. Redirection Implementation

- [x] 1.1 Update `src/pages/index.astro` to detect `venuePartner` and `venueToken` query parameters.
- [x] 1.2 Perform server-side redirect `Astro.redirect` to `/venue-check-in/[partnerId]?token=[token]` if parameters are present.

## 2. Verification and Tests

- [x] 2.1 Add automated test coverage to verify root redirection with parameters.
- [x] 2.2 Manually verify redirection on localhost dev environment.
