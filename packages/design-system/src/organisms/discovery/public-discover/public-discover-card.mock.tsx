import type {
  PublicDiscoverCardEvent,
  PublicDiscoverCardProps,
} from "./public-discover-card";

const MockEvent: PublicDiscoverCardEvent = {
  id: "evt-001",
  title: "Late Night Jazz at Donau115",
  imageUrl: null,
  partnerName: "Donau115",
  category: "Music",
  capacityLabel: "32 / 40 seats",
  ticketType: "Standing",
  creditPrice: 4,
  dateLabel: "Fri 24 Oct · 21:00",
  neighborhood: "Kreuzberg",
  ctaLabel: "Reserve",
  saved: false,
  remainingCapacity: 8,
};

export function makeMockPublicDiscoverCardProps(
  overrides: Partial<PublicDiscoverCardProps> = {},
): PublicDiscoverCardProps {
  return {
    event: { ...MockEvent },
    compact: true,
    creditsLabel: "credits",
    savedLabel: "Saved",
    saveLabel: "Save",
    calendarIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="5" width="18" height="16" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
      </svg>
    ),
    mapPinIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 22s8-7.6 8-13a8 8 0 1 0-16 0c0 5.4 8 13 8 13z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    bookmarkIcon: (
      // source: lucide-static
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 4v17l7-4 7 4V4z" />
      </svg>
    ),
    fallbackImage: "/app/logos/unveiled-logo-black.svg",
    onOpen: () => undefined,
    onSave: () => undefined,
    onClick: () => undefined,
    ...overrides,
  };
}
