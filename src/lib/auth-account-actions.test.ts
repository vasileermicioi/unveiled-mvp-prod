import { describe, expect, test } from "bun:test";

import { copyFor, mapAuthError, missingKeyPlaceholder } from "@/lib/i18n";
import { readAuthErrorCode } from "@/lib/auth-account-actions";

describe("auth action error mapping", () => {
  test("readAuthErrorCode extracts the Better Auth body.code", () => {
    expect(readAuthErrorCode({ body: { code: "USER_ALREADY_EXISTS" } })).toBe(
      "USER_ALREADY_EXISTS",
    );
    expect(readAuthErrorCode({ code: "INVALID_EMAIL" })).toBe("INVALID_EMAIL");
    expect(readAuthErrorCode({ body: { code: 42 } })).toBeNull();
    expect(readAuthErrorCode(null)).toBeNull();
    expect(readAuthErrorCode("boom")).toBeNull();
  });

  test("mapAuthError returns the DE entry for a known code", () => {
    expect(mapAuthError("INVALID_EMAIL", "DE")).toBe(
      copyFor("DE").auth.errors.INVALID_EMAIL,
    );
  });

  test("mapAuthError returns the EN entry for a known code", () => {
    expect(mapAuthError("INVALID_EMAIL_OR_PASSWORD", "EN")).toBe(
      copyFor("EN").auth.errors.INVALID_EMAIL_OR_PASSWORD,
    );
    expect(mapAuthError("TOO_MANY_REQUESTS", "EN")).toBe(
      copyFor("EN").auth.errors.TOO_MANY_REQUESTS,
    );
    expect(mapAuthError("USER_ALREADY_EXISTS", "EN")).toBe(
      copyFor("EN").auth.errors.USER_ALREADY_EXISTS,
    );
  });

  test("mapAuthError returns the missing-key placeholder for an unmapped code", () => {
    const warn = console.warn;
    console.warn = () => {};
    try {
      expect(mapAuthError("SOMETHING_NEW", "EN")).toBe(
        missingKeyPlaceholder("auth.errors.SOMETHING_NEW"),
      );
    } finally {
      console.warn = warn;
    }
  });
});
