## Why

The migrated booking success flow no longer exposes the legacy "save the date" `.ics` calendar download after a member books an event. Restoring this parity keeps successful booking outcomes actionable while preserving the current redemption-state behavior.

## What Changes

- Add calendar-ready event metadata to the successful booking display model when valid event date, time, and venue data are available.
- Add a framework-native `.ics` generation utility that safely escapes calendar text fields and produces stable filenames.
- Restore a member-visible "save the date" affordance in the booking success state that downloads an `.ics` file.
- Hide or disable the calendar affordance when usable date metadata is unavailable without blocking booking or redemption display.
- Ensure secret-code and voucher success states do not leak stale redemption data while presenting the calendar action for the booked event.
- Add focused tests for ICS escaping, date formatting, filename generation, and the booking success calendar action where feasible.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `booking-transactions`: Successful booking results include sufficient event calendar metadata for the UI when available.
- `display-data`: Booking success display models expose calendar metadata without stale redemption data across secret-code and voucher outcomes.
- `forms-actions`: The booking success action set includes a safe `.ics` calendar download affordance when metadata is available.
- `pages`: Member-facing booking success pages or modal states render the calendar download affordance only when the booking event can produce a usable calendar file.

## Impact

- Affected code includes `_old_app/components/BookingModal.tsx`, `_old_app/utils/calendar.ts`, `src/components/unveiled/visual-system-app.tsx`, `src/lib/data-access/mappers.ts`, and `src/lib/booking-transactions.ts`.
- Affected specs include `booking-transactions`, `display-data`, `forms-actions`, and `pages`.
- Testing impact includes unit coverage for calendar generation and focused UI or smoke assertions for the booking success calendar action where the existing seeded booking flow supports it.
- No third-party calendar API integrations, email invite delivery, or direct Google Calendar, Outlook, or Apple Calendar API dependencies are introduced.
