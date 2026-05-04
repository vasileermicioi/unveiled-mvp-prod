import { z } from "zod";

export const uiLanguageSchema = z.enum(["DE", "EN"]);
export type UiLanguage = z.infer<typeof uiLanguageSchema>;

export const formMessages = {
  email: {
    DE: "Ungültige Email",
    EN: "Invalid email",
  },
  passwordShort: {
    DE: "Passwort zu kurz (min 6)",
    EN: "Password too short (min 6)",
  },
  passwordRequired: {
    DE: "Password is required.",
    EN: "Password is required.",
  },
  firstNameRequired: {
    DE: "Vorname fehlt",
    EN: "First name required",
  },
  lastNameRequired: {
    DE: "Nachname fehlt",
    EN: "Last name required",
  },
  required: {
    DE: "Dieses Feld ist erforderlich.",
    EN: "This field is required.",
  },
  cardNumber: {
    DE: "Bitte gib eine gültige Kartennummer ein.",
    EN: "Please enter a valid card number.",
  },
  expiry: {
    DE: "Bitte gib ein gültiges Ablaufdatum ein.",
    EN: "Please enter a valid expiry date.",
  },
  cvc: {
    DE: "Bitte gib eine gültige CVC ein.",
    EN: "Please enter a valid CVC.",
  },
  positiveInteger: {
    DE: "Bitte gib eine positive Zahl ein.",
    EN: "Please enter a positive number.",
  },
} as const;

export const safeFormErrorMessages = {
  unauthenticated: "Authentication required.",
  forbidden: "You do not have access to this resource.",
  unavailable: "The request could not be completed.",
  notFound: "The requested item is not available.",
  checkFields: "Check the highlighted fields.",
} as const;

const email = (language: UiLanguage = "EN") =>
  z.string().trim().toLowerCase().email(formMessages.email[language]);

const requiredString = (
  message: string = formMessages.required.EN,
  maxLength = 500,
) => z.string().trim().min(1, message).max(maxLength);

const optionalTrimmedString = (maxLength = 500) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined);

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .refine(
    (value) => !value || value.startsWith("/") || value.startsWith("http"),
    "Enter a valid URL.",
  );

const stringArray = (allowed?: readonly string[]) =>
  z
    .array(z.string().trim().min(1))
    .default([])
    .superRefine((values, ctx) => {
      if (!allowed) return;
      for (const [index, value] of values.entries()) {
        if (!allowed.includes(value)) {
          ctx.addIssue({
            code: "custom",
            path: [index],
            message: "Select an available option.",
          });
        }
      }
    });

export const ageGroupValues = ["18-25", "26-35", "36-50", "50+"] as const;
export const interestValues = [
  "Theater",
  "Kino",
  "Museum",
  "Ausstellung",
  "Konzert",
  "Talk/Lesung",
  "Comedy",
  "Tanz/Performance",
] as const;
export const moodValues = [
  "Leicht",
  "Experimentell",
  "Klassisch",
  "Politisch",
  "Familie",
] as const;
export const districtValues = [
  "Mitte",
  "X-Berg",
  "P-Berg",
  "Charlottenburg",
  "Wedding",
  "F-Hain",
  "Schöneberg",
] as const;
export const timingPreferenceValues = ["After Work", "Weekend", "Day"] as const;
export const preferredDayValues = [
  "Mo",
  "Di",
  "Mi",
  "Do",
  "Fr",
  "Sa",
  "So",
] as const;
export const preferredLanguageValues = ["DE", "EN", "Non-V"] as const;
export const eventLanguageValues = [
  "DE",
  "EN",
  "TR",
  "AR",
  "PL",
  "RU",
  "UK",
  "FR",
  "FA",
  "HI",
  "NON_VERBAL",
] as const;

