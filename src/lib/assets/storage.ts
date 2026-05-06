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

type AssetRuntimeEnv = Record<string, string | R2Bucket | undefined>;

export type AssetKind = "event" | "partner";

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

export function validateRemoteAssetUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error("Remote asset URLs must use HTTPS.");
  }

  return url.toString();
}
