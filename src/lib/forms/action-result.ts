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
  "Address is required.": "Adresse ist erforderlich.",
  "Partner is required.": "Partner ist erforderlich.",
  "Partner host is required.": "Partner-Host ist erforderlich.",
  "Title is required.": "Titel ist erforderlich.",
  "Category is required.": "Kategorie ist erforderlich.",
  "Event type is required.": "Event-Typ ist erforderlich.",
  "Capacity must be greater than zero": "Kapazität muss größer als Null sein.",
  "Enter a valid URL.": "Gib eine gültige URL ein.",
  "Select an available option.": "Wähle eine verfügbare Option.",
  "Neighborhood is required.": "Stadtteil ist erforderlich.",
  "Manual secret code is required.": "Einlasscode ist erforderlich.",
  "Promo code is required for voucher events.":
    "Promo-Code ist für Voucher-Events erforderlich.",
  "Event website URL is required for voucher events.":
    "Event-Website-URL ist für Voucher-Events erforderlich.",
  "Remaining capacity cannot exceed total capacity.":
    "Die Restkapazität darf die Gesamtkapazität nicht überschreiten.",

  // Action Notices
  "Member updated.": "Mitglied aktualisiert.",
  "Member frozen.": "Mitglied pausiert.",
  "Member unfrozen.": "Mitglied reaktiviert.",
  "Credits adjusted.": "Credits angepasst.",
  "Membership checkout started.": "Mitgliedschafts-Checkout gestartet.",
  "Venue check-in complete.": "Venue-Check-in abgeschlossen.",
  "Guest checked in.": "Gast eingecheckt.",
  "Venue check-in token updated.": "Venue-Check-in-Token aktualisiert.",
  "Partner portal access created.": "Partner-Portalzugriff erstellt.",
  "Partner portal access already exists.":
    "Partner-Portalzugriff existiert bereits.",
  "Partner deleted.": "Partner gelöscht.",
  "Event series created.": "Event-Serie erstellt.",
  "Event saved.": "Event gespeichert.",
  "Event deleted.": "Event gelöscht.",
  "Partner saved.": "Partner gespeichert.",
  "Guest was already checked in.": "Gast war bereits eingecheckt.",
  "Booking was already checked in.": "Buchung war bereits eingecheckt.",

  // Operations and booking validation failures
  "At least one valid time slot is required.":
    "Mindestens ein gültiger Zeitslot ist erforderlich.",
  "Partners with linked events or bookings cannot be deleted.":
    "Partner mit verknüpften Events oder Buchungen können nicht gelöscht werden.",
  "Events with bookings cannot be deleted.":
    "Events mit Buchungen können nicht gelöscht werden.",
  "Booking is not available.": "Buchung ist nicht verfügbar.",
  "Event is not available.": "Event ist nicht verfügbar.",
  "Partner is not available.": "Partner ist nicht verfügbar.",
  "Member is not available.": "Mitglied ist nicht verfügbar.",
  "Only confirmed bookings can be checked in.":
    "Nur bestätigte Buchungen können eingecheckt werden.",
  "Check-in is only available close to the event time.":
    "Check-in ist nur kurz vor dem Event möglich.",
  "No booking is eligible for venue check-in right now.":
    "Aktuell ist keine Buchung für den Venue-Check-in berechtigt.",
  "Invalid venue QR token.": "Ungültiger Venue-QR-Token.",
  "A freeze reason is required.":
    "Ein Grund für die Pausierung ist erforderlich.",
  "A valid email is required.": "Eine gültige E-Mail-Adresse ist erforderlich.",
  "Partner portal user could not be created.":
    "Der Benutzer für das Partner-Portal konnte nicht erstellt werden.",

  // Booking failure states
  "This event is sold out.": "Dieses Event ist ausverkauft.",
  "You do not have enough credits for this booking.":
    "Du hast nicht genügend Credits für diese Buchung.",
  "An active membership is required.":
    "Eine aktive Mitgliedschaft ist erforderlich.",
  "This booking request was already used.":
    "Diese Buchungsanfrage wurde bereits verwendet.",
  "The requested event is not available.":
    "Das angeforderte Event ist nicht verfügbar.",
  "Select between 1 and 3 tickets.": "Wähle zwischen 1 und 3 Tickets.",
  "This event is missing redemption setup.":
    "Für dieses Event ist kein Einlösungsverfahren konfiguriert.",
  "You do not have access to this action.":
    "Du hast keinen Zugriff auf diese Aktion.",
  "The credit adjustment is invalid.": "Die Credit-Anpassung ist ungültig.",

  // Auth/Generic failures
  "Authentication required.": "Authentifizierung erforderlich.",
  "Account profile is not ready.": "Konto-Profil ist nicht bereit.",
  "You do not have access to this resource.":
    "Du hast keinen Zugriff auf diese Ressource.",
  "The request could not be completed.":
    "Die Anfrage konnte nicht abgeschlossen werden.",
  "The requested item is not available.":
    "Das angeforderte Element ist nicht verfügbar.",
  "Email or password is incorrect.":
    "E-Mail-Adresse oder Passwort ist ungültig.",
  "Logged in.": "Eingeloggt.",

  // Zod schemas missing validations
  "Venue token is required.": "Veranstaltungsort-Token ist erforderlich.",
  "Booking is required.": "Buchung ist erforderlich.",
  "Event is required.": "Veranstaltung ist erforderlich.",
  "Booking request key is required.":
    "Buchungsanfrageschlüssel ist erforderlich.",
  "Member is required.": "Mitglied ist erforderlich.",
  "Reason is required.": "Begründung ist erforderlich.",
  "Event ID is required.": "Veranstaltungs-ID ist erforderlich.",
  "View name is required.": "Ansichtsname ist erforderlich.",
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

export function translateMessage(
  message: string,
  language?: import("@/lib/i18n").UiLanguage,
): string {
  if (language === "DE") {
    return enToDeMap[message] || message;
  }
  return message;
}

export function formFailure(
  formError: string,
  language?: import("@/lib/i18n").UiLanguage,
): FormActionFailure {
  return {
    ok: false,
    formError: translateMessage(formError, language),
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
