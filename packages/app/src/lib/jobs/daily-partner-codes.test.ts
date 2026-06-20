import { describe, expect, test } from "bun:test";

import {
  buildPartnerCodePayloads,
  DAILY_PARTNER_CODES_JOB,
  getNextBerlinDayWindow,
  type JobSendClaim,
  type PartnerCodeRepository,
  type PartnerCodeRow,
  renderPartnerCodeEmail,
  runDailyPartnerCodeJob,
} from "~/lib/jobs/daily-partner-codes";

class FakePartnerCodeRepository implements PartnerCodeRepository {
  claims = new Set<string>();
  sent: Array<Record<string, unknown>> = [];
  failed: Array<Record<string, unknown>> = [];
  skipped: Array<Record<string, unknown>> = [];

  constructor(private readonly rows: PartnerCodeRow[]) {}

  async fetchPartnerCodeRows() {
    return this.rows;
  }

  async claimPartnerWindow(input: {
    jobName: string;
    partnerId: string;
    window: { start: Date; end: Date };
  }): Promise<JobSendClaim> {
    const key = `${input.jobName}:${input.partnerId}:${input.window.start.toISOString()}:${input.window.end.toISOString()}`;
    if (this.claims.has(key)) return { claimed: false, logId: null };
    this.claims.add(key);
    return { claimed: true, logId: `log-${this.claims.size}` };
  }

  async markSent(input: {
    logId: string;
    providerMessageId: string | null;
    details?: Record<string, unknown>;
  }) {
    this.sent.push(input);
  }

  async markFailed(input: {
    logId: string;
    safeError: string;
    details?: Record<string, unknown>;
  }) {
    this.failed.push(input);
  }

  async markSkipped(input: {
    logId: string;
    details?: Record<string, unknown>;
  }) {
    this.skipped.push(input);
  }
}

const baseRow: PartnerCodeRow = {
  partnerId: "partner-1",
  partnerName: "Kunsthalle <Mitte>",
  contactEmail: "partner@example.test",
  eventId: "event-1",
  eventTitle: "Late <Night>",
  eventDateTime: new Date("2026-05-07T18:00:00.000Z"),
  eventAddress: "Example & Street",
  bookingId: "booking-1",
  userId: "user-1",
  ticketsCount: 2,
  redemptionInfo: "CODE-1",
};

describe("daily partner code job", () => {
  test("calculates the next Berlin day window across standard time", () => {
    const window = getNextBerlinDayWindow(new Date("2026-01-10T22:59:00.000Z"));

    expect(window.label).toBe("2026-01-11");
    expect(window.start.toISOString()).toBe("2026-01-10T23:00:00.000Z");
    expect(window.end.toISOString()).toBe("2026-01-11T23:00:00.000Z");
  });

  test("calculates Berlin day windows across daylight-saving start", () => {
    const window = getNextBerlinDayWindow(new Date("2026-03-28T22:59:00.000Z"));

    expect(window.label).toBe("2026-03-29");
    expect(window.start.toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(window.end.toISOString()).toBe("2026-03-29T22:00:00.000Z");
  });

  test("groups sendable codes and records partner skips", () => {
    const result = buildPartnerCodePayloads([
      baseRow,
      {
        ...baseRow,
        bookingId: "booking-2",
        redemptionInfo: "CODE-2",
      },
      {
        ...baseRow,
        partnerId: "partner-2",
        partnerName: "No Mail",
        contactEmail: "",
      },
    ]);

    expect(result.payloads).toHaveLength(1);
    expect(result.payloads[0].events[0].codes).toHaveLength(2);
    expect(result.skips).toEqual([
      {
        partnerId: "partner-2",
        partnerName: "No Mail",
        reason: "missing_contact_email",
      },
    ]);
  });

  test("escapes HTML email fields", () => {
    const payload = buildPartnerCodePayloads([baseRow]).payloads[0];
    const email = renderPartnerCodeEmail(payload);

    expect(email.text).toContain("CODE-1");
    expect(email.html).toContain("Kunsthalle &lt;Mitte&gt;");
    expect(email.html).toContain("Late &lt;Night&gt;");
    expect(email.html).toContain("Example &amp; Street");
  });

  test("sends once per partner and treats duplicate invocations as skipped", async () => {
    const repository = new FakePartnerCodeRepository([baseRow]);
    const sentPayloads: unknown[] = [];
    const fetcher = async (
      _url: string | URL | Request,
      init?: RequestInit,
    ) => {
      sentPayloads.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ id: "email-1" }), { status: 200 });
    };

    const first = await runDailyPartnerCodeJob({
      now: new Date("2026-05-06T21:59:00.000Z"),
      config: {
        RESEND_API_KEY: "secret-key",
        DAILY_CODES_FROM_EMAIL: "codes@example.test",
      },
      repository,
      fetcher,
    });
    const second = await runDailyPartnerCodeJob({
      now: new Date("2026-05-06T21:59:00.000Z"),
      config: {
        RESEND_API_KEY: "secret-key",
        DAILY_CODES_FROM_EMAIL: "codes@example.test",
      },
      repository,
      fetcher,
    });

    expect(first.jobName).toBe(DAILY_PARTNER_CODES_JOB);
    expect(first.sent).toBe(1);
    expect(second.sent).toBe(0);
    expect(second.duplicates).toBe(1);
    expect(sentPayloads).toHaveLength(1);
    expect(JSON.stringify(sentPayloads[0])).not.toContain("secret-key");
  });

  test("records provider failures with safe error details", async () => {
    const repository = new FakePartnerCodeRepository([baseRow]);
    const result = await runDailyPartnerCodeJob({
      now: new Date("2026-05-06T21:59:00.000Z"),
      config: {
        RESEND_API_KEY: "secret-key",
        DAILY_CODES_FROM_EMAIL: "codes@example.test",
      },
      repository,
      fetcher: async () =>
        new Response(JSON.stringify({ message: "provider rejected" }), {
          status: 500,
        }),
    });

    expect(result.failed).toBe(1);
    expect(repository.failed[0].safeError).toContain("Resend 500");
    expect(JSON.stringify(repository.failed)).not.toContain("secret-key");
  });

  test("skips without delivery when Resend is not configured", async () => {
    const repository = new FakePartnerCodeRepository([baseRow]);
    const result = await runDailyPartnerCodeJob({
      config: {
        RESEND_API_KEY: "",
        DAILY_CODES_FROM_EMAIL: "codes@example.test",
      },
      repository,
      fetcher: async () => {
        throw new Error("fetch should not be called");
      },
    });

    expect(result.status).toBe("skipped");
    expect(result.details[0]).toEqual({
      status: "skipped",
      reason: "missing_resend_api_key",
    });
  });

  test("migration includes duplicate-send uniqueness assertions", async () => {
    const migration = await Bun.file(
      "drizzle/0004_daily_partner_codes.sql",
    ).text();

    expect(migration).toContain("job_send_logs");
    expect(migration).toContain("job_send_logs_job_partner_window_unique");
  });
});
