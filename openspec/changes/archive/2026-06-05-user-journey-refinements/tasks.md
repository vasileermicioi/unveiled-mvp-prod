## 1. Public Discovery & Map UX Refinements

- [x] 1.1 Update `DiscoveryMapPanel` in `src/components/unveiled/discovery-map.tsx` to wrap the fallback loading/error `StatePanel` in the same outer `Panel` and a `div` with `min-h-[26rem]` (and appropriate inner styling) to prevent layout shifts.
- [x] 1.2 Implement the smooth pan-to-marker coordinate interpolation inside `DiscoveryMapPanel` using `requestAnimationFrame` with easing.
- [x] 1.3 Add `selectedMarkerIdOverride` prop to `DiscoveryMapPanel` inside `PublicDiscover` in `src/components/unveiled/visual-system-app.tsx`.
- [x] 1.4 Add `onClick` prop to `EventCard` and implement it on the card wrapper in `src/components/unveiled/visual-system-app.tsx` to open the map and select the card's marker. Stop propagation on existing button clicks.

## 2. Member Subscription Checkout Refinements

- [x] 2.1 Add translation keys `cardDetails`, `sepaDetails`, `billingSync` to DE and EN translations in `src/lib/i18n.ts`.
- [x] 2.2 Refactor Stripe Card Elements rendering in `src/components/unveiled/visual-system-app.tsx` to use structured, high-fidelity payment container grids with mock brand tags and a billing address sync checkbox.
- [x] 2.3 Refactor Stripe SEPA Elements rendering in `src/components/unveiled/visual-system-app.tsx` to use structured, high-fidelity payment container grids with mock brand tags and a billing address sync checkbox.

## 3. Venue QR Code Check-in Feedback

- [x] 3.1 Redesign `src/pages/[lang]/venue-check-in/[partnerId].astro` to render large, high-visibility green checkmark screen on validation success, yellow warning screen on already checked in, and red cross screen on check-in failure.

## 4. Verification & Testing

- [x] 4.1 Run the verification test suite to ensure all parity and unit tests pass.
