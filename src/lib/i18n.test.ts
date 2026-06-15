import { describe, expect, test } from "bun:test";

import {
  appCopy,
  copyFor,
  defaultLanguage,
  languageFromCookieHeader,
  mapAuthError,
  missingKeyPlaceholder,
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

  test("AuthFormCopy is type-enforced and complete in DE and EN", () => {
    const de = copyFor("DE").auth.forms;
    const en = copyFor("EN").auth.forms;
    expect(Object.keys(de)).toEqual(Object.keys(en));
    for (const formName of Object.keys(de) as Array<keyof typeof de>) {
      expect(Object.keys(de[formName])).toEqual(Object.keys(en[formName]));
      for (const key of Object.keys(de[formName])) {
        expect(
          (de[formName] as Record<string, string>)[key],
          `DE auth.forms.${formName}.${key} is empty`,
        ).toBeTruthy();
        expect(
          (en[formName] as Record<string, string>)[key],
          `EN auth.forms.${formName}.${key} is empty`,
        ).toBeTruthy();
      }
    }
  });

  test("AuthErrorCopy is type-enforced and complete in DE and EN", () => {
    const de = copyFor("DE").auth.errors;
    const en = copyFor("EN").auth.errors;
    expect(Object.keys(de)).toEqual(Object.keys(en));
    for (const code of Object.keys(de)) {
      expect(
        de[code as keyof typeof de],
        `DE auth.errors.${code} is empty`,
      ).toBeTruthy();
      expect(
        en[code as keyof typeof en],
        `EN auth.errors.${code} is empty`,
      ).toBeTruthy();
    }
  });

  test("mapAuthError returns the localized entry for a known code", () => {
    expect(mapAuthError("INVALID_EMAIL", "DE")).toBe(
      copyFor("DE").auth.errors.INVALID_EMAIL,
    );
    expect(mapAuthError("INVALID_EMAIL", "EN")).toBe(
      copyFor("EN").auth.errors.INVALID_EMAIL,
    );
    expect(mapAuthError("INVALID_EMAIL_OR_PASSWORD", "EN")).toBe(
      copyFor("EN").auth.errors.INVALID_EMAIL_OR_PASSWORD,
    );
  });

  test("mapAuthError falls back to the missing-key placeholder for an unknown code", () => {
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

  test("mapAuthError renders the missing-key placeholder for a non-empty unmapped code", () => {
    const warn = console.warn;
    console.warn = () => {};
    try {
      expect(mapAuthError("SOMETHING_NEW", "EN")).toBe(
        missingKeyPlaceholder("auth.errors.SOMETHING_NEW"),
      );
      expect(mapAuthError(null, "EN")).toBe(
        copyFor("EN").auth.errors.unknown,
      );
      expect(mapAuthError(undefined, "DE")).toBe(
        copyFor("DE").auth.errors.unknown,
      );
    } finally {
      console.warn = warn;
    }
  });
});
