import type {
  PublicDiscoverLayoutPartner,
  PublicDiscoverLayoutProps,
  PublicDiscoverLayoutStat,
} from "./public-discover-layout";

export function makeMockPublicDiscoverLayoutProps(
  overrides: Partial<PublicDiscoverLayoutProps> = {},
): PublicDiscoverLayoutProps {
  const stats: PublicDiscoverLayoutStat[] = [
    { label: "Events this week", value: "12", caption: "across all partners" },
    { label: "Active members", value: "184", caption: "this season" },
    { label: "Saved events", value: "37", caption: "across members" },
  ];
  const partners: PublicDiscoverLayoutPartner[] = [
    { id: "p1", name: "Donau115", address: "Kreuzberg", logoInitial: "D" },
    { id: "p2", name: "SchwuZ", address: "Neukölln", logoInitial: "S" },
  ];
  return {
    copy: {
      activePartners: "Active partners",
      missingVenue: "Missing venue?",
      wantPartner: "Want to partner with Unveiled?",
      tellSupport: "Tell our support team",
    },
    stats,
    partners,
    mailIcon: (
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
        <rect x="3" y="5" width="18" height="14" />
        <path d="M3 7l9 7 9-7" />
      </svg>
    ),
    onTellSupport: () => undefined,
    ...overrides,
  };
}
