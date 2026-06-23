import { describe, expect, test } from "bun:test";

import { APP_BASE_PREFIX, stripAppBase } from "~/lib/app-base";

describe("app-base", () => {
  test("APP_BASE_PREFIX is /app", () => {
    expect(APP_BASE_PREFIX).toBe("/app");
  });

  describe("stripAppBase", () => {
    test("strips /app prefix from a nested path", () => {
      expect(stripAppBase("/app/en/discover")).toBe("/en/discover");
    });

    test("returns / for the exact /app case", () => {
      expect(stripAppBase("/app")).toBe("/");
    });

    test("returns / for the trailing-slash /app/ case", () => {
      expect(stripAppBase("/app/")).toBe("/");
    });

    test("leaves a path without the base unchanged", () => {
      expect(stripAppBase("/en/discover")).toBe("/en/discover");
    });

    test("leaves a path that merely starts with /app but is not the base unchanged (rejects /apple)", () => {
      expect(stripAppBase("/apple")).toBe("/apple");
    });
  });
});
