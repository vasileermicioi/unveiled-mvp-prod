import { describe, expect, test } from "bun:test";

import {
  ADMIN_ASSET_UPLOAD_MAX_BYTES,
  getAdminAssetUploadMaxBytes,
  uploadAdminAsset,
  uploadAdminAssetFile,
  validateAdminAssetUploadFile,
  validateRemoteAssetUrl,
} from "@/lib/assets/storage";
import type { Viewer } from "@/lib/auth-profile";

function viewer(role: "ADMIN" | "USER"): Viewer {
  return {
    kind: "authenticated",
    viewerContext: role === "ADMIN" ? "admin" : "member",
    user: {
      id: "user_1",
      email: "user@example.com",
      name: "User",
      emailVerified: true,
      image: null,
    },
    role,
    partnerId: null,
    language: "EN",
    credits: 0,
    subscriptionStatus: "INACTIVE",
    subscriptionPlan: "none",
    savedCount: 0,
    firstName: "Test",
    lastName: "User",
    onboardingComplete: false,
    showProfile: true,
    showLogout: true,
  };
}

describe("asset storage", () => {
  test("validates admin upload file metadata", () => {
    expect(
      validateAdminAssetUploadFile({
        filename: "",
        contentType: "image/png",
        size: 100,
      }),
    ).toMatchObject({ ok: false, field: "file" });

    expect(
      validateAdminAssetUploadFile({
        filename: "image.txt",
        contentType: "text/plain",
        size: 100,
      }),
    ).toMatchObject({ ok: false, field: "file" });

    expect(
      validateAdminAssetUploadFile({
        filename: "large.png",
        contentType: "image/png",
        size: ADMIN_ASSET_UPLOAD_MAX_BYTES + 1,
      }),
    ).toMatchObject({ ok: false, field: "file" });

    expect(
      validateAdminAssetUploadFile({
        filename: "image.webp",
        contentType: "image/webp",
        size: 100,
      }),
    ).toEqual({ ok: true });
  });

  test("rejects non-admin writes before storage changes", async () => {
    let writes = 0;

    expect(
      uploadAdminAsset({
        viewer: viewer("USER"),
        env: {
          PUBLIC_ASSET_BASE_URL: "https://assets.example.com",
          ASSETS_BUCKET: {
            async put() {
              writes += 1;
            },
          },
        },
        kind: "event",
        ownerId: "event_1",
        filename: "image.png",
        contentType: "image/png",
        data: new ArrayBuffer(0),
      }),
    ).rejects.toThrow();

    expect(writes).toBe(0);
  });

  test("rejects invalid upload files before storage changes", async () => {
    let writes = 0;
    const currentUrl = "https://assets.example.com/existing.png";

    expect(
      uploadAdminAssetFile({
        viewer: viewer("ADMIN"),
        env: {
          PUBLIC_ASSET_BASE_URL: "https://assets.example.com",
          ASSETS_BUCKET: {
            async put() {
              writes += 1;
            },
          },
        },
        kind: "event",
        ownerId: "event_1",
        file: uploadFile({
          name: "bad.txt",
          type: "text/plain",
          size: 100,
        }),
      }),
    ).rejects.toThrow("Upload a JPG");

    expect(writes).toBe(0);
    expect(currentUrl).toBe("https://assets.example.com/existing.png");
  });

  test("returns display metadata for admin uploads", async () => {
    const result = await uploadAdminAsset({
      viewer: viewer("ADMIN"),
      env: {
        PUBLIC_ASSET_BASE_URL: "https://assets.example.com/",
        ASSETS_BUCKET: {
          async put() {},
        },
      },
      kind: "partner",
      ownerId: "partner_1",
      filename: "Logo Final.PNG",
      contentType: "image/png",
      data: new ArrayBuffer(0),
    });

    expect(result.key).toMatch(/^partner\/partner_1\/.+-logo-final.png$/);
    expect(result.url).toBe(`https://assets.example.com/${result.key}`);
    expect(result.contentType).toBe("image/png");
  });

  test("returns upload file metadata for admin forms", async () => {
    const result = await uploadAdminAssetFile({
      viewer: viewer("ADMIN"),
      env: {
        PUBLIC_ASSET_BASE_URL: "https://assets.example.com/",
        ASSETS_BUCKET: {
          async put() {},
        },
      },
      kind: "event",
      ownerId: "event_1",
      file: uploadFile({
        name: "Hero Image.webp",
        type: "image/webp",
        size: 12,
      }),
    });

    expect(result).toMatchObject({
      kind: "event",
      filename: "Hero Image.webp",
      contentType: "image/webp",
    });
    expect(result.url).toBe(`https://assets.example.com/${result.key}`);
  });

  test("validates remote launch URLs", () => {
    expect(validateRemoteAssetUrl("https://example.com/image.png")).toBe(
      "https://example.com/image.png",
    );
    expect(() =>
      validateRemoteAssetUrl("http://example.com/image.png"),
    ).toThrow();
  });

  test("uses the documented default cap when R2_MAX_UPLOAD_BYTES is unset", () => {
    expect(getAdminAssetUploadMaxBytes({})).toBe(ADMIN_ASSET_UPLOAD_MAX_BYTES);
    expect(
      validateAdminAssetUploadFile({
        filename: "x.png",
        contentType: "image/png",
        size: ADMIN_ASSET_UPLOAD_MAX_BYTES,
      }),
    ).toEqual({ ok: true });
    expect(
      validateAdminAssetUploadFile({
        filename: "x.png",
        contentType: "image/png",
        size: ADMIN_ASSET_UPLOAD_MAX_BYTES + 1,
      }),
    ).toMatchObject({ ok: false, field: "file" });
  });

  test("enforces the operator-tuned R2_MAX_UPLOAD_BYTES cap", () => {
    const env = { R2_MAX_UPLOAD_BYTES: "2097152" };
    expect(getAdminAssetUploadMaxBytes(env)).toBe(2 * 1024 * 1024);

    expect(
      validateAdminAssetUploadFile({
        filename: "x.png",
        contentType: "image/png",
        size: 2 * 1024 * 1024,
        env,
      }),
    ).toEqual({ ok: true });

    const rejection = validateAdminAssetUploadFile({
      filename: "x.png",
      contentType: "image/png",
      size: 2 * 1024 * 1024 + 1,
      env,
    });
    expect(rejection.ok).toBe(false);
    if (!rejection.ok) {
      expect(rejection.message).toContain("2 MB");
    }
  });

  test("falls back to the default cap when R2_MAX_UPLOAD_BYTES is invalid", () => {
    expect(getAdminAssetUploadMaxBytes({ R2_MAX_UPLOAD_BYTES: "abc" })).toBe(
      ADMIN_ASSET_UPLOAD_MAX_BYTES,
    );
    expect(getAdminAssetUploadMaxBytes({ R2_MAX_UPLOAD_BYTES: "0" })).toBe(
      ADMIN_ASSET_UPLOAD_MAX_BYTES,
    );
    expect(getAdminAssetUploadMaxBytes({ R2_MAX_UPLOAD_BYTES: "-100" })).toBe(
      ADMIN_ASSET_UPLOAD_MAX_BYTES,
    );
  });
});

function uploadFile(input: { name: string; type: string; size: number }) {
  return {
    ...input,
    async arrayBuffer() {
      return new ArrayBuffer(input.size);
    },
  };
}
