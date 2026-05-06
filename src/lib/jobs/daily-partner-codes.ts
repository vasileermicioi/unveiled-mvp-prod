import { and, eq, gte, isNotNull, lt } from "drizzle-orm";

import { type Db, db } from "@/db/client";
import { bookings, events, jobSendLogs, partners } from "@/db/schema";
import { getJobsConfig, type JobsConfig } from "@/lib/jobs/config";
import {
  type EmailFetch,
  type ResendEmailResult,
  sendResendEmail,
} from "@/lib/jobs/resend-client";

export const DAILY_PARTNER_CODES_JOB = "daily-partner-codes";
const BERLIN_TIME_ZONE = "Europe/Berlin";

export type PartnerCodeWindow = {
  start: Date;
  end: Date;
  label: string;
};

export type PartnerCodeRow = {
  partnerId: string;
  partnerName: string;
  contactEmail: string | null;
  eventId: string;
  eventTitle: string;
  eventDateTime: Date;
  eventAddress: string;
  bookingId: string;
  userId: string;
  ticketsCount: number;
  redemptionInfo: string | null;
};

export type PartnerCodePayload = {
  partnerId: string;
  partnerName: string;
  contactEmail: string;
  events: Array<{
    eventId: string;
    title: string;
    dateTime: string;
    address: string;
    codes: Array<{
      code: string;
      bookingId: string;
      userId: string;
      ticketsCount: number;
    }>;
  }>;
};

export type PartnerSkip = {
  partnerId: string;
  partnerName: string;
  reason: "missing_contact_email" | "missing_redemption_info";
};

export type PartnerCodeBuildResult = {
  payloads: PartnerCodePayload[];
  skips: PartnerSkip[];
};

export type JobSendClaim =
  | { claimed: true; logId: string }
  | { claimed: false; logId: null };

export type PartnerCodeRepository = {
  fetchPartnerCodeRows(window: PartnerCodeWindow): Promise<PartnerCodeRow[]>;
  claimPartnerWindow(input: {
    jobName: string;
    partnerId: string;
    window: PartnerCodeWindow;
    details?: Record<string, unknown>;
  }): Promise<JobSendClaim>;
  markSent(input: {
    logId: string;
    providerMessageId: string | null;
    details?: Record<string, unknown>;
  }): Promise<void>;
  markFailed(input: {
    logId: string;
    safeError: string;
    details?: Record<string, unknown>;
  }): Promise<void>;
  markSkipped(input: {
    logId: string;
    details?: Record<string, unknown>;
  }): Promise<void>;
};

export type DailyPartnerCodeJobResult = {
  jobName: typeof DAILY_PARTNER_CODES_JOB;
  window: {
    start: string;
    end: string;
    label: string;
  };
  status: "skipped" | "completed";
  sent: number;
  failed: number;
  skipped: number;
  duplicates: number;
  details: Array<Record<string, unknown>>;
};

type BerlinParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function newId() {
  return crypto.randomUUID();
}

function getBerlinParts(date: Date): BerlinParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BERLIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.get("year")),
    month: Number(values.get("month")),
    day: Number(values.get("day")),
    hour: Number(values.get("hour")),
    minute: Number(values.get("minute")),
    second: Number(values.get("second")),
  };
}

function timeZoneOffsetMs(date: Date) {
  const parts = getBerlinParts(date);
  const berlinAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return berlinAsUtc - date.getTime();
}

function berlinLocalDateToUtc(year: number, month: number, day: number) {
  const localAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
  let utc = localAsUtc - timeZoneOffsetMs(new Date(localAsUtc));
  utc = localAsUtc - timeZoneOffsetMs(new Date(utc));
  return new Date(utc);
}

