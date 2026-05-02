import "dotenv/config";

import { sql } from "drizzle-orm";

import { db, postgresClient } from "@/db/client";
import { events, partners } from "@/db/schema";

const plusDays = (days: number) => new Date(Date.now() + days * 86_400_000);

const eventTiming = (date: Date) => ({
  startTimeMinutes: date.getHours() * 60 + date.getMinutes(),
  weekday: date.getDay(),
});

const partnerRows = [
  {
    id: "p1",
    name: "Berghain / Panorama Bar",
    address: "Am Wriezener Bahnhof, 10243 Berlin",
    contactEmail: "info@berghain.de",
    logoUrl:
      "https://www.berghain.berlin/media/images/berghain_logo.width-800.png",
    venueCheckInToken: "VENUE-BERGHA-HAUS01",
  },
  {
    id: "p2",
    name: "Volksbuehne",
    address: "Rosa-Luxemburg-Platz, 10178 Berlin",
    contactEmail: "kasse@volksbuehne-berlin.de",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Volksb%C3%BChne_Berlin_Logo.svg/1200px-Volksb%C3%BChne_Berlin_Logo.svg.png",
    venueCheckInToken: "VENUE-VOLKSB-HAUS01",
  },
] satisfies (typeof partners.$inferInsert)[];

const firstEventDate = plusDays(1);
firstEventDate.setHours(23, 20, 0, 0);
const secondEventDate = plusDays(2);
secondEventDate.setHours(19, 0, 0, 0);

const eventRows = [
  {
    id: "e1",
    partnerId: "p1",
    title: "Klubnacht",
    description:
      "The legendary Berghain club night. Industrial techno and unparalleled atmosphere.",
    category: "Kultur",
    eventType: "Konzert",
    dateTime: firstEventDate,
    timingMode: "TIME_SLOT",
    ...eventTiming(firstEventDate),
    address: "Am Wriezener Bahnhof, 10243 Berlin",
    neighborhood: "Friedrichshain",
    lat: 52.5113,
    lng: 13.4431,
    imageUrl:
      "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&q=80&w=800",
    tags: ["Techno", "Nightlife"],
    creditPrice: 5,
    totalCapacity: 50,
    remainingCapacity: 12,
    ticketType: "SECRET_CODE",
    secretCode: "PANORAMA",
    secretCodeMode: "MANUAL",
    barrierFree: false,
    languages: ["DE"],
    targetAgeGroups: [],
  },
  {
    id: "e2",
    partnerId: "p2",
    title: "Die Raeuber",
    description:
      "Schiller's classic reimagined for the modern stage at the iconic Volksbuehne.",
    category: "Theater",
    eventType: "Theater",
    dateTime: secondEventDate,
    timingMode: "TIME_SLOT",
    ...eventTiming(secondEventDate),
    address: "Rosa-Luxemburg-Platz, 10178 Berlin",
    neighborhood: "Mitte",
    lat: 52.5268,
    lng: 13.4116,
    imageUrl:
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
    tags: ["Drama", "Classic"],
    creditPrice: 3,
    totalCapacity: 100,
    remainingCapacity: 45,
    ticketType: "VOUCHER",
    promoCode: "VOLKS25",
    eventWebsiteUrl: "https://www.volksbuehne.berlin/",
    barrierFree: false,
    languages: ["DE"],
    targetAgeGroups: [],
  },
] satisfies (typeof events.$inferInsert)[];

await db
  .insert(partners)
  .values(partnerRows)
  .onConflictDoUpdate({
    target: partners.id,
    set: {
      name: sql`excluded.name`,
      address: sql`excluded.address`,
      contactEmail: sql`excluded.contact_email`,
      logoUrl: sql`excluded.logo_url`,
      venueCheckInToken: sql`excluded.venue_check_in_token`,
      updatedAt: new Date(),
    },
  });

await db
  .insert(events)
  .values(eventRows)
  .onConflictDoUpdate({
    target: events.id,
    set: {
      partnerId: sql`excluded.partner_id`,
      title: sql`excluded.title`,
      description: sql`excluded.description`,
      category: sql`excluded.category`,
      eventType: sql`excluded.event_type`,
      dateTime: sql`excluded.date_time`,
      timingMode: sql`excluded.timing_mode`,
      startTimeMinutes: sql`excluded.start_time_minutes`,
      weekday: sql`excluded.weekday`,
      address: sql`excluded.address`,
      neighborhood: sql`excluded.neighborhood`,
      lat: sql`excluded.lat`,
      lng: sql`excluded.lng`,
      imageUrl: sql`excluded.image_url`,
      tags: sql`excluded.tags`,
      creditPrice: sql`excluded.credit_price`,
      totalCapacity: sql`excluded.total_capacity`,
      remainingCapacity: sql`excluded.remaining_capacity`,
      ticketType: sql`excluded.ticket_type`,
      secretCode: sql`excluded.secret_code`,
      secretCodeMode: sql`excluded.secret_code_mode`,
      promoCode: sql`excluded.promo_code`,
      eventWebsiteUrl: sql`excluded.event_website_url`,
      barrierFree: sql`excluded.barrier_free`,
      languages: sql`excluded.languages`,
      targetAgeGroups: sql`excluded.target_age_groups`,
      updatedAt: new Date(),
    },
  });

console.log(
  `Seeded ${partnerRows.length} partners and ${eventRows.length} events.`,
);

await postgresClient.end();
