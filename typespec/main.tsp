import "@typespec/http";
import "@typespec/openapi3";
import "@typespec/json-schema";

import "./common.tsp";
import "./auth.tsp";
import "./admin.tsp";
import "./member.tsp";
import "./partner.tsp";
import "./webhooks.tsp";
import "./system.tsp";
import "./surfaces.tsp";
import "./astro-actions.tsp";

using TypeSpec.Http;
using TypeSpec.JsonSchema;

@service(#{ title: "Unveiled API" })
@server("https://unveiled.app/api", "Production")
@route("/api")
namespace Unveiled.Api;
