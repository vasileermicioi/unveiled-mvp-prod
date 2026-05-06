import { describe, expect, test } from "bun:test";

import { uploadAdminAsset, validateRemoteAssetUrl } from "@/lib/assets/storage";
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

  test("validates remote launch URLs", () => {
    expect(validateRemoteAssetUrl("https://example.com/image.png")).toBe(
      "https://example.com/image.png",
    );
    expect(() =>
      validateRemoteAssetUrl("http://example.com/image.png"),
    ).toThrow();
  });
});
