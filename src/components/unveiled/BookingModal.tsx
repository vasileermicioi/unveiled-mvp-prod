import { actions } from "astro:actions";
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
import { Button } from "@/components/ui/button";
import { Divider, Panel } from "@/components/ui/unveiled-primitives";
import { ModalShell } from "@/components/unveiled/app-shell";
import { demoModalShell } from "@/lib/app-shell-view-models";
import {
  createIcsObjectUrl,
  isBookingCalendarActionAvailable,
} from "@/lib/calendar";
import type { EventCardView } from "@/lib/unveiled-view-models";
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
    () => (calendarAvailable && calendarMetadata ? createIcsObjectUrl(calendarMetadata) : null),
    [calendarAvailable, calendarMetadata],
  );
  useEffect(() => {
    if (!calendarFile) return;
    return () => {
      window.URL.revokeObjectURL(calendarFile.href);
    };
  }, [calendarFile]);

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
        <div className="lg:col-span-2">
          <div className="mx-auto max-w-5xl space-y-10 text-center">
            <h2 className="headline-xl">
              {result?.state === "waitlist"
                ? copy.waitlistSuccess
                : copy.success}
            </h2>
            <div className="grid gap-6 text-left md:grid-cols-2">
              {result?.state === "confirmed" ? (
                <Panel tone={event.ticketType === "Voucher" ? "dark" : "white"}>
                  <p className="unveiled-meta opacity-55">
                    {event.ticketType === "Voucher"
                      ? copy.ticketCode
                      : copy.passwordToEnter}
                  </p>
                  <p className="mt-6 break-all font-display text-5xl font-black uppercase">
                    {result.code}
                  </p>
                  {result.url ? (
                    <p className="mt-4 break-all text-sm font-bold opacity-65">
                      {result.url}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    className="mt-8"
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
                </Panel>
              ) : (
                <Panel tone="white">
                  <p className="unveiled-meta opacity-55">{copy.waitlist}</p>
                  <p className="headline-md mt-5">{copy.onList}</p>
                  <p className="mt-4 text-sm font-bold opacity-70">
                    {copy.waitlistBody}
                  </p>
                </Panel>
              )}
              {calendarAvailable && calendarMetadata && calendarFile ? (
                <Panel
                  tone="dark"
                  className="flex flex-col justify-between gap-8"
                >
                  <div>
                    <p className="unveiled-meta opacity-55">{copy.saveDate}</p>
                    <p className="headline-md mt-5">{copy.markMoment}</p>
                  </div>
                  <a
                    href={calendarFile.href}
                    download={calendarFile.filename}
                    aria-label={copy.addToCalendar(event.title)}
                    className="inline-flex items-center justify-center gap-2 border-4 border-brand-dark bg-brand-yellow px-5 py-3 text-sm font-black uppercase tracking-widest text-brand-dark shadow-[4px_4px_0_0_#202621] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#202621]"
                  >
                    <Calendar />
                    {copy.sync}
                  </a>
                </Panel>
              ) : null}
            </div>
            <Button type="button" variant="link" onClick={onClose}>
              {copy.returnFeed}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section className="space-y-8">
            <div>
              <p className="unveiled-meta opacity-45">
                {event.category}
                {" // "}
                {event.partnerName}
              </p>
              <h2 className="headline-lg mt-4">{event.title}</h2>
            </div>
            <p className="max-w-2xl text-xl font-bold leading-relaxed opacity-80">
              {event.description}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 border-t-2 border-brand-dark/15 pt-6">
              <div>
                <p className="unveiled-meta opacity-45">
                  {live.profile.language === "DE" ? "ZEITPUNKT" : "WHEN"}
                </p>
                <p className="mt-2 text-2xl font-black uppercase tracking-tight">
                  {event.dateLabel}
                </p>
              </div>
              <div>
                <p className="unveiled-meta opacity-45">{copy.location}</p>
                <p className="mt-2 text-2xl font-black uppercase tracking-tight">
                  {event.address}
                </p>
              </div>
            </div>
            {!isGuest && (
              <Panel tone="cream" shadow={false} className="p-4">
                <p className="unveiled-meta">{copy.gateCopy}</p>
                <p className="mt-2 text-sm font-bold">{copy.gateMessage}</p>
                {result?.state === "failure" ? (
                  <p className="mt-4 border-t-2 border-brand-dark/20 pt-4 text-sm font-black uppercase text-red-700">
                    {result.message}
                    {result.waitlistAvailable ? copy.joinInstead : ""}
                  </p>
                ) : null}
              </Panel>
            )}
          </section>

          {isGuest ? (
            <Panel
              tone="dark"
              className="space-y-8 flex flex-col justify-between"
            >
              <div>
                <p className="unveiled-meta opacity-55 text-white">
                  {live.profile.language === "DE"
                    ? "PREMIUM-ZUGANG"
                    : "PREMIUM ACCESS"}
                </p>
                <p className="headline-md mt-5 text-white">
                  {live.profile.language === "DE"
                    ? "Werde Unveiled-Mitglied, um dieses Event zu buchen."
                    : "Join Unveiled to book this event."}
                </p>
              </div>
              <Button
                type="button"
                variant="yellow"
                className="w-full justify-center"
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
            </Panel>
          ) : (
            <Panel tone="dark" className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <span className="unveiled-meta">{copy.tickets}</span>
                <div className="flex items-center gap-7 font-display text-5xl font-black">
                  <button
                    type="button"
                    onClick={() => setCount(Math.max(1, count - 1))}
                  >
                    <Minus />
                  </button>
                  {count}
                  <button
                    type="button"
                    onClick={() => setCount(Math.min(3, count + 1))}
                  >
                    <Plus />
                  </button>
                </div>
              </div>
              <Divider className="bg-brand-yellow/25" />
              <div className="flex items-end justify-between gap-4">
                <span className="unveiled-meta opacity-55">{copy.total}</span>
                <span className="font-display text-5xl font-black uppercase">
                  {total} credits
                </span>
              </div>
              <Button
                type="button"
                variant="yellow"
                className="w-full"
                disabled={submitting || membershipBlocked}
                onClick={async () => {
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
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : event.remainingCapacity === 0 ? (
                  copy.joinWaitlist
                ) : (
                  copy.confirm
                )}
                <ArrowRight />
              </Button>
            </Panel>
          )}
        </>
      )}
    </ModalShell>
  );
}