export const loginSchema = z.object({
  email: email(),
  password: z.string().trim().min(1, formMessages.passwordRequired.EN),
  callbackURL: optionalUrl,
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: email(),
  password: z.string().trim().min(6, formMessages.passwordShort.EN),
  firstName: requiredString(formMessages.firstNameRequired.EN, 120),
  lastName: requiredString(formMessages.lastNameRequired.EN, 120),
  callbackURL: optionalUrl,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const passwordRecoverySchema = z.object({
  email: email(),
  redirectTo: optionalUrl,
});
export type PasswordRecoveryInput = z.infer<typeof passwordRecoverySchema>;

export const preferenceSchema = z.object({
  ageGroup: z.enum(ageGroupValues).optional(),
  interests: stringArray(interestValues),
  moods: stringArray(moodValues),
  districts: stringArray(districtValues),
  maxDistance: z.coerce.number().int().min(0).max(100).default(0),
  timing: stringArray(timingPreferenceValues),
  preferredDays: stringArray(preferredDayValues),
  preferredLanguages: stringArray(preferredLanguageValues),
  accessibility: z.coerce.boolean().default(false),
});
export type PreferenceInput = z.infer<typeof preferenceSchema>;

export const onboardingSchema = preferenceSchema.extend({
  onboardingComplete: z.coerce.boolean().default(true),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const profileSchema = z.object({
  firstName: optionalTrimmedString(120),
  lastName: optionalTrimmedString(120),
  language: uiLanguageSchema.default("DE"),
  billingAddress: optionalTrimmedString(500),
  newsletterOptIn: z.coerce.boolean().default(false),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const paymentMethodSchema = z.enum(["CARD", "PAYPAL", "SEPA"]);

export const membershipSchema = z
  .object({
    paymentMethod: paymentMethodSchema.default("CARD"),
    promoCode: optionalTrimmedString(80),
    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvc: z.string().optional(),
    isFrozen: z.coerce.boolean().default(false),
    isActive: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== "CARD" || data.isFrozen || data.isActive) {
      return;
    }

    const digits = (data.cardNumber || "").replace(/\D/g, "");
    const expiry = (data.expiry || "").trim();
    const cvc = (data.cvc || "").trim();

    if (!digits || digits.length < 12) {
      ctx.addIssue({
        code: "custom",
        path: ["cardNumber"],
        message: formMessages.cardNumber.EN,
      });
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      ctx.addIssue({
        code: "custom",
        path: ["expiry"],
        message: formMessages.expiry.EN,
      });
    }
    if (!/^\d{3}$/.test(cvc)) {
      ctx.addIssue({
        code: "custom",
        path: ["cvc"],
        message: formMessages.cvc.EN,
      });
    }
  });
export type MembershipInput = z.infer<typeof membershipSchema>;

export const partnerFormSchema = z.object({
  id: optionalTrimmedString(120),
  name: requiredString("Name is required", 200),
  contactEmail: email(),
  address: requiredString("Address is required", 500),
  logoUrl: optionalTrimmedString(1000),
  venueCheckInToken: optionalTrimmedString(200),
  portalUserEmail: z.union([email(), z.literal("")]).optional(),
});
export type PartnerFormInput = z.infer<typeof partnerFormSchema>;

export const timingModeSchema = z.enum(["TIME_SLOT", "ALL_DAY"]);
export const ticketTypeSchema = z.enum(["VOUCHER", "SECRET_CODE"]);
export const secretCodeModeSchema = z.enum([
  "MANUAL",
  "SHARED_GENERATED",
  "UNIQUE_PER_BOOKING",
]);

export const eventSeriesSchema = z.object({
  enabled: z.coerce.boolean().default(false),
  count: z.coerce.number().int().min(1).max(52).default(1),
  intervalDays: z.coerce.number().int().min(1).max(365).default(7),
});
export type EventSeriesInput = z.infer<typeof eventSeriesSchema>;

export const eventFormSchema = z
  .object({
    id: optionalTrimmedString(120),
    partnerId: requiredString("Partner host is required.", 120),
    title: requiredString("Title is required.", 200),
    description: z.string().trim().max(5000).default(""),
    category: requiredString("Category is required.", 120),
    eventType: requiredString("Event type is required.", 120),
    dateTime: z.coerce.date(),
    timingMode: timingModeSchema.default("TIME_SLOT"),
    startTimeMinutes: z.coerce.number().int().min(0).max(1439).default(0),
    weekday: z.coerce.number().int().min(0).max(6).default(0),
    address: requiredString("Address is required.", 500),
    neighborhood: requiredString("Neighborhood is required.", 120),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    imageUrl: z.string().trim().max(1000).default(""),
    tags: stringArray(),
    creditPrice: z.coerce
      .number()
      .int()
      .min(0, formMessages.positiveInteger.EN),
    totalCapacity: z.coerce
      .number()
      .int()
      .min(1, formMessages.positiveInteger.EN),
    remainingCapacity: z.coerce.number().int().min(0).optional(),
    ticketType: ticketTypeSchema.default("SECRET_CODE"),
    voucherTemplate: optionalTrimmedString(2000),
    secretCodeRules: optionalTrimmedString(2000),
    secretCode: optionalTrimmedString(200),
    secretCodeMode: secretCodeModeSchema.optional(),
    promoCode: optionalTrimmedString(200),
    eventWebsiteUrl: optionalTrimmedString(1000),
    barrierFree: z.coerce.boolean().default(false),
    languages: stringArray(),
    targetAgeGroups: stringArray(ageGroupValues),
    series: eventSeriesSchema.default({
      enabled: false,
      count: 1,
      intervalDays: 7,
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.remainingCapacity !== undefined &&
      data.remainingCapacity > data.totalCapacity
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["remainingCapacity"],
        message: "Remaining capacity cannot exceed total capacity.",
      });
    }

    if (
      data.ticketType === "SECRET_CODE" &&
      data.secretCodeMode === "MANUAL" &&
      !data.secretCode
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["secretCode"],
        message: "Manual secret code is required.",
      });
    }
  });
export type EventFormInput = z.infer<typeof eventFormSchema>;

export const memberAdminSchema = z.object({
  userId: requiredString("Member is required.", 120),
  role: z.enum(["USER", "ADMIN", "PARTNER"]).optional(),
  subscriptionStatus: z
    .enum([
      "ACTIVE",
      "PAUSED",
      "CANCELLED_PENDING",
      "INACTIVE",
      "PAST_DUE",
      "UNPAID",
    ])
    .optional(),
  creditAdjustment: z.coerce.number().int().min(-10000).max(10000).default(0),
  reason: optionalTrimmedString(500),
});
export type MemberAdminInput = z.infer<typeof memberAdminSchema>;

export const checkInSchema = z.object({
  bookingId: requiredString("Booking is required.", 120),
  partnerId: optionalTrimmedString(120),
});
export type CheckInInput = z.infer<typeof checkInSchema>;
