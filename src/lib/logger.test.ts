import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { createLogger, logger, setService } from "@/lib/logger";

type Captured = {
  level: string;
  line: string;
  parsed: Record<string, unknown>;
};

function captureLogger(
  options: { level?: "debug" | "info" | "warn" | "error" } = {},
) {
  const captured: Captured[] = [];
  const sink = (lvl: "debug" | "info" | "warn" | "error", line: string) => {
    captured.push({
      level: lvl,
      line,
      parsed: JSON.parse(line) as Record<string, unknown>,
    });
  };
  const fixed = new Date("2026-06-14T12:00:00.000Z");
  const log = createLogger({
    level: options.level ?? "debug",
    service: "unveiled-web",
    env: "local",
    sampleRate: 1,
    context: {},
    sink,
    clock: () => fixed,
  });
  return { log, captured, fixed };
}

describe("structured logger", () => {
  test("emits exactly one line of valid JSON per call", () => {
    const { log, captured } = captureLogger();
    log.info("hello", { userId: "u_1" });
    expect(captured).toHaveLength(1);
    expect(captured[0].line.includes("\n")).toBe(false);
    expect(typeof captured[0].parsed).toBe("object");
    expect(() => JSON.parse(captured[0].line)).not.toThrow();
  });

  test("emits every level on the matching console method", () => {
    const calls: Array<[string, string]> = [];
    const real = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
    console.debug = ((line: string) =>
      calls.push(["debug", line])) as typeof console.debug;
    console.info = ((line: string) =>
      calls.push(["info", line])) as typeof console.info;
    console.warn = ((line: string) =>
      calls.push(["warn", line])) as typeof console.warn;
    console.error = ((line: string) =>
      calls.push(["error", line])) as typeof console.error;
    try {
      const log = createLogger({
        level: "debug",
        service: "unveiled-web",
        env: "local",
        sampleRate: 1,
        context: {},
        clock: () => new Date("2026-06-14T12:00:00.000Z"),
      });
      log.debug("d");
      log.info("i");
      log.warn("w");
      log.error("e");
    } finally {
      console.debug = real.debug;
      console.info = real.info;
      console.warn = real.warn;
      console.error = real.error;
    }
    expect(calls.map((c) => c[0])).toEqual(["debug", "info", "warn", "error"]);
    for (const [, line] of calls) {
      expect(line.includes("\n")).toBe(false);
    }
    const lines = calls.map((c) => JSON.parse(c[1]) as Record<string, unknown>);
    expect(lines[0].level).toBe("debug");
    expect(lines[1].level).toBe("info");
    expect(lines[2].level).toBe("warn");
    expect(lines[3].level).toBe("error");
  });

  test("always includes the required top-level fields", () => {
    const { log, captured } = captureLogger();
    log.info("schema-check", { route: "/de/" });
    const out = captured[0].parsed;
    expect(out.timestamp).toBe("2026-06-14T12:00:00.000Z");
    expect(out.level).toBe("info");
    expect(out.message).toBe("schema-check");
    expect(out.service).toBe("unveiled-web");
    expect(out.env).toBe("local");
    expect(typeof out.context).toBe("object");
  });

  test("moves unknown top-level fields into the context bag", () => {
    const { log, captured } = captureLogger();
    log.info("flat", { unexpectedTop: 1, userId: "u_1" } as never);
    const out = captured[0].parsed;
    expect(out).not.toHaveProperty("unexpectedTop");
    const ctx = out.context as Record<string, unknown>;
    expect(ctx.unexpectedTop).toBe(1);
    expect(ctx.userId).toBe("u_1");
  });

  test("child merges bindings shallowly", () => {
    const { log, captured } = captureLogger();
    const childLog = log.child({ traceId: "abc", route: "/de/" });
    childLog.info("from-child", { action: "login" });
    const ctx = captured[0].parsed.context as Record<string, unknown>;
    expect(ctx.traceId).toBe("abc");
    expect(ctx.route).toBe("/de/");
    expect(ctx.action).toBe("login");
  });

  test("child bindings are overridden by per-call context", () => {
    const { log, captured } = captureLogger();
    const childLog = log.child({ route: "/de/" });
    childLog.info("override", { route: "/en/" });
    const ctx = captured[0].parsed.context as Record<string, unknown>;
    expect(ctx.route).toBe("/en/");
  });

  test("LOG_LEVEL filters lower-priority levels", () => {
    const warn = captureLogger({ level: "warn" });
    warn.log.debug("d");
    warn.log.info("i");
    warn.log.warn("w");
    warn.log.error("e");
    const levels = warn.captured.map((c) => c.level);
    expect(levels).toEqual(["warn", "error"]);
  });

  test("redacts values for sensitive key names", () => {
    const { log, captured } = captureLogger();
    log.info("secrets", {
      password: "hunter2",
      token: "tok_123",
      authorization: "Bearer abc",
      apiKey: "k",
      secret: "s",
      cookie: "c=1",
      resendApiKey: "re_1",
      stripeApiKey: "sk_1",
      databaseUrl: "postgres://x",
      safe: "ok",
    });
    const ctx = captured[0].parsed.context as Record<string, unknown>;
    expect(ctx.password).toBe("[REDACTED]");
    expect(ctx.token).toBe("[REDACTED]");
    expect(ctx.authorization).toBe("[REDACTED]");
    expect(ctx.apiKey).toBe("[REDACTED]");
    expect(ctx.secret).toBe("[REDACTED]");
    expect(ctx.cookie).toBe("[REDACTED]");
    expect(ctx.resendApiKey).toBe("[REDACTED]");
    expect(ctx.stripeApiKey).toBe("[REDACTED]");
    expect(ctx.databaseUrl).toBe("[REDACTED]");
    expect(ctx.safe).toBe("ok");
  });

  test("redacts nested sensitive values", () => {
    const { log, captured } = captureLogger();
    log.info("nested", { headers: { authorization: "Bearer x", cookie: "y" } });
    const ctx = captured[0].parsed.context as Record<string, unknown>;
    const headers = ctx.headers as Record<string, unknown>;
    expect(headers.authorization).toBe("[REDACTED]");
    expect(headers.cookie).toBe("[REDACTED]");
  });

  test("serializes Error values with a truncated stack", () => {
    const { log, captured } = captureLogger();
    log.error("boom", { err: new Error("explode") });
    const ctx = captured[0].parsed.context as Record<string, unknown>;
    const err = ctx.err as Record<string, unknown>;
    expect(err.name).toBe("Error");
    expect(err.message).toBe("explode");
    expect(typeof err.stack).toBe("string");
    expect((err.stack as string).split("\n").length).toBeLessThanOrEqual(8);
  });
});

