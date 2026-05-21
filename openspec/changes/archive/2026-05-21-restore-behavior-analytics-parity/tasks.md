## 1. Tracking Actions & Database Updates

- [x] 1.1 Implement tracking helper functions in `src/lib/behavior-tracking.ts` to execute atomic DB increments and updates for event opens, filter applies, and session/last seen tracking.
- [x] 1.2 Implement Astro Server Actions (`trackEventOpen`, `trackFilterApply`) to process client-side behavior tracking calls for authenticated users.
- [x] 1.3 Update existing member actions (saves, unsaves, bookings, waitlists) to increment their respective behavior counters upon successful transaction commits.
- [x] 1.4 Wire a session tracking check during member authentication/layout shell initialization that increments `sessionCount` and updates `lastSeenAt` (throttled to once per 15 minutes).

## 2. UI Wiring & Client Triggers

- [x] 2.1 Wire the client-side event detail/booking modal trigger to asynchronously call the `trackEventOpen` action.
- [x] 2.2 Wire client-side discovery filter changes to trigger the `trackFilterApply` action (with a debouncing utility of 1000ms).
- [x] 2.3 Wire the admin member management view to display member behavior analytics metrics (sessionCount, eventOpenCount, bookingCount, waitlistCount, savedCount, unsavedCount, filterApplyCount, and recentEventIds).

## 3. Integration Tests & Verification

- [x] 3.1 Implement integration tests in `src/lib/behavior-tracking.integration.test.ts` to verify tracking increments, array caps, and throttled session counts.
- [x] 3.2 Verify that tracking acts as a safe no-op for guest/unauthenticated users.
- [x] 3.3 Run the full contract regression suite and verify that all tests pass without errors.
