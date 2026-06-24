import type {
  PartnerPortalFiltersCopy,
  PartnerPortalFiltersProps,
  PartnerPortalGuestRow,
  PartnerPortalHeaderCopy,
  PartnerPortalHeaderProps,
  PartnerPortalListCopy,
  PartnerPortalStatPanelData,
} from "./partner-portal";

const QrIconMock = (
  // source: lucide-static
  <svg
    aria-hidden="true"
    className="size-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <line x1="14" y1="14" x2="21" y2="14" />
    <line x1="14" y1="14" x2="14" y2="21" />
    <line x1="21" y1="14" x2="21" y2="21" />
  </svg>
);

const CheckIconMock = (
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
    <polyline points="5 12 10 17 19 7" />
  </svg>
);

const DownloadIconMock = (
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
    <path d="M12 4v12" />
    <polyline points="7 11 12 16 17 11" />
    <path d="M5 20h14" />
  </svg>
);

const WaitlistBadge = (
  <span className="inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-grey px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark">
    Waitlist
  </span>
);

const ActionButtonMock = (
  <button
    type="button"
    className="w-full md:w-auto inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-brand-dark px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-brand-yellow hover:text-brand-dark focus-visible:ring-4 focus-visible:ring-brand-dark/25"
  >
    Check in
  </button>
);

export function makeMockPartnerPortalHeaderProps(
  overrides: Partial<PartnerPortalHeaderProps> = {},
): PartnerPortalHeaderProps {
  const copy: PartnerPortalHeaderCopy = {
    portalBadge: "Partner portal",
    addressUnavailable: "Address unavailable",
    venueQrLabel: "Venue QR",
    missingTokenLabel: "QR token not configured",
  };
  const stats: PartnerPortalStatPanelData = {
    label: "Total guests",
    value: "184",
    caption: "across selected",
  };
  return {
    copy,
    partnerName: "Donau115",
    partnerAddress: "Kreuzberg, Berlin",
    stats,
    qrIcon: QrIconMock,
    checkIcon: CheckIconMock,
    venueQrUrl: null,
    ...overrides,
  };
}

export function makeMockPartnerPortalFiltersProps(
  overrides: Partial<PartnerPortalFiltersProps> = {},
): PartnerPortalFiltersProps {
  const copy: PartnerPortalFiltersCopy = {
    searchGuestsLabel: "Search guests",
    placeholderSearch: "Search by name, email, code…",
    eventLabel: "Event",
    allEventsLabel: "All events",
    downloadCsvLabel: "Download CSV",
  };
  return {
    copy,
    searchValue: "",
    eventFilter: "",
    eventOptions: [
      { id: "evt-1", title: "Late Night Jazz at Donau115" },
      { id: "evt-2", title: "Vinyl Listening Room" },
    ],
    searchInputId: "partner-portal-search-mock",
    eventSelectId: "partner-portal-event-mock",
    downloadIcon: DownloadIconMock,
    onSearchChange: () => undefined,
    onEventChange: () => undefined,
    onDownload: () => undefined,
    ...overrides,
  };
}

export function makeMockPartnerPortalListProps(
  overrides: Partial<PartnerPortalListCopy> = {},
): PartnerPortalListCopy {
  const rows: PartnerPortalGuestRow[] = [
    {
      bookingId: "bk-1",
      name: "Pat Morgan",
      email: "pat@example.com",
      eventTitle: "Late Night Jazz at Donau115",
      statusBadge: WaitlistBadge,
      actionButton: ActionButtonMock,
    },
    {
      bookingId: "bk-2",
      name: "Alex Rivera",
      email: "alex@example.com",
      eventTitle: "Vinyl Listening Room",
      statusBadge: WaitlistBadge,
      actionButton: ActionButtonMock,
    },
  ];
  return {
    guestLabel: "Guest",
    eventLabel: "Event",
    statusLabel: "Status",
    actionLabel: "Action",
    checkInStatusLabel: "Check-in status",
    isLoading: false,
    isError: false,
    noGuestsTitle: "No guests yet",
    dataLoadErrorText: "We could not load the guest list.",
    emptyStateText: "When guests book, they'll appear here.",
    rows,
    checkInStatusMessage: "Ready",
    ...overrides,
  };
}