function addUtcDays(year: number, month: number, day: number, days: number) {
  const value = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

export function getNextBerlinDayWindow(now = new Date()): PartnerCodeWindow {
  const current = getBerlinParts(now);
  const nextDay = addUtcDays(current.year, current.month, current.day, 1);
  const followingDay = addUtcDays(nextDay.year, nextDay.month, nextDay.day, 1);
  const label = `${String(nextDay.year).padStart(4, "0")}-${String(
    nextDay.month,
  ).padStart(2, "0")}-${String(nextDay.day).padStart(2, "0")}`;

  return {
    start: berlinLocalDateToUtc(nextDay.year, nextDay.month, nextDay.day),
    end: berlinLocalDateToUtc(
      followingDay.year,
      followingDay.month,
      followingDay.day,
    ),
    label,
  };
}

export function formatBerlinDateTime(value: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: BERLIN_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildPartnerCodePayloads(
  rows: PartnerCodeRow[],
): PartnerCodeBuildResult {
  const payloads = new Map<string, PartnerCodePayload>();
  const skips = new Map<string, PartnerSkip>();

  for (const row of rows) {
    const contactEmail = row.contactEmail?.trim();
    const redemptionInfo = row.redemptionInfo?.trim();
    if (!contactEmail) {
      skips.set(`${row.partnerId}:missing_contact_email`, {
        partnerId: row.partnerId,
        partnerName: row.partnerName,
        reason: "missing_contact_email",
      });
      continue;
    }
    if (!redemptionInfo) {
      skips.set(`${row.partnerId}:missing_redemption_info`, {
        partnerId: row.partnerId,
        partnerName: row.partnerName,
        reason: "missing_redemption_info",
      });
      continue;
    }

    const payload = payloads.get(row.partnerId) ?? {
      partnerId: row.partnerId,
      partnerName: row.partnerName,
      contactEmail,
      events: [],
    };
    let event = payload.events.find((item) => item.eventId === row.eventId);
    if (!event) {
      event = {
        eventId: row.eventId,
        title: row.eventTitle,
        dateTime: formatBerlinDateTime(row.eventDateTime),
        address: row.eventAddress,
        codes: [],
      };
      payload.events.push(event);
    }
    event.codes.push({
      code: redemptionInfo,
      bookingId: row.bookingId,
      userId: row.userId,
      ticketsCount: row.ticketsCount,
    });
    payloads.set(row.partnerId, payload);
  }

  return {
    payloads: [...payloads.values()],
    skips: [...skips.values()],
  };
}

export function renderPartnerCodeEmail(payload: PartnerCodePayload) {
  const text = [
    `Passcodes for upcoming events (${payload.partnerName})`,
    "",
    ...payload.events.flatMap((event) => [
      `${event.title} | ${event.dateTime}${event.address ? ` | ${event.address}` : ""}`,
      ...event.codes.map(
        (code) =>
          `- ${code.code} | booking ${code.bookingId} | user ${code.userId} | ${code.ticketsCount} ticket(s)`,
      ),
      "",
    ]),
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
      <h2>Passcodes for upcoming events</h2>
      <p>${escapeHtml(payload.partnerName)}</p>
      ${payload.events
        .map(
          (event) => `
        <div style="margin:24px 0;padding:16px;border:1px solid #ddd">
          <h3 style="margin:0 0 8px 0">${escapeHtml(event.title)}</h3>
          <p style="margin:0 0 12px 0">${escapeHtml(event.dateTime)}${event.address ? ` | ${escapeHtml(event.address)}` : ""}</p>
          <table style="border-collapse:collapse;width:100%">
            <thead>
              <tr>
                <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Code</th>
                <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Booking</th>
                <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">User</th>
                <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Tickets</th>
              </tr>
            </thead>
            <tbody>
              ${event.codes
                .map(
                  (code) => `
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #eee"><strong>${escapeHtml(code.code)}</strong></td>
                  <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(code.bookingId)}</td>
                  <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(code.userId)}</td>
                  <td style="padding:8px;border-bottom:1px solid #eee">${code.ticketsCount}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `,
        )
        .join("")}
    </div>
  `;

  return {
    subject: `Passcodes for tomorrow | ${payload.partnerName}`,
    text,
    html,
  };
}

export class DrizzlePartnerCodeRepository implements PartnerCodeRepository {
  constructor(private readonly database: Db = db) {}

  async fetchPartnerCodeRows(
    window: PartnerCodeWindow,
  ): Promise<PartnerCodeRow[]> {
    const rows = await this.database
      .select({
        partnerId: partners.id,
        partnerName: partners.name,
        contactEmail: partners.contactEmail,
        eventId: events.id,
        eventTitle: events.title,
        eventDateTime: events.dateTime,
        eventAddress: events.address,
        bookingId: bookings.id,
        userId: bookings.userId,
        ticketsCount: bookings.ticketsCount,
        redemptionInfo: bookings.redemptionInfo,
      })
      .from(events)
      .innerJoin(partners, eq(partners.id, events.partnerId))
      .innerJoin(bookings, eq(bookings.eventId, events.id))
      .where(
        and(
          gte(events.dateTime, window.start),
          lt(events.dateTime, window.end),
          eq(bookings.status, "CONFIRMED"),
          isNotNull(bookings.redemptionInfo),
        ),
      );

    return rows;
  }

  async claimPartnerWindow(input: {
    jobName: string;
    partnerId: string;
    window: PartnerCodeWindow;
    details?: Record<string, unknown>;
  }): Promise<JobSendClaim> {
    const inserted = await this.database
      .insert(jobSendLogs)
      .values({
        id: newId(),
        jobName: input.jobName,
        partnerId: input.partnerId,
        windowStart: input.window.start,
        windowEnd: input.window.end,
        status: "CLAIMED",
        details: input.details ?? {},
      })
      .onConflictDoNothing({
        target: [
          jobSendLogs.jobName,
          jobSendLogs.partnerId,
          jobSendLogs.windowStart,
          jobSendLogs.windowEnd,
        ],
      })
      .returning({ id: jobSendLogs.id });

    return inserted[0]
      ? { claimed: true, logId: inserted[0].id }
      : { claimed: false, logId: null };
  }

  async markSent(input: {
    logId: string;
    providerMessageId: string | null;
    details?: Record<string, unknown>;
  }) {
    await this.database
      .update(jobSendLogs)
      .set({
        status: "SENT",
        provider: "RESEND",
        providerMessageId: input.providerMessageId,
        details: input.details ?? {},
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobSendLogs.id, input.logId));
  }

  async markFailed(input: {
    logId: string;
    safeError: string;
    details?: Record<string, unknown>;
  }) {
    await this.database
      .update(jobSendLogs)
      .set({
        status: "FAILED",
        provider: "RESEND",
        safeError: input.safeError,
        details: input.details ?? {},
        failedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobSendLogs.id, input.logId));
  }

  async markSkipped(input: {
    logId: string;
    details?: Record<string, unknown>;
  }) {
    await this.database
      .update(jobSendLogs)
      .set({
        status: "SKIPPED",
        details: input.details ?? {},
        skippedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobSendLogs.id, input.logId));
  }
}

async function sendEmail(input: {
  config: JobsConfig;
  payload: PartnerCodePayload;
  fetcher?: EmailFetch;
}): Promise<ResendEmailResult> {
  const email = renderPartnerCodeEmail(input.payload);
  return sendResendEmail(
    {
      apiKey: input.config.RESEND_API_KEY,
      from: input.config.DAILY_CODES_FROM_EMAIL,
      to: input.payload.contactEmail,
      ...email,
    },
    input.fetcher,
  );
}

export async function runDailyPartnerCodeJob(
  input: {
    now?: Date;
    config?: JobsConfig;
    repository?: PartnerCodeRepository;
    fetcher?: EmailFetch;
    logger?: Pick<Console, "log" | "error">;
  } = {},
): Promise<DailyPartnerCodeJobResult> {
  const config = input.config ?? getJobsConfig();
  const repository = input.repository ?? new DrizzlePartnerCodeRepository();
  const window = getNextBerlinDayWindow(input.now);
  const details: Array<Record<string, unknown>> = [];
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let duplicates = 0;

  if (!config.RESEND_API_KEY) {
    details.push({ status: "skipped", reason: "missing_resend_api_key" });
    input.logger?.error("daily-partner-codes skipped: RESEND_API_KEY missing");
    return {
      jobName: DAILY_PARTNER_CODES_JOB,
      window: {
        start: window.start.toISOString(),
        end: window.end.toISOString(),
        label: window.label,
      },
      status: "skipped",
      sent,
      failed,
      skipped: 1,
      duplicates,
      details,
    };
  }

  const rows = await repository.fetchPartnerCodeRows(window);
  if (rows.length === 0) {
    details.push({ status: "skipped", reason: "no_sendable_rows" });
    input.logger?.log("daily-partner-codes skipped: no sendable rows");
    return {
      jobName: DAILY_PARTNER_CODES_JOB,
      window: {
        start: window.start.toISOString(),
        end: window.end.toISOString(),
        label: window.label,
      },
      status: "skipped",
      sent,
      failed,
      skipped: 1,
      duplicates,
      details,
    };
  }

  const built = buildPartnerCodePayloads(rows);

  for (const skip of built.skips) {
    const claim = await repository.claimPartnerWindow({
      jobName: DAILY_PARTNER_CODES_JOB,
      partnerId: skip.partnerId,
      window,
      details: { reason: skip.reason, partnerName: skip.partnerName },
    });
    if (!claim.claimed) {
      duplicates += 1;
      continue;
    }
    await repository.markSkipped({
      logId: claim.logId,
      details: { reason: skip.reason, partnerName: skip.partnerName },
    });
    skipped += 1;
    details.push({
      status: "skipped",
      partnerId: skip.partnerId,
      reason: skip.reason,
    });
  }

  for (const payload of built.payloads) {
    const claim = await repository.claimPartnerWindow({
      jobName: DAILY_PARTNER_CODES_JOB,
      partnerId: payload.partnerId,
      window,
      details: {
        partnerName: payload.partnerName,
        eventCount: payload.events.length,
      },
    });

    if (!claim.claimed) {
      duplicates += 1;
      details.push({
        status: "duplicate",
        partnerId: payload.partnerId,
      });
      continue;
    }

    const response = await sendEmail({
      config,
      payload,
      fetcher: input.fetcher,
    });
    if (response.ok) {
      await repository.markSent({
        logId: claim.logId,
        providerMessageId: response.messageId,
        details: {
          partnerName: payload.partnerName,
          eventCount: payload.events.length,
          codeCount: payload.events.reduce(
            (total, event) => total + event.codes.length,
            0,
          ),
        },
      });
      sent += 1;
      details.push({ status: "sent", partnerId: payload.partnerId });
    } else {
      await repository.markFailed({
        logId: claim.logId,
        safeError: response.safeError,
        details: {
          partnerName: payload.partnerName,
          providerStatus: response.status,
        },
      });
      failed += 1;
      details.push({
        status: "failed",
        partnerId: payload.partnerId,
        safeError: response.safeError,
      });
    }
  }

  if (built.payloads.length === 0 && built.skips.length === 0) {
    details.push({ status: "skipped", reason: "no_partner_payloads" });
    skipped += 1;
  }

  return {
    jobName: DAILY_PARTNER_CODES_JOB,
    window: {
      start: window.start.toISOString(),
      end: window.end.toISOString(),
      label: window.label,
    },
    status: "completed",
    sent,
    failed,
    skipped,
    duplicates,
    details,
  };
}
