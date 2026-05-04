import { describe, expect, test } from "bun:test";

import {
  checkInSchema,
  deletePartnerSchema,
  eventFormSchema,
  loginSchema,
  memberAdminSchema,
  membershipSchema,
  onboardingSchema,
  partnerFormSchema,
  partnerPortalAccessSchema,
  partnerTokenSchema,
  signupSchema,
  venueQrCheckInSchema,
} from "@/lib/forms/schemas";

describe("form schemas", () => {
  test("validates auth fields with visible messages", () => {
    expect(
      signupSchema.safeParse({ email: "bad", password: "123" }).success,
    ).toBe(false);

    const valid = signupSchema.parse({
      email: "USER@EXAMPLE.COM",
      password: "123456",
      firstName: "Alex",
      lastName: "Morgan",
    });

    expect(valid.email).toBe("user@example.com");
    expect(
      loginSchema.safeParse({ email: "user@example.com", password: "" })
        .success,
    ).toBe(false);
  });

  test("validates onboarding preferences without persistence-only fields", () => {
    const parsed = onboardingSchema.parse({
      ageGroup: "26-35",
      interests: ["Theater"],
      moods: ["Leicht"],
      districts: ["Mitte"],
      maxDistance: "10",
      timing: ["After Work"],
      preferredDays: ["Fr"],
      preferredLanguages: ["DE"],
      accessibility: false,
      onboardingComplete: true,
      userId: "not-accepted",
    });

    expect(parsed.maxDistance).toBe(10);
    expect("userId" in parsed).toBe(false);
  });

  test("validates membership placeholder card fields", () => {
    expect(
      membershipSchema.safeParse({
        paymentMethod: "CARD",
        cardNumber: "1",
        expiry: "12/30",
        cvc: "123",
      }).success,
    ).toBe(false);

    expect(
      membershipSchema.safeParse({
        paymentMethod: "PAYPAL",
      }).success,
    ).toBe(true);
  });

  test("validates partner, event series, member admin, and check-in inputs", () => {
    expect(
      partnerFormSchema.safeParse({
        name: "Venue",
        contactEmail: "partner@example.com",
        address: "Berlin",
      }).success,
    ).toBe(true);

    const event = eventFormSchema.parse({
      partnerId: "partner-1",
      title: "Event",
      category: "Theater",
      eventType: "Drop",
      dateTime: "2026-05-04T19:00:00.000Z",
      address: "Berlin",
      neighborhood: "Mitte",
      creditPrice: 2,
      totalCapacity: 10,
      ticketType: "SECRET_CODE",
      secretCodeMode: "MANUAL",
      secretCode: "UNVEILED",
      series: {
        enabled: true,
        count: 3,
        intervalDays: 7,
        slotIsoDateTimes: ["2026-05-04T19:00:00.000Z"],
      },
    });

    expect(event.series.count).toBe(3);
    expect(event.series.slotIsoDateTimes).toEqual(["2026-05-04T19:00:00.000Z"]);
    expect(
      eventFormSchema.safeParse({
        partnerId: "partner-1",
        title: "Event",
        category: "Theater",
        eventType: "Drop",
        dateTime: "2026-05-04T19:00:00.000Z",
        address: "Berlin",
        neighborhood: "Mitte",
        creditPrice: 2,
        totalCapacity: 10,
        ticketType: "VOUCHER",
        promoCode: "",
        eventWebsiteUrl: "",
      }).success,
    ).toBe(false);
    expect(
      memberAdminSchema.safeParse({ userId: "user-1", creditAdjustment: 1 })
        .success,
    ).toBe(true);
    expect(checkInSchema.safeParse({ bookingId: "booking-1" }).success).toBe(
      true,
    );
    expect(
      venueQrCheckInSchema.safeParse({
        partnerId: "partner-1",
        venueToken: "token",
      }).success,
    ).toBe(true);
    expect(
      partnerPortalAccessSchema.safeParse({
        partnerId: "partner-1",
        email: "partner@example.com",
      }).success,
    ).toBe(true);
    expect(
      partnerTokenSchema.safeParse({ partnerId: "partner-1" }).success,
    ).toBe(true);
    expect(
      deletePartnerSchema.safeParse({ partnerId: "partner-1" }).success,
    ).toBe(true);
  });
});
