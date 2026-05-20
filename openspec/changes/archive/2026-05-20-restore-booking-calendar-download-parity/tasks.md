## 1. Calendar Data Model

- [x] 1.1 Add a shared calendar metadata type to the member view-model layer with event id, title, description, partner name, address, start date-time, and optional URL fields.
- [x] 1.2 Extend event card display mapping to populate calendar metadata from raw event date and venue fields when valid.
- [x] 1.3 Extend confirmed booking card display mapping to expose the booked event calendar metadata without deriving it from formatted labels.
- [x] 1.4 Ensure display mappers omit or mark calendar metadata unavailable when required event date fields are invalid or missing.

## 2. ICS Utility

- [x] 2.1 Create `src/lib/calendar.ts` with pure helpers for iCalendar text escaping, UTC date formatting, derived end-time calculation, ICS content generation, and stable `.ics` filename generation.
- [x] 2.2 Add a browser download helper that creates a `text/calendar;charset=utf-8` blob, triggers the download, and revokes the object URL after use.
- [x] 2.3 Match legacy parity by defaulting the calendar event end time to three hours after the start time when no explicit end time exists.

## 3. Booking Success UI

- [x] 3.1 Update the migrated booking modal success state to call the new calendar download helper from the visible "save the date" affordance.
- [x] 3.2 Hide or disable the calendar action when calendar metadata is unavailable while preserving redemption and return-to-feed UI.
- [x] 3.3 Reset booking result state around submissions so failed, waitlist, voucher, and secret-code outcomes cannot reuse stale redemption data or stale calendar state.
- [x] 3.4 Verify voucher and secret-code success states render current redemption data while the calendar action uses only event calendar metadata.

## 4. Regression Coverage

- [x] 4.1 Add unit tests for ICS escaping of commas, semicolons, backslashes, and newlines.
- [x] 4.2 Add unit tests for UTC date formatting, derived end time, generated ICS fields, and deterministic safe filenames.
- [x] 4.3 Add display-model tests for calendar metadata presence and safe omission when date metadata is unusable.
- [x] 4.4 Add component, DOM, or parity smoke coverage asserting the booking success calendar affordance appears after a seeded confirmed booking where feasible.
- [x] 4.5 Add or update regression coverage proving waitlist or failed outcomes do not show stale redemption data or a stale calendar action after prior success.

## 5. Verification

- [x] 5.1 Run the focused calendar, mapper, and booking UI tests.
- [x] 5.2 Run the repository check command used for this app and address any type, lint, or formatting failures.
- [x] 5.3 Run the relevant parity smoke test when available, or document why browser download verification is covered by unit and DOM assertions instead.
