import { actions } from "astro:actions";
import {
  BookingModalActionsPresentational,
  BookingModalFormPresentational,
  BookingModalHeaderPresentational,
  BookingModalSummaryPresentational,
  Button,
  Card,
} from "@unveiled/design-system";
import {
  ArrowRight,
  Calendar,
  Check,
  Copy,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { ModalShell } from "~/components/unveiled/app-shell";
import { demoModalShell } from "~/lib/app-shell-view-models";
import {
  createIcsObjectUrl,
  isBookingCalendarActionAvailable,
} from "~/lib/calendar";
import type { EventCardView } from "~/lib/unveiled-view-models";
import { LanguageContext, useCopy, useLiveData } from "./context";

export function BookingModal({
  event,
  onClose,
}: {
  event: EventCardView;
  onClose: () => void;
}) {
  const language = useContext(LanguageContext);
  const copy = useCopy().booking;
  const live = useLiveData();
  const isGuest = !live.profile.email;
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<
    | null
    | { state: "confirmed"; code: string; url?: string }
    | { state: "waitlist" }
    | { state: "failure"; message: string; waitlistAvailable?: boolean }
  >(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const total = count * event.creditPrice;
  const success = result?.state === "confirmed" || result?.state === "waitlist";
  const membershipBlocked = event.bookingAvailabilityState === "frozen";
  const calendarMetadata = event.calendarMetadata;
  const calendarAvailable = isBookingCalendarActionAvailable(
    result?.state,
    calendarMetadata,
  );
  const calendarFile = useMemo(
    () =>
      calendarAvailable && calendarMetadata
        ? createIcsObjectUrl(calendarMetadata)
        : null,
    [calendarAvailable, calendarMetadata],
  );
  useEffect(() => {
    if (!calendarFile) return;
    return () => {
      window.URL.revokeObjectURL(calendarFile.href);
    };
  }, [calendarFile]);

  const whenLabel = live.profile.language === "DE" ? "ZEITPUNKT" : "WHEN";

  return (
    <ModalShell
      modal={{
        ...demoModalShell,
        heading: event.title,
        metadata: `${event.category} // ${event.partnerName}`,
        layout: success ? "single" : "split",
      }}
      language={language}
      onAction={(actionId) => {
        if (actionId === "close-modal") onClose();
      }}
    >
      {success ? (
        <div className="ui-445032ce">
          <div className="ui-865a86d8">
            <h2 className="headline-xl">
              {result?.state === "waitlist"
                ? copy.waitlistSuccess
                : copy.success}
            </h2>
            <div className="ui-351c5436">
              {result?.state === "confirmed" ? (
                <Card tone={event.ticketType === "Voucher" ? "dark" : "white"}>
                  <p className="unveiled-meta ui-eec042e4">
                    {event.ticketType === "Voucher"
                      ? copy.ticketCode
                      : copy.passwordToEnter}
                  </p>
                  <p className="ui-0513cb90">{result.code}</p>
                  {result.url ? (
                    <p className="ui-aeb30ef2">{result.url}</p>
                  ) : null}
                  <Button
                    type="button"
                    className="ui-c221af54"
                    variant={
                      copied
                        ? "copied"
                        : event.ticketType === "Voucher"
                          ? "yellow"
                          : "primary"
                    }
                    onClick={() => setCopied(true)}
                  >
                    {copied ? <Check /> : <Copy />}
                    {copied ? copy.copied : copy.copyCode}
                  </Button>
                </Card>
              ) : (
                <Card tone="white">
                  <p className="unveiled-meta ui-eec042e4">{copy.waitlist}</p>
                  <p className="headline-md ui-54e0c144">{copy.onList}</p>
                  <p className="ui-ea7cb6d2">{copy.waitlistBody}</p>
                </Card>
              )}
              {calendarAvailable && calendarMetadata && calendarFile ? (
                <Card tone="dark" className="ui-dfdb58aa">
                  <div>
                    <p className="unveiled-meta ui-eec042e4">{copy.saveDate}</p>
                    <p className="headline-md ui-54e0c144">{copy.markMoment}</p>
                  </div>
                  <a
                    href={calendarFile.href}
                    download={calendarFile.filename}
                    aria-label={copy.addToCalendar(event.title)}
                    className="hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#202621] ui-54834532"
                  >
                    <Calendar />
                    {copy.sync}
                  </a>
                </Card>
              ) : null}
            </div>
            <BookingModalActionsPresentational
              returnLabel={copy.returnFeed}
              onReturn={onClose}
            />
          </div>
        </div>
      ) : (
        <>
          <section className="ui-0dcc1c9a">
            <BookingModalHeaderPresentational
              categoryAndPartner={`${event.category} // ${event.partnerName}`}
              title={event.title}
            />
            <BookingModalSummaryPresentational
              description={event.description}
              whenLabel={whenLabel}
              whenValue={event.dateLabel}
              whereLabel={copy.location}
              whereValue={event.address}
            />
            {!isGuest && (
              <Card tone="cream" shadow={false} className="ui-99df8659">
                <p className="unveiled-meta">{copy.gateCopy}</p>
                <p className="ui-a099bead">{copy.gateMessage}</p>
                {result?.state === "failure" ? (
                  <p className="ui-c34a0ad5">
                    {result.message}
                    {result.waitlistAvailable ? copy.joinInstead : ""}
                  </p>
                ) : null}
              </Card>
            )}
          </section>

          {isGuest ? (
            <Card tone="dark" className="ui-c92b7c33">
              <div>
                <p className="unveiled-meta ui-3fd8c8e2">
                  {live.profile.language === "DE"
                    ? "PREMIUM-ZUGANG"
                    : "PREMIUM ACCESS"}
                </p>
                <p className="headline-md ui-fc95d2d8">
                  {live.profile.language === "DE"
                    ? "Werde Unveiled-Mitglied, um dieses Event zu buchen."
                    : "Join Unveiled to book this event."}
                </p>
              </div>
              <Button
                type="button"
                variant="yellow"
                className="ui-76f4751b"
                onClick={() => {
                  const langLower = language.toLowerCase();
                  window.location.assign(
                    `/${langLower}/?callbackURL=${encodeURIComponent(`/${langLower}/discover`)}`,
                  );
                }}
              >
                {live.profile.language === "DE"
                  ? "Jetzt beitreten"
                  : "Join Unveiled to Book"}
                <ArrowRight />
              </Button>
            </Card>
          ) : (
            <BookingModalFormPresentational
              ticketsLabel={copy.tickets}
              totalLabel={copy.total}
              totalValue={`${total} credits`}
              count={count}
              minCount={1}
              maxCount={3}
              submitLabel={
                submitting
                  ? ""
                  : event.remainingCapacity === 0
                    ? copy.joinWaitlist
                    : copy.confirm
              }
              submitting={submitting}
              disabled={membershipBlocked}
              minusIcon={<Minus />}
              plusIcon={<Plus />}
              spinnerIcon={<Loader2 />}
              trailingIcon={<ArrowRight />}
              onDecrement={() =>
                setCount((current) => Math.max(1, current - 1))
              }
              onIncrement={() =>
                setCount((current) => Math.min(3, current + 1))
              }
              onSubmit={async () => {
                setResult(null);
                setCopied(false);
                if (membershipBlocked) {
                  setResult({
                    state: "failure",
                    message: event.membershipCta ?? copy.membershipRequired,
                  });
                  return;
                }
                setSubmitting(true);
                const response =
                  event.remainingCapacity === 0
                    ? await actions.joinWaitlist({
                        eventId: event.id,
                        ticketQuantity: count,
                      })
                    : await actions.bookEvent({
                        eventId: event.id,
                        ticketQuantity: count,
                        idempotencyKey: crypto.randomUUID(),
                      });

                setSubmitting(false);
                if (response.error || !response.data) {
                  setResult({
                    state: "failure",
                    message: copy.requestFailed,
                  });
                  return;
                }

                if (!response.data.ok) {
                  setResult({
                    state: "failure",
                    message: response.data.formError ?? copy.checkFields,
                    waitlistAvailable: event.remainingCapacity === 0,
                  });
                  return;
                }

                const data = response.data.data;
                if (data?.state === "confirmed") {
                  live.refetchActiveSurface();
                  setResult({
                    state: "confirmed",
                    code: data.redemption.code,
                    url: data.redemption.url,
                  });
                  return;
                }

                if (data?.state === "waitlist") {
                  live.refetchActiveSurface();
                  setResult({ state: "waitlist" });
                }
              }}
            />
          )}
        </>
      )}
    </ModalShell>
  );
}
