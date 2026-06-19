import type { ErrorHandler, MiddlewareHandler } from "hono";

export type ApiError = {
  ok: false;
  code: string;
  message: string;
  details?: unknown;
};

export function errorEnvelope(code: string, message: string, details?: unknown): ApiError {
  return { ok: false, code, message, details };
}

export const errorHandler: ErrorHandler = (err, c) => {
  console.error("[api] unhandled error", err);
  if (err instanceof ValidationError) {
    return c.json(errorEnvelope("validation_error", err.message, err.details), 400);
  }
  if (err instanceof AuthError) {
    return c.json(errorEnvelope("unauthorized", err.message), 401);
  }
  if (err instanceof ForbiddenError) {
    return c.json(errorEnvelope("forbidden", err.message), 403);
  }
  if (err instanceof NotFoundError) {
    return c.json(errorEnvelope("not_found", err.message), 404);
  }
  if (err instanceof ConfigError) {
    return c.json(errorEnvelope("configuration_failed", err.message), 503);
  }
  return c.json(errorEnvelope("internal_error", "Internal server error"), 500);
};

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function jsonErrorMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return c.json(errorEnvelope("validation_error", err.message, err.details), 400);
      }
      if (err instanceof AuthError) {
        return c.json(errorEnvelope("unauthorized", err.message), 401);
      }
      if (err instanceof ForbiddenError) {
        return c.json(errorEnvelope("forbidden", err.message), 403);
      }
      if (err instanceof NotFoundError) {
        return c.json(errorEnvelope("not_found", err.message), 404);
      }
      if (err instanceof ConfigError) {
        return c.json(errorEnvelope("configuration_failed", err.message), 503);
      }
      throw err;
    }
  };
}