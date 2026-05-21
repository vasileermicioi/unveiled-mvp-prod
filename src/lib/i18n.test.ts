import { describe, expect, test } from "bun:test";

import {
  appCopy,
  copyFor,
  defaultLanguage,
  languageFromCookieHeader,
  normalizeLanguage,
  supportedLanguages,
} from "@/lib/i18n";

describe("bilingual copy dictionary", () => {
  test("supports only German and English with a stable default", () => {
    expect(supportedLanguages).toEqual(["DE", "EN"]);
    expect(defaultLanguage).toBe("EN");
    expect(normalizeLanguage("EN")).toBe("EN");
    expect(normalizeLanguage("FR")).toBe("EN");
  });

  test("reads guest language from the persisted cookie", () => {
    expect(languageFromCookieHeader("foo=1; unveiled_lang=EN; bar=2")).toBe(
      "EN",
    );
    expect(languageFromCookieHeader("unveiled_lang=DE")).toBe("DE");
    expect(languageFromCookieHeader("unveiled_lang=FR")).toBe("EN");
  });

  test("keeps German and English dictionaries structurally aligned", () => {
    expect(Object.keys(appCopy.DE)).toEqual(Object.keys(appCopy.EN));
    expect(appCopy.DE.public.auth.login).toBeTruthy();
    expect(appCopy.EN.public.auth.login).toBeTruthy();
    expect(copyFor("DE").booking.waitlistSuccess).toContain("Warteliste");
    expect(copyFor("EN").booking.waitlistSuccess).toBe("Waitlist success");
  });

  test("covers booking outcome strings in both languages", () => {
    for (const language of supportedLanguages) {
      const booking = copyFor(language).booking;
      expect(booking.success).toBeTruthy();
      expect(booking.waitlistSuccess).toBeTruthy();
      expect(booking.requestFailed).toBeTruthy();
      expect(booking.membershipRequired).toBeTruthy();
      expect(booking.copyCode).toBeTruthy();
    }
  });
});
