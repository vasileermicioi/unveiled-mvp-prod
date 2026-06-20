import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import {
  type AssetKind,
  type AssetRuntimeEnv,
  AuthAccessError,
  getCloudflareEnv,
  requireAdmin,
  uploadAdminAssetFile,
  validateAdminAssetUploadFile,
  type AppType,
  type RuntimeEnv,
} from "@unveiled/api/worker";

function readEnv(c: { get: (k: string) => unknown }): RuntimeEnv {
  const runtime = c.get("runtimeEnv") as RuntimeEnv | undefined;
  return {
    ...getCloudflareEnv({ env: runtime }),
    ...(runtime ?? {}),
  } as RuntimeEnv;
}

const uploadResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    kind: z.string(),
    key: z.string(),
    url: z.string(),
    contentType: z.string(),
    filename: z.string(),
  }),
});

const uploadErrorSchema = z.object({
  ok: z.literal(false),
  fieldErrors: z.record(z.string(), z.string()),
  formError: z.string(),
});

const uploadRoute = createRoute({
  method: "post",
  path: "/api/admin/assets/upload",
  tags: ["Admin"],
  summary: "Upload an admin asset (event image or partner logo)",
  request: {
    body: {
      content: {
        "multipart/form-data": { schema: z.unknown() },
      },
    },
  },
  responses: {
    200: {
      description: "Upload succeeded",
      content: { "application/json": { schema: uploadResponseSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: uploadErrorSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: uploadErrorSchema } },
    },
    503: {
      description: "Upload service unavailable",
      content: { "application/json": { schema: uploadErrorSchema } },
    },
  },
});

function uploadFailure(message: string, status: number, field = "file") {
  return {
    body: {
      ok: false,
      fieldErrors: { [field]: message },
      formError: message,
    },
    status,
  };
}

function safeUploadMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("ASSETS_BUCKET")) {
      return "Asset uploads are not configured. Paste a HTTPS image URL instead.";
    }
    if (error.message.includes("PUBLIC_ASSET_BASE_URL")) {
      return "Asset uploads are not configured. Paste a HTTPS image URL instead.";
    }
  }
  return "The upload could not be completed.";
}

export function mountAdminRoutes(app: AppType): void {
  app.post("/api/admin/assets/upload", async (c) => {
    try {
      const viewer = await requireAdmin(c.req.raw.headers);
      const formData = await c.req.raw.formData();
      const file = formData.get("file") as File | null;
      const kind = String(formData.get("kind") ?? "");
      const ownerId = String(formData.get("ownerId") ?? "").trim();
      const env = readEnv(c);

      if (kind !== "event" && kind !== "partner") {
        return c.json(
          {
            ok: false,
            fieldErrors: { file: "Select an available asset type." },
            formError: "Select an available asset type.",
          },
          400,
        );
      }
      if (!ownerId) {
        return c.json(
          {
            ok: false,
            fieldErrors: { file: "Asset owner is required." },
            formError: "Asset owner is required.",
          },
          400,
        );
      }
      if (!(file instanceof File)) {
        return c.json(
          {
            ok: false,
            fieldErrors: { file: "Choose an image file." },
            formError: "Choose an image file.",
          },
          400,
        );
      }

      const validation = validateAdminAssetUploadFile({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        env: env as Parameters<typeof validateAdminAssetUploadFile>[0]["env"],
      });
      if (!validation.ok) {
        return c.json(
          {
            ok: false,
            fieldErrors: { [validation.field]: validation.message },
            formError: validation.message,
          },
          400,
        );
      }

      const asset = await uploadAdminAssetFile({
        viewer,
        env: env as AssetRuntimeEnv,
        kind: kind as AssetKind,
        ownerId,
        file,
      });

      return c.json(
        {
          ok: true,
          data: {
            kind: asset.kind,
            key: asset.key,
            url: asset.url,
            contentType: asset.contentType,
            filename: asset.filename,
          },
        },
        200,
      );
    } catch (error) {
      if (error instanceof AuthAccessError) {
        return c.json(
          {
            ok: false,
            fieldErrors: { file: error.message },
            formError: error.message,
          },
          403,
        );
      }
      const err = error instanceof Error ? error : new Error(String(error));
      return c.json(
        {
          ok: false,
          fieldErrors: { file: safeUploadMessage(err) },
          formError: safeUploadMessage(err),
        },
        503,
      );
    }
  });
}
