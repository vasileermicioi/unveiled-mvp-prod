import { env as cloudflareEnv } from "cloudflare:workers";
import type { APIRoute } from "astro";

import {
  type AssetKind,
  type AssetRuntimeEnv,
  uploadAdminAssetFile,
  validateAdminAssetUploadFile,
} from "@/lib/assets/storage";
import { AuthAccessError, requireAdmin } from "@/lib/auth-profile";
import { getCloudflareEnv } from "@/lib/env";

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const viewer = await requireAdmin(request.headers);
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "");
    const ownerId = String(formData.get("ownerId") ?? "").trim();

    if (kind !== "event" && kind !== "partner") {
      return uploadFailure("Select an available asset type.", 400);
    }

    if (!ownerId) {
      return uploadFailure("Asset owner is required.", 400);
    }

    if (!(file instanceof File)) {
      return uploadFailure("Choose an image file.", 400);
    }

    const validation = validateAdminAssetUploadFile({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      env: {
        ...getCloudflareEnv(locals),
        ...(cloudflareEnv as Record<string, unknown>),
      } as Parameters<typeof validateAdminAssetUploadFile>[0]["env"],
    });

    if (!validation.ok) {
      return uploadFailure(validation.message, 400, validation.field);
    }

    const asset = await uploadAdminAssetFile({
      viewer,
      env: {
        ...getCloudflareEnv(locals),
        ...(cloudflareEnv as Record<string, unknown>),
      } as AssetRuntimeEnv,
      kind: kind as AssetKind,
      ownerId,
      file,
    });

    return Response.json({
      ok: true,
      data: {
        kind: asset.kind,
        key: asset.key,
        url: asset.url,
        contentType: asset.contentType,
        filename: asset.filename,
      },
    });
  } catch (error) {
    if (error instanceof AuthAccessError) {
      return uploadFailure(error.message, 403);
    }

    return uploadFailure(safeUploadMessage(error), 503);
  }
};

function uploadFailure(message: string, status: number, field = "file") {
  return Response.json(
    {
      ok: false,
      fieldErrors: { [field]: message },
      formError: message,
    },
    { status },
  );
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
