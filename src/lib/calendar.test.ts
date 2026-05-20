import { describe, expect, test } from "bun:test";

import {
  calendarFilename,
  canCreateCalendarFile,
  createIcsContent,
  deriveCalendarEndDate,
  escapeIcsText,
  formatIcsDate,
  isBookingCalendarActionAvailable,
} from "@/lib/calendar";
import type { CalendarEventMetadata } from "@/lib/unveiled-view-models";

describe("calendar ICS utilities", () => {
  test("escapes iCalendar text values", () => {
    expect(escapeIcsText("A, B; C\\D\nE")).toBe("A\\, B\\; C\\\\D\\nE");
  });

  test("formats UTC dates for ICS", () => {
    expect(formatIcsDate(new Date("2026-06-01T18:05:06.000Z"))).toBe(
      "20260601T180506Z",
    );
  });

  test("defaults end time to three hours after start", () => {
    expect(
      deriveCalendarEndDate("2026-06-01T18:00:00.000Z").toISOString(),
    ).toBe("2026-06-01T21:00:00.000Z");
  });

  test("generates complete escaped ICS content", () => {
    const content = createIcsContent(
      {
        ...metadata(),
        title: "Gallery, Night; One",
        description: "Line one\nLine two",
        address: "Auguststrasse 24, Berlin",
      },
      new Date("2026-05-20T12:00:00.000Z"),
    );

    expect(content).toContain("BEGIN:VCALENDAR\r\n");
    expect(content).toContain("DTSTAMP:20260520T120000Z");
    expect(content).toContain("DTSTART:20260601T180000Z");
    expect(content).toContain("DTEND:20260601T210000Z");
    expect(content).toContain("SUMMARY:UNVEILED: Gallery\\, Night\\; One");
    expect(content).toContain(
      "DESCRIPTION:Line one\\nLine two\\n\\nPartner: Kunsthalle",
    );
    expect(content).toContain("LOCATION:Auguststrasse 24\\, Berlin");
    expect(content).toContain("URL;VALUE=URI:https://example.test/event");
    expect(content.endsWith("\r\n")).toBe(true);
  });

  test("generates deterministic safe filenames", () => {
    expect(calendarFilename(" Gallery, Night; One! ")).toBe(
      "unveiled-gallery-night-one.ics",
    );
    expect(calendarFilename("!!!")).toBe("unveiled-event.ics");
  });

  test("guards calendar action availability by booking state and metadata", () => {
    expect(isBookingCalendarActionAvailable("confirmed", metadata())).toBe(
      true,
    );
    expect(isBookingCalendarActionAvailable("waitlist", metadata())).toBe(
      false,
    );
    expect(
      isBookingCalendarActionAvailable("confirmed", {
        ...metadata(),
        startDateTime: "not-a-date",
      }),
    ).toBe(false);
    expect(canCreateCalendarFile(undefined)).toBe(false);
  });
});

function metadata(
  overrides: Partial<CalendarEventMetadata> = {},
): CalendarEventMetadata {
  return {
    eventId: "event-1",
    title: "Gallery Night",
    description: "After hours",
    partnerName: "Kunsthalle",
    address: "Auguststrasse 24",
    startDateTime: "2026-06-01T18:00:00.000Z",
    url: "https://example.test/event",
    ...overrides,
  };
}
