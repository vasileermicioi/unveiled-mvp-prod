import type { z } from "zod";

export type FieldErrors = Record<string, string>;
export type QueryInvalidationKey = readonly unknown[];
export type QueryInvalidationHint = {
  queryKey: QueryInvalidationKey;
  exact?: boolean;
};

export type ActionNotice = {
  type: "success" | "info";
  message: string;
};

export type FormActionSuccess<TData = undefined> = {
  ok: true;
  fieldErrors?: never;
  formError?: never;
  notice?: ActionNotice;
  data?: TData;
  invalidate?: Array<QueryInvalidationKey | QueryInvalidationHint>;
};

export type FormActionFailure = {
  ok: false;
  fieldErrors?: FieldErrors;
  formError?: string;
  notice?: never;
  data?: never;
  invalidate?: never;
};

export type FormActionResult<TData = undefined> =
  | FormActionSuccess<TData>
  | FormActionFailure;

export type ParsedFormInput<TData> =
  | { ok: true; data: TData }
  | FormActionFailure;

const enToDeMap: Record<string, string> = {
  "Invalid email": "Ungültige Email",
  "Password too short (min 6)": "Passwort zu kurz (min 6)",
  "Password is required.": "Passwort ist erforderlich.",
  "First name required": "Vorname fehlt",
  "Last name required": "Nachname fehlt",
  "This field is required.": "Dieses Feld ist erforderlich.",
  "Please enter a valid card number.":
    "Bitte gib eine gültige Kartennummer ein.",
  "Please enter a valid expiry date.":
    "Bitte gib ein gültiges Ablaufdatum ein.",
  "Please enter a valid CVC.": "Bitte gib eine gültige CVC ein.",
  "Please enter a positive number.": "Bitte gib eine positive Zahl ein.",
  "Choose a payment method.": "Wähle eine Zahlungsmethode.",
  "Name is required": "Name ist erforderlich",
  "Address is required": "Adresse ist erforderlich",
  "Partner is required.": "Partner ist erforderlich.",
  "Partner host is required.": "Partner-Host ist erforderlich.",
  "Title is required.": "Titel ist erforderlich.",
  "Category is required.": "Kategorie ist erforderlich.",
  "Event type is required.": "Event-Typ ist erforderlich.",
  "Capacity must be greater than zero": "Kapazität muss größer als Null sein.",
  "Enter a valid URL.": "Gib eine gültige URL ein.",
  "Select an available option.": "Wähle eine verfügbare Option.",
};

export function fieldPathFromIssue(issue: z.core.$ZodIssue) {
  return issue.path.map(String).join(".");
}

export function fieldErrorsFromZodError(
  error: z.ZodError,
  language?: import("@/lib/i18n").UiLanguage,
): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const path = fieldPathFromIssue(issue);
    if (!path) continue;
    let msg = issue.message;
    if (language === "DE") {
      msg = enToDeMap[msg] || msg;
    }
    fieldErrors[path] ??= msg;
  }

  return fieldErrors;
}

export function validationFailure(
  error: z.ZodError,
  language?: import("@/lib/i18n").UiLanguage,
): FormActionFailure {
  return {
    ok: false,
    fieldErrors: fieldErrorsFromZodError(error, language),
    formError:
      language === "DE"
        ? "Prüfe die markierten Felder."
        : "Check the highlighted fields.",
  };
}

export function formFailure(formError: string): FormActionFailure {
  return {
    ok: false,
    formError,
  };
}

export function actionSuccess<TData = undefined>(
  input: Omit<FormActionSuccess<TData>, "ok"> = {},
): FormActionSuccess<TData> {
  return {
    ok: true,
    ...input,
  };
}

export function parseFormInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
  language?: import("@/lib/i18n").UiLanguage,
): ParsedFormInput<z.infer<TSchema>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error, language);
  return { ok: true, data: parsed.data };
}
