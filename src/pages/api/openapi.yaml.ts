// Import the committed OpenAPI document as a raw ES module string. The
// `@typespec/openapi3` emitter writes `openapi.yaml` (the only committed
// artifact under `typespec/output/`), and Vite resolves the `?raw` import
// at build/dev time so the worker (which has no fs access in dev) can still
// serve the document.

import type { APIRoute } from "astro";
import openapiDocument from "../../../typespec/output/openapi.yaml?raw";

export const GET: APIRoute = async () =>
  new Response(openapiDocument, {
    status: 200,
    headers: {
      "content-type": "application/yaml; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
