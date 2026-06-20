import { describe, expect, test } from "bun:test";

import type { Db } from "~/db/client";
import {
  isOperationFailure,
  saveAdminEvent,
  saveAdminPartner,
} from "~/lib/admin-operations";
import type { EventFormInput, PartnerFormInput } from "~/lib/forms/schemas";

describe("admin operation result helpers", () => {
  test("identifies safe operation failures", () => {
    expect(
      isOperationFailure({
        state: "unauthorized",
        message: "You do not have access to this resource.",
      }),
    ).toBe(true);
  });

  test("keeps success results distinct from typed failures", () => {
    expect(
      isOperationFailure({
        state: "success",
        message: "Guest checked in.",
        bookingId: "booking-1",
      }),
    ).toBe(false);
  });

  test("persists uploaded asset URLs through admin save inputs", async () => {
    const uploadedEventUrl = "https://assets.example.com/event/hero.webp";
    const uploadedLogoUrl = "https://assets.example.com/partner/logo.png";
    const eventWrites: Array<Record<string, unknown>> = [];
    const partnerWrites: Array<Record<string, unknown>> = [];

    const eventResult = await saveAdminEvent(
      eventInput({ imageUrl: uploadedEventUrl }),
      {
        query: {
          partners: {
            async findFirst() {
              return { id: "partner-1" };
            },
          },
        },
        insert() {
          return {
            async values(values: Array<Record<string, unknown>>) {
              eventWrites.push(...values);
            },
          };
        },
      } as unknown as Db,
    );

    const partnerResult = await saveAdminPartner(
      partnerInput({ logoUrl: uploadedLogoUrl }),
      {
        insert() {
          return {
            async values(value: Record<string, unknown>) {
              partnerWrites.push(value);
            },
          };
        },
      } as unknown as Db,
    );

    expect(eventResult.state).toBe("success");
    expect(eventWrites[0]?.imageUrl).toBe(uploadedEventUrl);
    expect(partnerResult.state).toBe("success");
    expect(partnerWrites[0]?.logoUrl).toBe(uploadedLogoUrl);
  });
});

function eventInput(overrides: Partial<EventFormInput> = {}): EventFormInput {
  return {
    id: undefined,
    partnerId: "partner-1",
    title: "Uploaded Event",
    description: "Event with uploaded image",
    category: "Art",
    eventType: "Drop",
    dateTime: new Date("2026-06-01T18:00:00.000Z"),
    timingMode: "TIME_SLOT",
    startTimeMinutes: 1080,
    weekday: 1,
    address: "Berlin",
    neighborhood: "Mitte",
    imageUrl: "",
    tags: [],
    creditPrice: 2,
    totalCapacity: 10,
    remainingCapacity: undefined,
    ticketType: "SECRET_CODE",
    voucherTemplate: undefined,
    secretCodeRules: undefined,
    secretCodeMode: "MANUAL",
    secretCode: "UNVEILED",
    promoCode: undefined,
    eventWebsiteUrl: undefined,
    barrierFree: false,
    languages: ["DE"],
    targetAgeGroups: ["26-35"],
    series: {
      enabled: false,
      count: 1,
      intervalDays: 7,
      slotIsoDateTimes: [],
    },
    ...overrides,
  };
}

function partnerInput(
  overrides: Partial<PartnerFormInput> = {},
): PartnerFormInput {
  return {
    id: undefined,
    name: "Uploaded Partner",
    contactEmail: "partner@example.com",
    address: "Berlin",
    logoUrl: undefined,
    venueCheckInToken: undefined,
    ...overrides,
  };
}
