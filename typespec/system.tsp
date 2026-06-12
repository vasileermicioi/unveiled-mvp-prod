import "@typespec/http";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;
using Unveiled.Api.Common;

@jsonSchema
namespace Unveiled.Api.System;

@doc("Liveness probe result.")
model HealthResult {
  @doc("`ok` when the worker is responsive.")
  status: "ok";

  @doc("Server timestamp.")
  now: Timestamp;
}

@doc("Readiness probe result.")
model ReadinessResult {
  @doc("`ready` when dependencies are reachable.")
  status: "ready" | "degraded";

  @doc("Per-dependency status map.")
  checks: Record<{
    ok: boolean;
    message?: string;
  }>;
}

@route("/health.json")
namespace HealthRoutes {
  @get
  op health(): HealthResult;
}

@route("/readiness.json")
namespace ReadinessRoutes {
  @get
  op readiness(): ReadinessResult;
}
