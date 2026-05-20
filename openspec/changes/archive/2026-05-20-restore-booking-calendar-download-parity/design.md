## Context

The legacy booking modal generated an `.ics` file from event data in `_old_app/utils/calendar.ts` and exposed a visible "save the date" action after successful bookings. The migrated booking modal in `src/components/unveiled/visual-system-app.tsx` renders the success card and a calendar-themed panel, but the panel does not yet produce a file. Current event and booking display models expose formatted date labels, but not a calendar-safe payload with the raw event start time needed to generate an `.ics` file.

The source event table has `dateTime`, address, title, description, partner, and ticket metadata. No explicit event end time is available in the current model, so the restored behavior should match legacy parity by deriving a default end time from the start time.

## Goals / Non-Goals

**Goals:**

- Restore a member-visible calendar download after a confirmed booking when the booked event has usable date metadata.
- Keep `.ics` generation framework-native and testable, with pure helpers for content, escaping, date formatting, and filename generation.
- Extend display models with calendar metadata in a way that can support both booking success and existing bookings surfaces.
- Preserve safe redemption behavior for secret-code and voucher success states without carrying stale code or URL data between attempts.
- Add regression coverage for the calendar generation rules and the visible booking success action where the existing test harness can support it.

**Non-Goals:**

- Direct integration with Google Calendar, Outlook APIs, or Apple Calendar APIs.
- Sending calendar invites by email.
- Introducing a new events duration model or database migration.
- Blocking booking or redemption success when calendar metadata is unavailable.

## Decisions

1. Add a shared calendar metadata shape to view models.

   The booking UI should consume a small metadata object with event id, title, description, partner name, address, start date-time ISO string, and optional URL. This keeps the UI from reconstructing raw event data from labels. The mapper can produce this object from `events.dateTime` for event cards and booking cards, and it can omit or null it if the date is invalid.

   Alternative considered: generate the `.ics` file directly from the full event card. That is less explicit and makes it easy to accidentally depend on formatted labels rather than raw date data.

2. Put ICS generation in `src/lib/calendar.ts`.

   The utility should be framework-native and mostly pure: build content, escape iCalendar text, format UTC dates, generate filenames, and provide a small browser download helper. This location keeps the logic independent from the booking component while avoiding a dependency on the legacy app.

   Alternative considered: colocate the utility with `visual-system-app.tsx`. That would reduce imports but would make escaping and filename behavior harder to unit test and reuse from bookings surfaces.

3. Default calendar duration to three hours when no end time exists.

   The legacy utility used a three-hour duration. Keeping that default restores parity without creating a new event duration requirement. If a future explicit end time is added, the metadata shape can grow to include it.

   Alternative considered: all-day events or one-hour default events. Current migrated data does not expose all-day timing mode, and one hour would not match the known legacy behavior.

4. Treat calendar metadata as independent from redemption state.

   The confirmed booking result should continue to return redemption data for the current booking attempt, while calendar metadata comes from the booked event. UI state should reset the previous result before or during each submission so a failed or later waitlist outcome cannot display a stale code, URL, or calendar action.

   Alternative considered: persist the calendar payload inside the transaction result. That couples a UI affordance to transaction persistence and is unnecessary when the event display model already owns event metadata.

5. Hide or disable the action when metadata is incomplete.

   If the UI cannot build a valid calendar file, the success state should still render booking or waitlist information and redemption content. Hiding the action is preferred for incomplete event date metadata; disabling is acceptable if a stable layout requires it.

## Risks / Trade-offs

- Event duration is approximate -> Use the legacy three-hour default and keep the helper isolated so duration can be replaced later without touching the success UI.
- Browser download behavior is hard to assert in DOM tests -> Unit test generated content and filename rules, then assert the success affordance and click wiring at the component or smoke-test level where feasible.
- ICS text escaping can be subtly incompatible -> Cover commas, semicolons, backslashes, and newlines with unit tests and emit CRLF-separated lines.
- Invalid or missing metadata could regress booking success -> Build the UI so the calendar action is optional and never blocks redemption or waitlist rendering.
- Stale redemption data can appear after multiple attempts in the same modal -> Reset result state around submissions and derive calendar availability from the selected event rather than prior transaction data.
