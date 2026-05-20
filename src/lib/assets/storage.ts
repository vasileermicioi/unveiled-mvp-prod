import type { Viewer } from "@/lib/auth-profile";
import { AuthAccessError, authFailure } from "@/lib/auth-profile";
import { getRequiredEnv, getRuntimeEnv, type RuntimeEnv } from "@/lib/env";

type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer | ReadableStream,
    options?: unknown,
  ): Promise<unknown>;
};

export type AssetRuntimeEnv = Record<string, string | R2Bucket | undefined>;

export type AssetKind = "event" | "partner";

export const ADMIN_ASSET_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const ADMIN_ASSET_UPLOAD_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type UploadAssetInput = {
  viewer: Viewer;
  env?: AssetRuntimeEnv;
  kind: AssetKind;
  ownerId: string;
  filename: string;
  contentType: string;
  data: ArrayBuffer | ReadableStream;
};

export type StoredAsset = {
  key: string;
  url: string;
  contentType: string;
};

export type UploadAssetFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
};

export type AssetUploadValidationResult =
  | { ok: true }
  | { ok: false; message: string; field: "file" };

function assertAdmin(viewer: Viewer) {
  if (viewer.kind !== "authenticated" || viewer.role !== "ADMIN") {
    throw new AuthAccessError(authFailure("forbidden"));
  }
}

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildAssetKey(input: {
  kind: AssetKind;
  ownerId: string;
  filename: string;
}) {
  const safeName = sanitizeFilename(input.filename) || "asset";
  return `${input.kind}/${input.ownerId}/${crypto.randomUUID()}-${safeName}`;
}

export function getAssetDisplayUrl(key: string, env?: RuntimeEnv) {
  const baseUrl = getRequiredEnv("PUBLIC_ASSET_BASE_URL", env).replace(
    /\/$/,
    "",
  );
  return `${baseUrl}/${key}`;
}

export function validateAdminAssetUploadFile(input: {
  filename?: string;
  contentType?: string;
  size?: number;
}): AssetUploadValidationResult {
  if (!input.filename?.trim()) {
    return {
      ok: false,
      field: "file",
      message: "Choose an image file with a filename.",
    };
  }

  if (
    !input.contentType ||
    !ADMIN_ASSET_UPLOAD_CONTENT_TYPES.includes(
      input.contentType as (typeof ADMIN_ASSET_UPLOAD_CONTENT_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      field: "file",
      message: "Upload a JPG, PNG, WebP, or GIF image.",
    };
  }

  if (!input.size || input.size <= 0) {
    return {
      ok: false,
      field: "file",
      message: "Choose a non-empty image file.",
    };
  }

  if (input.size > ADMIN_ASSET_UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      field: "file",
      message: "Image uploads must be 5 MB or smaller.",
    };
  }

  return { ok: true };
}

export async function uploadAdminAsset(
  input: UploadAssetInput,
): Promise<StoredAsset> {
  assertAdmin(input.viewer);

  const runtimeEnv = getRuntimeEnv(input.env as RuntimeEnv) as AssetRuntimeEnv;
  const bucket = input.env?.ASSETS_BUCKET ?? runtimeEnv.ASSETS_BUCKET;

  if (!bucket || typeof bucket === "string") {
    throw new Error("ASSETS_BUCKET binding is required for asset uploads.");
  }

  const key = buildAssetKey(input);

  await bucket.put(key, input.data, {
    httpMetadata: {
      contentType: input.contentType,
    },
  });

  return {
    key,
    url: getAssetDisplayUrl(key, runtimeEnv as RuntimeEnv),
    contentType: input.contentType,
  };
}

export async function uploadAdminAssetFile(input: {
  viewer: Viewer;
  env?: AssetRuntimeEnv;
  kind: AssetKind;
  ownerId: string;
  file: UploadAssetFile;
}): Promise<StoredAsset & { filename: string; kind: AssetKind }> {
  const validation = validateAdminAssetUploadFile({
    filename: input.file.name,
    contentType: input.file.type,
    size: input.file.size,
  });

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const asset = await uploadAdminAsset({
    viewer: input.viewer,
    env: input.env,
    kind: input.kind,
    ownerId: input.ownerId,
    filename: input.file.name,
    contentType: input.file.type,
    data: await input.file.arrayBuffer(),
  });

  return {
    ...asset,
    filename: input.file.name,
    kind: input.kind,
  };
}

export function validateRemoteAssetUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error("Remote asset URLs must use HTTPS.");
  }

  return url.toString();
}
