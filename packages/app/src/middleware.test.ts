import { describe, expect, test } from "bun:test";
import { APP_BASE_PREFIX, stripAppBase } from "~/lib/app-base";

describe("app base prefix handling", () => {
  test("APP_BASE_PREFIX is /app to match astro.config.mjs", () => {
    expect(APP_BASE_PREFIX).toBe("/app");
  });

  test("stripAppBase removes the /app prefix from a prefixed path", () => {
    expect(stripAppBase("/app/en/discover")).toBe("/en/discover");
    expect(stripAppBase("/app/en/")).toBe("/en/");
    expect(stripAppBase("/app/de/bookings?status=upcoming")).toBe(
      "/de/bookings?status=upcoming",
    );
  });

  test("stripAppBase returns / for the bare /app path", () => {
    expect(stripAppBase("/app")).toBe("/");
  });

  test("stripAppBase returns the path unchanged when it has no /app prefix", () => {
    expect(stripAppBase("/en/discover")).toBe("/en/discover");
    expect(stripAppBase("/")).toBe("/");
    expect(stripAppBase("/api/openapi.json")).toBe("/api/openapi.json");
  });

  test("stripAppBase does not match /apple or /application (only the exact prefix)", () => {
    expect(stripAppBase("/apple")).toBe("/apple");
    expect(stripAppBase("/application/en")).toBe("/application/en");
  });
});
