export type EventCardView = {
  id: string;
  title: string;
  partnerName: string;
  category: string;
  dateLabel: string;
  neighborhood: string;
  address: string;
  imageUrl: string;
  creditPrice: number;
  remainingCapacity: number;
  capacityLabel: string;
  ticketType: "Secret code" | "Voucher" | "Waitlist";
  description: string;
  saved: boolean;
  ctaLabel: string;
  mapLabel: string;
};

export type BookingCardView = {
  id: string;
  eventTitle: string;
  dateLabel: string;
  partnerName: string;
  ticketCount: number;
  statusLabel: string;
  redemptionCode: string;
  checkedInLabel: string;
  copied: boolean;
};

export type GuestRowView = {
  name: string;
  email: string;
  eventTitle: string;
  tickets: number;
  statusLabel: string;
  checkedInLabel: string;
};

export type AdminEventRowView = {
  title: string;
  partnerName: string;
  dateLabel: string;
  capacityLabel: string;
  statusLabel: string;
};

export const events: EventCardView[] = [
  {
    id: "neon-gallery",
    title: "Neon Gallery After Hours",
    partnerName: "Kunsthalle Mitte",
    category: "Art",
    dateLabel: "Tonight, 20:00",
    neighborhood: "Mitte",
    address: "Auguststrasse 24, 10117 Berlin",
    imageUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    creditPrice: 2,
    remainingCapacity: 18,
    capacityLabel: "18 available",
    ticketType: "Secret code",
    description:
      "A private after-hours walkthrough with sound pieces, welcome drinks, and a closing artist conversation.",
    saved: true,
    ctaLabel: "Book now",
    mapLabel: "Mitte gallery cluster",
  },
  {
    id: "listening-room",
    title: "Hidden Listening Room",
    partnerName: "Studio Lobe",
    category: "Music",
    dateLabel: "Tomorrow, 21:30",
    neighborhood: "Wedding",
    address: "Bottgerstrasse 16, 13357 Berlin",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
    creditPrice: 3,
    remainingCapacity: 0,
    capacityLabel: "Waitlist",
    ticketType: "Waitlist",
    description:
      "A low-lit studio session with two live sets, guest selectors, and limited standing capacity.",
    saved: false,
    ctaLabel: "Join waitlist",
    mapLabel: "Wedding sound room",
  },
  {
    id: "chef-counter",
    title: "Chef Counter Preview",
    partnerName: "Table 17",
    category: "Food",
    dateLabel: "Fri, 19:00",
    neighborhood: "Kreuzberg",
    address: "Oranienstrasse 17, 10999 Berlin",
    imageUrl:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80",
    creditPrice: 4,
    remainingCapacity: 6,
    capacityLabel: "6 seats",
    ticketType: "Voucher",
    description:
      "A compact counter tasting built around seasonal plates and a partner voucher redemption flow.",
    saved: false,
    ctaLabel: "Unlock event",
    mapLabel: "Kreuzberg table",
  },
];

export const bookings: BookingCardView[] = [
  {
    id: "booking-1",
    eventTitle: "Neon Gallery After Hours",
    dateLabel: "Tonight, 20:00",
    partnerName: "Kunsthalle Mitte",
    ticketCount: 2,
    statusLabel: "Confirmed",
    redemptionCode: "UNVEILED",
    checkedInLabel: "Not checked in",
    copied: true,
  },
  {
    id: "booking-2",
    eventTitle: "Chef Counter Preview",
    dateLabel: "Fri, 19:00",
    partnerName: "Table 17",
    ticketCount: 1,
    statusLabel: "Voucher issued",
    redemptionCode: "UNV-BER-25",
    checkedInLabel: "Checked in 18:42",
    copied: false,
  },
];

export const partnerGuests: GuestRowView[] = [
  {
    name: "Mira Lang",
    email: "mira@example.com",
    eventTitle: "Neon Gallery After Hours",
    tickets: 2,
    statusLabel: "Confirmed",
    checkedInLabel: "Ready",
  },
  {
    name: "Jonas Feld",
    email: "jonas@example.com",
    eventTitle: "Chef Counter Preview",
    tickets: 1,
    statusLabel: "Voucher",
    checkedInLabel: "Checked in",
  },
  {
    name: "Lea Brandt",
    email: "lea@example.com",
    eventTitle: "Hidden Listening Room",
    tickets: 1,
    statusLabel: "Waitlist",
    checkedInLabel: "Disabled",
  },
];

export const adminEvents: AdminEventRowView[] = [
  {
    title: "Neon Gallery After Hours",
    partnerName: "Kunsthalle Mitte",
    dateLabel: "Tonight, 20:00",
    capacityLabel: "42 / 60",
    statusLabel: "Published",
  },
  {
    title: "Hidden Listening Room",
    partnerName: "Studio Lobe",
    dateLabel: "Tomorrow, 21:30",
    capacityLabel: "24 / 24",
    statusLabel: "Waitlist",
  },
  {
    title: "Chef Counter Preview",
    partnerName: "Table 17",
    dateLabel: "Fri, 19:00",
    capacityLabel: "10 / 16",
    statusLabel: "Draft",
  },
];

export const profile = {
  name: "Alex Morgan",
  email: "alex@example.com",
  membershipStatus: "Active member",
  credits: 8,
  monthlyCredits: 10,
  billingLabel: "Renews on 04 May",
  vibes: ["Gallery openings", "Listening rooms", "Food previews"],
};

export const formContracts = {
  landing: {
    requiredFields: ["Email", "Password", "First name", "Last name"],
    visibleMessages: [
      "Email is required",
      "Password must be at least 8 characters",
      "First name is required for signup",
    ],
  },
  partner: {
    requiredFields: ["Venue name", "Contact email", "Neighborhood"],
    visibleMessages: [
      "Venue name is required",
      "Upload a logo before publishing",
    ],
  },
  event: {
    requiredFields: ["Title", "Partner", "Date", "Time", "Credits", "Capacity"],
    visibleMessages: [
      "Title is required",
      "Capacity must be greater than zero",
    ],
  },
};

export const derivedValues = {
  activeRangeLabel: "Today",
  visibleEventCount: `${events.length} visible events`,
  totalCreditsLabel: `${profile.credits} credits`,
  publicStats: [
    { label: "Events this week", value: "24", caption: "Curated by the team" },
    { label: "Partner venues", value: "18", caption: "Across Berlin" },
    { label: "Credits included", value: "10", caption: "Every month" },
  ],
  guestTotal: `${partnerGuests.reduce((sum, guest) => sum + guest.tickets, 0)} guests`,
  dashboardMetrics: [
    { label: "Bookings", value: "148", caption: "Last 7 days" },
    { label: "Credits burned", value: "392", caption: "Confirmed access" },
    { label: "Waitlist", value: "31", caption: "Across live events" },
  ],
  seriesPreview: [
    "Mon 04 May, 19:00",
    "Wed 06 May, 19:00",
    "Fri 08 May, 21:00",
    "Mon 11 May, 19:00",
    "Wed 13 May, 19:00",
  ],
};
