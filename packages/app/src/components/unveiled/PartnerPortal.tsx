import { actions } from "astro:actions";
import {
  Badge,
  Button,
  type PartnerPortalFiltersCopy,
  PartnerPortalFiltersPresentational,
  type PartnerPortalGuestRow,
  type PartnerPortalHeaderCopy,
  PartnerPortalHeaderPresentational,
  PartnerPortalListPresentational,
  ShellStatusBannerPresentational,
} from "@unveiled/design-system";
import { Check, Download, QrCode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  downloadCsv,
  Pagination,
  runServerAction,
  useCopy,
  useLiveData,
} from "./context";

export function PartnerPortal() {
  const allCopy = useCopy();
  const copy = allCopy.admin;
  const partnerCopy = allCopy.partner;
  const live = useLiveData();
  const [checkInMessage, setCheckInMessage] = useState<string>(
    copy.checkInDefault,
  );
  useEffect(() => {
    setCheckInMessage(copy.checkInDefault);
  }, [copy.checkInDefault]);
  const [guestSearch, setGuestSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [rowErrors, setRowErrors] = useState<Map<string, string>>(new Map());

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

  useEffect(() => {
    setRowErrors((prev) => {
      const visibleBookingIds = new Set(filteredGuests.map((g) => g.bookingId));
      const usedBookingIds = new Set(
        filteredGuests
          .filter((g) => g.statusRaw === "USED")
          .map((g) => g.bookingId),
      );
      let mutated = false;
      const next = new Map(prev);
      for (const bookingId of Array.from(prev.keys())) {
        if (
          !visibleBookingIds.has(bookingId) ||
          usedBookingIds.has(bookingId)
        ) {
          next.delete(bookingId);
          mutated = true;
        }
      }
      return mutated ? next : prev;
    });
  }, [filteredGuests]);

  const setRowError = (bookingId: string, message: string) => {
    setRowErrors((prev) => {
      const next = new Map(prev);
      next.set(bookingId, message);
      return next;
    });
  };

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

  const handleCheckIn = async (bookingId: string) => {
    if (!live.partner?.id) return;
    setRowErrors((prev) => {
      if (!prev.has(bookingId)) return prev;
      const next = new Map(prev);
      next.delete(bookingId);
      return next;
    });
    await runServerAction(
      () =>
        actions.checkInBooking({
          bookingId,
          partnerId: live.partner?.id ?? "",
        }),
      setCheckInMessage,
      live.refetchActiveSurface,
      (_fieldErrors, formError) => {
        if (formError) setRowError(bookingId, formError);
      },
    );
  };

  const guestRows: PartnerPortalGuestRow[] = filteredGuests.map((guest) => {
    const isUsed = guest.statusRaw === "USED";
    const errorMessage = rowErrors.get(guest.bookingId);
    const statusLabel =
      guest.statusLabel === "Waitlist"
        ? partnerCopy.statusLabels.waitlist
        : guest.statusLabel === "Confirmed"
          ? partnerCopy.statusLabels.confirmed
          : guest.statusLabel === "Cancelled"
            ? partnerCopy.statusLabels.cancelled
            : guest.statusLabel;
    const checkInLabel =
      guest.checkedInLabel === "Checked in"
        ? partnerCopy.actionLabels.checkedIn
        : guest.checkedInLabel === "Check-in available"
          ? partnerCopy.actionLabels.checkInAvailable
          : guest.checkedInLabel === "Closed"
            ? partnerCopy.actionLabels.closed
            : guest.checkedInLabel;
    return {
      bookingId: guest.bookingId,
      name: guest.name,
      email: guest.email,
      eventTitle: guest.eventTitle,
      statusBadge: (
        <>
          <span
            className={
              guest.statusLabel === "Waitlist"
                ? "inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-grey px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark"
                : "inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-yellow px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark"
            }
          >
            {statusLabel}
          </span>
          {isUsed ? <Badge tone="dark">{partnerCopy.alreadyUsed}</Badge> : null}
        </>
      ),
      actionButton: (
        <Button
          type="button"
          className="ui-38864ed6"
          variant={guest.checkedInLabel === "Checked in" ? "copied" : "primary"}
          disabled={guest.checkInDisabled || isUsed}
          onClick={() => void handleCheckIn(guest.bookingId)}
        >
          {checkInLabel}
        </Button>
      ),
      errorBanner: errorMessage ? (
        <ShellStatusBannerPresentational
          type="error"
          title={partnerCopy.checkInFailed}
          body={errorMessage}
          data-testid={`partner-checkin-error-${guest.bookingId}`}
        />
      ) : undefined,
    };
  });

  return (
    <div className="ui-e400b83c">
      <PartnerPortalHeaderPresentational
        copy={headerCopy}
        partnerName={live.partner?.name ?? copy.partnerPortal}
        partnerAddress={live.partner?.address ?? null}
        stats={{
          label: copy.totalGuests,
          value: `${live.partnerGuestsTotalCount}`,
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
                  ? partnerCopy.csvDownloaded
                  : partnerCopy.noExportRows,
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
      {live.partnerGuestsTotalCount > 0 ? (
        <Pagination
          page={live.partnerGuestsPage}
          pageSize={live.partnerGuestsPageSize}
          totalCount={live.partnerGuestsTotalCount}
          hasMore={live.partnerGuestsHasMore}
          onPageChange={(next: number) =>
            live.setPartnerFilters?.({
              partnerGuestsPage: String(next),
              partnerGuestsPageSize: String(live.partnerGuestsPageSize),
            })
          }
          onPageSizeChange={(next: number) =>
            live.setPartnerFilters?.({
              partnerGuestsPage: "1",
              partnerGuestsPageSize: String(next),
            })
          }
        />
      ) : null}
    </div>
  );
}
