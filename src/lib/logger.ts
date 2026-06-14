type LogLevel = "debug" | "info" | "warn" | "error";

type ServiceName = "unveiled-web" | "unveiled-worker";

type AppEnv = "local" | "preview" | "production";

type LogContext = Record<string, unknown>;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "apikey",
  "secret",
  "cookie",
  "resendapikey",
  "stripeapikey",
  "databaseurl",
]);

const REDACTED = "[REDACTED]";

const TOP_LEVEL_FIELDS = new Set([
  "timestamp",
  "level",
  "message",
  "service",
  "env",
]);

function resolveService(): ServiceName {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as { __UNVEILED_SERVICE__?: ServiceName };
    if (g.__UNVEILED_SERVICE__) return g.__UNVEILED_SERVICE__;
  }
  return "unveiled-web";
}

function resolveEnv(): AppEnv {
  const mode = (import.meta as { env?: { MODE?: string } }).env?.MODE;
  if (mode === "production") return "production";
  if (mode === "preview" || mode === "staging") return "preview";
  return "local";
}

function readLevel(): LogLevel {
  const raw = readEnv("LOG_LEVEL")?.toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  const env = resolveEnv();
  return env === "local" ? "debug" : "info";
}

function readSampleRate(): number {
  const raw = readEnv("LOG_SAMPLE_RATE");
  if (!raw) return 1;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 1;
  return Math.min(1, parsed);
}

function readEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string> } })
    .process;
  if (proc?.env && typeof proc.env[name] === "string") return proc.env[name];
  const cf = (globalThis as { __CLOUDFLARE_ENV__?: Record<string, string> })
    .__CLOUDFLARE_ENV__;
  if (cf && typeof cf[name] === "string") return cf[name];
  return undefined;
}

function redact(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (seen.has(value as object)) return "[Circular]";
  seen.add(value as object);

  if (value instanceof Error) return value;
  if (Array.isArray(value)) {
    return value.map((entry) => redact(entry, seen));
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      out[k] = REDACTED;
    } else {
      out[k] = redact(v, seen);
    }
  }
  return out;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, (_key, v) => {
      if (v instanceof Error) {
        return {
          name: v.name,
          message: v.message,
          ...(v.stack
            ? { stack: v.stack.split("\n").slice(0, 8).join("\n") }
            : {}),
        };
      }
      return v;
    });
  } catch {
    return JSON.stringify({ message: "unserializable_log_value" });
  }
}

function shapeForSerialization(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(value.stack
        ? { stack: value.stack.split("\n").slice(0, 8).join("\n") }
        : {}),
    };
  }
  if (typeof value !== "object") return value;
  if (seen.has(value as object)) return "[Circular]";
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((entry) => shapeForSerialization(entry, seen));
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = shapeForSerialization(v, seen);
  }
  return out;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(bindings: LogContext): Logger;
  level(): LogLevel;
}

interface LoggerOptions {
  service?: ServiceName;
  env?: AppEnv;
  level?: LogLevel;
  sampleRate?: number;
  context?: LogContext;
  sink?: (level: LogLevel, line: string) => void;
  clock?: () => Date;
}

function makeLogger(options: LoggerOptions = {}): Logger {
  const service = options.service ?? resolveService();
  const env = options.env ?? resolveEnv();
  const level = options.level ?? readLevel();
  const sampleRate = options.sampleRate ?? readSampleRate();
  const baseContext: LogContext = { ...(options.context ?? {}) };
  const sink = options.sink ?? defaultLevelSink;
  const clock = options.clock ?? (() => new Date());

  function emit(methodLevel: LogLevel, message: string, context?: LogContext) {
    if (LEVEL_PRIORITY[methodLevel] < LEVEL_PRIORITY[level]) return;
    if (sampleRate < 1 && Math.random() >= sampleRate) return;

    const merged: LogContext = { ...baseContext, ...(context ?? {}) };
    const redacted = redact(merged, new WeakSet()) as LogContext;
    const shaped = shapeForSerialization(redacted, new WeakSet()) as LogContext;

    const flatContext: LogContext = {};
    for (const [k, v] of Object.entries(shaped)) {
      if (TOP_LEVEL_FIELDS.has(k)) continue;
      flatContext[k] = v;
    }

    const line = {
      timestamp: clock().toISOString(),
      level: methodLevel,
      message,
      service,
      env,
      context: flatContext,
    };

    sink(methodLevel, safeStringify(line));
  }

  return {
    debug: (message, context) => emit("debug", message, context),
    info: (message, context) => emit("info", message, context),
    warn: (message, context) => emit("warn", message, context),
    error: (message, context) => emit("error", message, context),
    child: (bindings) =>
      makeLogger({
        service,
        env,
        level,
        sampleRate,
        context: { ...baseContext, ...bindings },
        sink,
        clock,
      }),
    level: () => level,
  };
}

function defaultLevelSink(level: LogLevel, line: string): void {
  const method = console[level] as (line: string) => void;
  if (typeof method === "function") {
    method.call(console, line);
    return;
  }
  console.log(line);
}

export const logger: Logger = makeLogger();

export function createLogger(options: LoggerOptions = {}): Logger {
  return makeLogger(options);
}

export function setService(service: ServiceName): void {
  (globalThis as { __UNVEILED_SERVICE__?: ServiceName }).__UNVEILED_SERVICE__ =
    service;
}

export const LOG_LEVELS: readonly LogLevel[] = Object.freeze([
  "debug",
  "info",
  "warn",
  "error",
] as const);

export const REDACTED_VALUE = REDACTED;
