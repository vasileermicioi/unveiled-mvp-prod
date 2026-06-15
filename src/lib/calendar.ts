import type { CalendarEventMetadata } from "@/lib/unveiled-view-models";

const DEFAULT_EVENT_DURATION_MS = 3 * 60 * 60 * 1000;

export type CalendarFileInput = CalendarEventMetadata & {
  endDateTime?: string;
};

export function formatIcsDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Cannot format invalid calendar date.");
  }
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function deriveCalendarEndDate(
  startDateTime: string,
  endDateTime?: string,
) {
  const start = new Date(startDateTime);
  if (Number.isNaN(start.getTime())) {
    throw new Error("Cannot derive end date from invalid start date.");
  }

  if (endDateTime) {
    const end = new Date(endDateTime);
    if (!Number.isNaN(end.getTime()) && end.getTime() > start.getTime()) {
      return end;
    }
  }

  return new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
}

export function calendarFilename(title: string) {
  const slug =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "event";

  return `unveiled-${slug}.ics`;
}

export function canCreateCalendarFile(
  metadata: CalendarEventMetadata | null | undefined,
) {
  if (!metadata) return false;
  if (
    !metadata.eventId.trim() ||
    !metadata.title.trim() ||
    !metadata.address.trim() ||
    !metadata.startDateTime.trim()
  ) {
    return false;
  }

  return !Number.isNaN(new Date(metadata.startDateTime).getTime());
}

export function isBookingCalendarActionAvailable(
  bookingState: "confirmed" | "waitlist" | "failure" | null | undefined,
  metadata: CalendarEventMetadata | null | undefined,
) {
  return bookingState === "confirmed" && canCreateCalendarFile(metadata);
}

export function createIcsContent(input: CalendarFileInput, now = new Date()) {
  if (!canCreateCalendarFile(input)) {
    throw new Error("Calendar metadata is incomplete.");
  }

  const start = new Date(input.startDateTime);
  const end = deriveCalendarEndDate(input.startDateTime, input.endDateTime);
  const description = [
    input.description,
    input.partnerName ? `Partner: ${input.partnerName}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Unveiled//Culture App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(input.eventId)}@unveiled.berlin`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(`UNVEILED: ${input.title}`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(input.address)}`,
    input.url ? `URL;VALUE=URI:${input.url}` : null,
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => Boolean(line));

  return `${lines.join("\r\n")}\r\n`;
}

export function downloadCalendarFile(metadata: CalendarEventMetadata) {
  const content = createIcsContent(metadata);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = calendarFilename(metadata.title);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export type CalendarFileObjectUrl = {
  href: string;
  filename: string;
};

export function createIcsObjectUrl(
  metadata: CalendarEventMetadata,
): CalendarFileObjectUrl {
  const content = createIcsContent(metadata);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  return {
    href: window.URL.createObjectURL(blob),
    filename: calendarFilename(metadata.title),
  };
}
