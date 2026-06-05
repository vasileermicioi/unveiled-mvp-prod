import { actions } from "astro:actions";
import { Check, Download, QrCode } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Field,
  Panel,
  SelectInput,
  StatePanel,
  TableRow,
  TableShell,
  TextInput,
} from "@/components/ui/unveiled-primitives";
import {
  downloadCsv,
  GuestRowSkeleton,
  LanguageContext,
  runServerAction,
  StatPanel,
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

  return (
    <div className="space-y-8 py-8">
      <Panel
        tone="white"
        className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end"
      >
        <div>
          <Badge tone="yellow">{copy.partnerPortal}</Badge>
          <h1 className="headline-lg mt-5">
            {live.partner?.name ?? copy.partnerPortal}.
          </h1>
          <p className="mt-3 text-sm font-bold uppercase tracking-widest opacity-55">
            {live.partner?.address ?? copy.addressUnavailable}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatPanel
            label={copy.totalGuests}
            value={live.partnerGuestTotal.replace(" guests", "")}
            caption={copy.acrossSelected}
          />
          <Panel tone="cream" shadow={false} className="p-5">
            <QrCode className="size-8" />
            <p className="mt-4 unveiled-meta">{copy.venueQr}</p>
            {live.partner?.venueQrUrl ? (
              <Button
                type="button"
                variant="copied"
                className="mt-4 w-full h-auto whitespace-normal break-all text-left min-w-0"
              >
                <Check className="shrink-0" />
                <span className="min-w-0 break-all">
                  {live.partner.venueQrUrl}
                </span>
              </Button>
            ) : (
              <Badge tone="white" className="mt-4">
                {copy.missingToken}
              </Badge>
            )}
          </Panel>
        </div>
      </Panel>
      <Panel
        tone="white"
        shadow={false}
        className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <Field label={copy.searchGuests}>
          <TextInput
            placeholder={copy.placeholderSearch}
            value={guestSearch}
            onChange={(event) => setGuestSearch(event.currentTarget.value)}
          />
        </Field>
        <Field label={copy.event}>
          <SelectInput
            value={eventFilter}
            onChange={(event) => setEventFilter(event.currentTarget.value)}
          >
            <option value="">{copy.allEvents}</option>
            {live.partnerEventOptions.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Button
          type="button"
          className="self-end"
          variant="secondary"
          onClick={() =>
            void runServerAction(
              () =>
                actions.getPartnerBookingExportRows({
                  eventId: eventFilter || undefined,
                }),
              setCheckInMessage,
              (data) => {
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
        >
          <Download />
          {copy.downloadCsv}
        </Button>
      </Panel>
      <TableShell>
        {live.isLoading ? (
          <>
            <GuestRowSkeleton />
            <GuestRowSkeleton />
            <GuestRowSkeleton />
          </>
        ) : filteredGuests.length === 0 ? (
          <StatePanel
            title={copy.noGuests}
            text={live.isError ? copy.dataLoadError : copy.emptyStateMessage}
            state={live.isError ? "error" : "empty"}
          />
        ) : (
          filteredGuests.map((guest) => (
            <TableRow
              key={guest.bookingId}
              className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.8fr_auto] md:items-center gap-4"
            >
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 md:hidden">
                  {copy.guest}
                </span>
                <p className="text-sm font-black uppercase tracking-widest">
                  {guest.name}
                </p>
                <p className="text-xs font-bold opacity-55">{guest.email}</p>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 md:hidden">
                  {copy.event}
                </span>
                <p className="text-sm font-bold">{guest.eventTitle}</p>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 md:hidden">
                  {copy.status}
                </span>
                <div>
                  <Badge
                    tone={guest.statusLabel === "Waitlist" ? "grey" : "yellow"}
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
                  </Badge>
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 md:hidden mb-2">
                  {copy.action}
                </span>
                <Button
                  type="button"
                  className="w-full md:w-auto"
                  variant={
                    guest.checkedInLabel === "Checked in" ? "copied" : "primary"
                  }
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
              </div>
            </TableRow>
          ))
        )}
      </TableShell>
      <Panel tone="cream" shadow={false} className="p-4">
        <p className="unveiled-meta">{copy.checkInStatus}</p>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest">
          {checkInMessage}
        </p>
      </Panel>
    </div>
  );
}