describe("daily-partner-codes summary line", () => {
  test("preserves the prior summary fields when emitted via the logger", () => {
    const { log, captured } = captureLogger();
    const jobName = "daily-partner-codes";
    const result = {
      jobName,
      status: "ok",
      sent: 3,
      failed: 0,
      skipped: 0,
      duplicates: 1,
      window: {
        start: "2026-06-15T00:00:00.000Z",
        end: "2026-06-16T00:00:00.000Z",
        label: "2026-06-15",
      },
    };
    log.info("job_summary", {
      jobName: result.jobName,
      status: result.status,
      sent: result.sent,
      failed: result.failed,
      skipped: result.skipped,
      duplicates: result.duplicates,
      window: result.window,
    });

    const out = captured[0].parsed;
    const ctx = out.context as Record<string, unknown>;
    expect(out.level).toBe("info");
    expect(out.service).toBe("unveiled-web");
    expect(ctx.jobName).toBe("daily-partner-codes");
    expect(ctx.status).toBe("ok");
    expect(ctx.sent).toBe(3);
    expect(ctx.failed).toBe(0);
    expect(ctx.skipped).toBe(0);
    expect(ctx.duplicates).toBe(1);
    expect(ctx.window).toEqual({
      start: "2026-06-15T00:00:00.000Z",
      end: "2026-06-16T00:00:00.000Z",
      label: "2026-06-15",
    });
  });

  test("skipped job carries reason and scheduledTime", () => {
    const { log, captured } = captureLogger();
    log.warn("job_skipped", {
      jobName: "daily-partner-codes",
      status: "skipped",
      reason: "missing_database_url",
      scheduledTime: "2026-06-15T00:00:00.000Z",
    });
    const out = captured[0].parsed;
    expect(out.level).toBe("warn");
    const ctx = out.context as Record<string, unknown>;
    expect(ctx.jobName).toBe("daily-partner-codes");
    expect(ctx.status).toBe("skipped");
    expect(ctx.reason).toBe("missing_database_url");
    expect(ctx.scheduledTime).toBe("2026-06-15T00:00:00.000Z");
  });
});

describe("service resolution", () => {
  const original = (globalThis as { __UNVEILED_SERVICE__?: string })
    .__UNVEILED_SERVICE__;
  beforeEach(() => {
    delete (globalThis as { __UNVEILED_SERVICE__?: string })
      .__UNVEILED_SERVICE__;
  });
  afterEach(() => {
    (globalThis as { __UNVEILED_SERVICE__?: string }).__UNVEILED_SERVICE__ =
      original;
  });

  test("uses unveiled-web by default and unveiled-worker when set", () => {
    const a = createLogger({
      level: "info",
      env: "production",
      service: "unveiled-web",
      sink: (_l, _l2) => {},
    });
    expect(a.level()).toBe("info");
    setService("unveiled-worker");
    const b = createLogger({
      level: "info",
      env: "production",
      service: "unveiled-worker",
      sink: (_l, _l2) => {},
    });
    expect(b.level()).toBe("info");
  });
});

describe("module-level logger", () => {
  test("default logger is exported and is a Logger", () => {
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.child).toBe("function");
  });
});
