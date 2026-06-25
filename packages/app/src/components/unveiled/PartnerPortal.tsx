import { actions } from "astro:actions";
import {
  Button,
  type PartnerPortalFiltersCopy,
  PartnerPortalFiltersPresentational,
  type PartnerPortalGuestRow,
  type PartnerPortalHeaderCopy,
  PartnerPortalHeaderPresentational,
  PartnerPortalListPresentational,
} from "@unveiled/design-system";
import { Check, Download, QrCode } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  downloadCsv,
  LanguageContext,
  runServerAction,
  useCopy,
  useLiveData,
} from "./context";

export function PartnerPortal() {
  const copy = useCopy().admin;
  const selectedLanguage = useContext(LanguageContext);
  const live = useLiveData();
  const [checkInMessage, setCheckInMessage] = useState<string>(
    copy.checkInDefault,
  );
  useEffect(() => {
    setCheckInMessage(copy.checkInDefault);
  }, [copy.checkInDefault]);
  const [guestSearch, setGuestSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const filteredGuests = useMemo(() => {
    const search = guestSearch.trim().toLowerCase();
    return live.partnerGuests.filter((guest) => {
      const matchesSearch =
        !search ||
        [guest.name, guest.email, guest.eventTitle, guest.exportCode]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesEvent = !eventFilter || guest.eventId === eventFilter;
      return matchesSearch && matchesEvent;
    });
  }, [eventFilter, guestSearch, live.partnerGuests]);

  const headerCopy: PartnerPortalHeaderCopy = {
    portalBadge: copy.partnerPortal,
    addressUnavailable: copy.addressUnavailable,
    venueQrLabel: copy.venueQr,
    missingTokenLabel: copy.missingToken,
  };

  const filtersCopy: PartnerPortalFiltersCopy = {
    searchGuestsLabel: copy.searchGuests,
    placeholderSearch: copy.placeholderSearch,
    eventLabel: copy.event,
    allEventsLabel: copy.allEvents,
    downloadCsvLabel: copy.downloadCsv,
  };

  const guestRows: PartnerPortalGuestRow[] = filteredGuests.map((guest) => ({
    bookingId: guest.bookingId,
    name: guest.name,
    email: guest.email,
    eventTitle: guest.eventTitle,
    statusBadge: (
      <span
        className={
          guest.statusLabel === "Waitlist"
            ? "inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-grey px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark"
            : "inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-yellow px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark"
        }
      >
        {guest.statusLabel === "Waitlist"
          ? selectedLanguage === "DE"
            ? "Warteliste"
            : "Waitlist"
          : guest.statusLabel === "Confirmed"
            ? selectedLanguage === "DE"
              ? "Bestätigt"
              : "Confirmed"
            : guest.statusLabel === "Cancelled"
              ? selectedLanguage === "DE"
                ? "Storniert"
                : "Cancelled"
              : guest.statusLabel}
      </span>
    ),
    actionButton: (
      <Button
        type="button"
        className="ui-38864ed6"
        variant={guest.checkedInLabel === "Checked in" ? "copied" : "primary"}
        disabled={guest.checkInDisabled}
        onClick={() =>
          void runServerAction(
            () =>
              actions.checkInBooking({
                bookingId: guest.bookingId,
                partnerId: live.partner?.id ?? "",
              }),
            setCheckInMessage,
            live.refetchActiveSurface,
          )
        }
      >
        {guest.checkedInLabel === "Checked in"
          ? selectedLanguage === "DE"
            ? "Eingecheckt"
            : "Checked in"
          : guest.checkedInLabel === "Check-in available"
            ? selectedLanguage === "DE"
              ? "Check-in verfügbar"
              : "Check-in available"
            : guest.checkedInLabel === "Closed"
              ? selectedLanguage === "DE"
                ? "Geschlossen"
                : "Closed"
              : guest.checkedInLabel}
      </Button>
    ),
  }));

  return (
    <div className="ui-e400b83c">
      <PartnerPortalHeaderPresentational
        copy={headerCopy}
        partnerName={live.partner?.name ?? copy.partnerPortal}
        partnerAddress={live.partner?.address ?? null}
        stats={{
          label: copy.totalGuests,
          value: live.partnerGuestTotal.replace(" guests", ""),
          caption: copy.acrossSelected,
        }}
        qrIcon={<QrCode className="ui-ebd37e04" />}
        checkIcon={<Check className="ui-100c22d5" />}
        venueQrUrl={live.partner?.venueQrUrl ?? null}
      />
      <PartnerPortalFiltersPresentational
        copy={filtersCopy}
        searchValue={guestSearch}
        eventFilter={eventFilter}
        eventOptions={live.partnerEventOptions}
        searchInputId="partner-portal-search"
        eventSelectId="partner-portal-event"
        downloadIcon={<Download className="ui-100c22d5" />}
        onSearchChange={setGuestSearch}
        onEventChange={setEventFilter}
        onDownload={() =>
          void runServerAction(
            () =>
              actions.getPartnerBookingExportRows({
                eventId: eventFilter || undefined,
              }),
            setCheckInMessage,
            (data: { rows: Array<Record<string, unknown>> } | undefined) => {
              const downloaded = downloadCsv(
                "partner-guests.csv",
                data?.rows ?? [],
                [
                  "bookingId",
                  "userId",
                  "event",
                  "code",
                  "status",
                  "tickets",
                  "createdAt",
                ],
              );
              setCheckInMessage(
                downloaded
                  ? selectedLanguage === "DE"
                    ? "CSV-Export heruntergeladen."
                    : "CSV export downloaded."
                  : selectedLanguage === "DE"
                    ? "Keine Export-Zeilen."
                    : "No export rows.",
              );
            },
          )
        }
      />
      <PartnerPortalListPresentational
        guestLabel={copy.guest}
        eventLabel={copy.event}
        statusLabel={copy.status}
        actionLabel={copy.action}
        checkInStatusLabel={copy.checkInStatus}
        isLoading={live.isLoading}
        isError={live.isError}
        noGuestsTitle={copy.noGuests}
        dataLoadErrorText={copy.dataLoadError}
        emptyStateText={copy.emptyStateMessage}
        rows={guestRows}
        checkInStatusMessage={checkInMessage}
      />
    </div>
  );
}
